import "server-only";
import mongoose from "mongoose";
import { Readable } from "node:stream";
import { finished, pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, open, rmdir, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import connect from "@/lib/server/db";
import Project from "@/models/Project";
import ProjectMedia, { type ProjectMediaRecord } from "@/models/ProjectMedia";
import { ProjectError } from "@/lib/server/project-errors";
import { mediaIdPattern, projectImageLimit, projectVideoLimit, projectAssetLimit, type MediaAsset, type ProjectInput } from "@/lib/projects";
import { acquireProjectLease, releaseProjectLease } from "@/lib/server/project-lock";
import { localProjectAsset, localProjectAssets } from "@/lib/project-assets";
import { objectStorage, putStoredObject, getStoredObject, headStoredObject, deleteStoredObject, storageObjectMissing } from "@/lib/server/object-storage";

const bucketName = "projectMedia";
async function bucket() { await connect(); return new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName }); }
const objectId = (id: string) => new mongoose.mongo.ObjectId(id);
function asset(file: mongoose.mongo.GridFSFile): MediaAsset {
  const meta = file.metadata!;
  return { id: file._id.toString(), name: meta.name, kind: meta.kind, mime: meta.mime, bytes: file.length, width: meta.width || 0, height: meta.height || 0, uploadedAt: file.uploadDate.toISOString() };
}
function cloudAsset(file: ProjectMediaRecord & { _id: mongoose.Types.ObjectId }): MediaAsset {
  return { id: file._id.toString(), name: file.name, kind: file.kind, mime: file.mime, bytes: file.bytes, width: file.width, height: file.height, uploadedAt: file.createdAt.toISOString() };
}
export async function assetList(projectId: string, referencedIds?: ReadonlySet<string>) {
  const local = localProjectAssets(projectId);
  if (referencedIds && [...referencedIds].every(id => local.some(asset => asset.id === id))) return local.filter(asset => referencedIds.has(asset.id));
  if (local.length >= projectAssetLimit) return local.slice(0, projectAssetLimit);
  const store = await bucket();
  const [legacy, uploaded] = await Promise.all([
    store.find({ "metadata.projectId": projectId }).sort({ uploadDate: 1 }).limit(projectAssetLimit).toArray(),
    ProjectMedia.find({ projectId }).sort({ createdAt: 1 }).limit(projectAssetLimit).lean(),
  ]);
  const files = [...legacy.map(asset), ...uploaded.map(cloudAsset)].sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
  return [...local, ...files].slice(0, projectAssetLimit);
}
export async function validateProjectAssets(projectId: string, project: ProjectInput) {
  const ids = [...new Set([project.coverId, ...project.media.flatMap(item => [item.id, item.posterId])].filter(Boolean))];
  if (!ids.length) return;
  const files = await assetList(projectId), byId = new Map(files.map(file => [file.id, file]));
  if (ids.some(id => !byId.has(id))) throw new ProjectError("بعضی فایل‌ها پیدا نشدند یا متعلق به این پروژه نیستند.", 422, { media: "رسانه‌ها را دوباره بررسی کنید." });
  if (project.coverId && byId.get(project.coverId)?.kind !== "image") throw new ProjectError("جلد پروژه باید تصویر باشد.", 422, { coverId: "یک تصویر انتخاب کنید." });
  for (const media of project.media) {
    if (media.posterId && byId.get(media.posterId)?.kind !== "image") throw new ProjectError("پوستر ویدیو باید تصویر باشد.", 422, { media: "پوستر را بررسی کنید." });
    if (project.status === "published" && !media.alt) throw new ProjectError("توضیح تصویر یا عنوان ویدیو را برای تمام رسانه‌ها وارد کنید.", 422, { media: "توضیح رسانه‌ها را کامل کنید." });
  }
}
export async function uploadProjectAsset(request: Request, projectId: string, userId: string) {
  // Never silently write new binaries to MongoDB when cloud configuration is absent.
  const storage = objectStorage();
  const store = await bucket();
  if (!await Project.exists({ publicId: projectId })) throw new ProjectError("ابتدا پیش‌نویس پروژه را ذخیره کنید.", 404);
  const mime = request.headers.get("content-type")?.split(";")[0] || "";
  const image = ["image/png", "image/jpeg", "image/webp"].includes(mime);
  if (!image && !["video/mp4", "video/webm"].includes(mime)) throw new ProjectError("فرمت مجاز: PNG، JPEG، WebP، MP4 و WebM.", 415);
  const limit = image ? projectImageLimit : projectVideoLimit;
  if (Number(request.headers.get("content-length") || 0) > limit) throw new ProjectError("حجم فایل بیش از حد مجاز است.", 413);
  if (!request.body) throw new ProjectError("فایلی دریافت نشد.");
  let name = "رسانهٔ پروژه";
  try { name = decodeURIComponent(request.headers.get("x-file-name") || "").replace(/[\x00-\x1f\\/]/g, "").slice(0, 180) || name; } catch {}
  const reader = request.body.getReader();
  let lease: Date;
  try { lease = await acquireProjectLease(projectId); }
  catch (error) { await reader.cancel(); reader.releaseLock(); throw error; }
  let size = 0, temporaryDirectory = "", temporaryFile = "", videoSource: ReturnType<typeof createReadStream> | undefined;
  let uploaded: { bucket: string; key: string } | undefined;
  let metadataId: mongoose.Types.ObjectId | undefined;
  let stage: "processing" | "storage" | "metadata" = "processing";
  const cancelReader = () => { void reader.cancel().catch(() => {}); };
  request.signal.addEventListener("abort", cancelReader, { once: true });
  async function* chunks() {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      request.signal.throwIfAborted();
      size += value.length;
      if (size > limit) throw new ProjectError("حجم فایل بیش از حد مجاز است.", 413);
      yield Buffer.from(value);
    }
  }
  try {
    if (!await Project.exists({ publicId: projectId, deletionRequestedAt: null })) throw new ProjectError("حذف این پروژه در حال تکمیل است؛ امکان بارگذاری فایل جدید وجود ندارد.", 409);
    await ProjectMedia.init();
    const [legacyCount, uploadedCount] = await Promise.all([
      store.find({ "metadata.projectId": projectId }).limit(projectAssetLimit).toArray(),
      ProjectMedia.countDocuments({ projectId }),
    ]);
    if (legacyCount.length + uploadedCount + localProjectAssets(projectId).length >= projectAssetLimit) throw new ProjectError("حداکثر ۳۲ فایل برای هر پروژه قابل بارگذاری است.");
    let source: Buffer | Readable, width = 0, height = 0, outputBytes = 0;
    let outputMime: ProjectMediaRecord["mime"] = image ? "image/webp" : mime === "video/mp4" ? "video/mp4" : "video/webm";
    if (image) {
      const buffers: Buffer[] = []; for await (const chunk of chunks()) buffers.push(chunk);
      if (!size) throw new ProjectError("فایل خالی است.");
      const input = Buffer.concat(buffers);
      const png = input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const jpeg = input.length > 3 && input[0] === 255 && input[1] === 216 && input[2] === 255;
      const webp = input.toString("ascii", 0, 4) === "RIFF" && input.toString("ascii", 8, 12) === "WEBP";
      if (!png && !jpeg && !webp) throw new ProjectError("محتوای فایل تصویر با فرمت‌های مجاز مطابقت ندارد.", 415);
      const decoder = sharp(input, { limitInputPixels: 24000000, animated: false });
      const meta = await decoder.metadata();
      if (!["png", "jpeg", "webp"].includes(meta.format || "") || (meta.pages || 1) > 1) throw new ProjectError("یک تصویر ثابت با فرمت مجاز انتخاب کنید.");
      const result = await decoder.rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toBuffer({ resolveWithObject: true });
      width = result.info.width; height = result.info.height; outputMime = "image/webp"; source = result.data; outputBytes = result.data.length;
    } else {
      // Disk spooling bounds memory and supplies an exact length for S3-compatible PUT.
      temporaryDirectory = await mkdtemp(join(tmpdir(), "toplinksho-upload-"));
      temporaryFile = join(temporaryDirectory, "body");
      await pipeline(Readable.from(chunks()), createWriteStream(temporaryFile, { flags: "wx", mode: 0o600 }), { signal: request.signal });
      const handle = await open(temporaryFile, "r");
      const prefix = Buffer.alloc(32);
      let prefixSize = 0;
      try { prefixSize = (await handle.read(prefix, 0, 32, 0)).bytesRead; } finally { await handle.close(); }
      const signature = prefix.subarray(0, prefixSize);
      if (!(mime === "video/mp4" ? signature.length >= 16 && signature.toString("ascii", 4, 8) === "ftyp" : signature.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])))) throw new ProjectError("محتوای ویدیو با فرمت انتخاب‌شده مطابقت ندارد.", 415);
      videoSource = createReadStream(temporaryFile); source = videoSource; outputBytes = size;
    }
    request.signal.throwIfAborted();
    const id = new mongoose.Types.ObjectId(); metadataId = id;
    uploaded = { bucket: storage.bucket, key: `${storage.keyPrefix}/${projectId}/${id.toString()}.${image ? "webp" : mime === "video/mp4" ? "mp4" : "webm"}` };
    stage = "storage";
    await putStoredObject(uploaded, source, outputBytes, outputMime, request.signal);
    request.signal.throwIfAborted();
    stage = "metadata";
    const record = await ProjectMedia.create({ _id: id, projectId, ...uploaded, uploadedBy: userId, kind: image ? "image" : "video", mime: outputMime, name, bytes: outputBytes, width, height });
    return cloudAsset(record.toObject());
  } catch (error) {
    await reader.cancel().catch(() => {});
    let preserveObject = false;
    // A lost Mongo acknowledgement does not prove the metadata write failed.
    if (stage === "metadata" && metadataId) {
      try {
        const saved = await ProjectMedia.findById(metadataId).lean();
        if (saved) return cloudAsset(saved);
      } catch { preserveObject = true; }
    }
    // Object keys are unique to this attempt; rollback never touches an existing asset.
    if (uploaded && !preserveObject) await deleteStoredObject(uploaded).catch(() => {});
    if (error instanceof ProjectError) throw error;
    if (request.signal.aborted) throw new ProjectError("بارگذاری لغو شد.", 499);
    if (stage !== "processing") throw new ProjectError("ذخیرهٔ فایل انجام نشد. اتصال، دسترسی و تنظیمات باکت آپلود را بررسی و دوباره تلاش کنید.", 503);
    throw new ProjectError("فایل قابل پردازش نیست؛ فرمت و اندازهٔ آن را بررسی کنید.", 422);
  } finally {
    request.signal.removeEventListener("abort", cancelReader);
    reader.releaseLock();
    if (videoSource) { videoSource.destroy(); await finished(videoSource, { cleanup: true }).catch(() => {}); }
    if (temporaryFile) await unlink(temporaryFile).catch(() => {});
    if (temporaryDirectory) await rmdir(temporaryDirectory).catch(() => {});
    await releaseProjectLease(projectId, lease);
  }
}
export async function serveProjectAsset(request: Request, id: string, privateAccess = false) {
  const denied = () => new Response(null, { status: 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  if (!mediaIdPattern.test(id) || !process.env.MONGODB_URI) return denied();
  await connect();
  const cloud = await ProjectMedia.findById(id).select("+bucket +key").lean();
  const store = cloud ? undefined : await bucket();
  const legacy = store ? await store.find({ _id: objectId(id) }).next() : null;
  if (!cloud && !legacy) return denied();
  const projectId = cloud?.projectId || legacy!.metadata!.projectId;
  if (!privateAccess && !await Project.exists({ publicId: projectId, status: "published", $or: [{ coverId: id }, { "media.id": id }, { "media.posterId": id }] })) return denied();
  const bytes = cloud?.bytes || legacy!.length, mime = cloud?.mime || legacy!.metadata!.mime;
  let start = 0, end = bytes - 1, status = 200;
  const headers = new Headers({ "Content-Type": mime, "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes", "Cache-Control": privateAccess ? "private, no-store" : "public, max-age=300, must-revalidate", "Content-Security-Policy": "default-src 'none'; sandbox" });
  if (privateAccess) headers.set("X-Robots-Tag", "noindex, nofollow");
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { ...Object.fromEntries(headers), "Content-Range": `bytes */${bytes}` } });
    if (!match[1]) start = Math.max(0, bytes - Number(match[2]));
    else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= bytes) return new Response(null, { status: 416, headers: { ...Object.fromEntries(headers), "Content-Range": `bytes */${bytes}` } });
    status = 206; headers.set("Content-Range", `bytes ${start}-${end}/${bytes}`);
  }
  headers.set("Content-Length", String(end - start + 1));
  if (cloud) {
    try {
      if (request.method === "HEAD") { await headStoredObject(cloud, request.signal); return new Response(null, { status, headers }); }
      const result = await getStoredObject(cloud, status === 206 ? `bytes=${start}-${end}` : undefined, request.signal);
      if (!result.Body) return denied();
      return new Response(result.Body.transformToWebStream(), { status, headers });
    } catch (error) {
      if (storageObjectMissing(error)) return denied();
      return new Response(null, { status: request.signal.aborted ? 499 : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
    }
  }
  if (request.method === "HEAD") return new Response(null, { status, headers });
  const stream = store!.openDownloadStream(legacy!._id, { start, end: end + 1 });
  const abort = () => stream.destroy();
  request.signal.addEventListener("abort", abort, { once: true });
  stream.once("close", () => request.signal.removeEventListener("abort", abort));
  if (request.signal.aborted) stream.destroy();
  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, { status, headers });
}
export async function serveProjectCaptions(id: string, privateAccess = false) {
  if (!mediaIdPattern.test(id) || !process.env.MONGODB_URI) return new Response(null, { status: 404 });
  await connect();
  const project = await Project.findOne({ ...(privateAccess ? {} : { status: "published" }), "media.id": id }).select("media").lean();
  const text = project?.media.find(item => item.id === id)?.captions;
  if (!text) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  return new Response(text, { headers: { "Content-Type": "text/vtt; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...(privateAccess ? { "X-Robots-Tag": "noindex" } : {}) } });
}
export async function removeUnusedAsset(id: string) {
  if (!mediaIdPattern.test(id)) throw new ProjectError("فایل پیدا نشد.", 404);
  if (localProjectAsset(id)) throw new ProjectError("این تصویر یک فایل محلی در public است. می‌توانید آن را از گالری جدا کنید؛ حذف فایل محلی از پنل انجام نمی‌شود.", 409);
  await connect();
  const cloud = await ProjectMedia.findById(id).select("+bucket +key").lean();
  const store = cloud ? undefined : await bucket();
  const file = store ? await store.find({ _id: objectId(id) }).next() : null;
  if (!file && !cloud) return;
  const projectId = cloud?.projectId || file!.metadata!.projectId;
  const lease = await acquireProjectLease(projectId);
  try {
    if (await Project.exists({ $or: [{ coverId: id }, { "media.id": id }, { "media.posterId": id }] })) throw new ProjectError("این فایل در نسخهٔ ذخیره‌شده استفاده می‌شود. ابتدا آن را از پروژه جدا و تغییرات را ذخیره کنید.", 409);
    if (cloud) {
      try { await deleteStoredObject(cloud); }
      catch { throw new ProjectError("حذف فایل از فضای ذخیره‌سازی انجام نشد. تنظیمات باکت را بررسی و دوباره تلاش کنید.", 503); }
      await ProjectMedia.deleteOne({ _id: cloud._id, projectId });
    } else { await store!.delete(file!._id); }
  } finally { await releaseProjectLease(projectId, lease); }
}

/** Caller holds the project lease and has durably marked the project for deletion. */
export async function deleteProjectAssets(projectId: string, signal: AbortSignal) {
  await connect();
  const store = await bucket();
  const uploaded = await ProjectMedia.find({ projectId }).select("+bucket +key").lean();
  const legacy = await store.find({ "metadata.projectId": projectId }).toArray();
  const referencedElsewhere = (id: string) => Project.exists({ publicId: { $ne: projectId }, $or: [{ coverId: id }, { "media.id": id }, { "media.posterId": id }] });
  // The registry of shared CDN artwork is deliberately excluded from this cleanup.
  for (const file of uploaded) {
    signal.throwIfAborted();
    if (await referencedElsewhere(file._id.toString())) throw new ProjectError("یکی از فایل‌ها به پروژهٔ دیگری متصل است؛ ابتدا ارتباط آن را بررسی کنید.", 409);
    try { await deleteStoredObject(file, signal); }
    catch (error) { if (!storageObjectMissing(error)) throw error; }
    await ProjectMedia.deleteOne({ _id: file._id, projectId });
  }
  for (const file of legacy) {
    signal.throwIfAborted();
    if (await referencedElsewhere(file._id.toString())) throw new ProjectError("یکی از فایل‌ها به پروژهٔ دیگری متصل است؛ ابتدا ارتباط آن را بررسی کنید.", 409);
    await store.delete(file._id);
  }
}
