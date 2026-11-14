import "server-only";
import mongoose from "mongoose";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";
import connect from "@/lib/server/db";
import Project from "@/models/Project";
import { ProjectError } from "@/lib/server/project-errors";
import { mediaIdPattern, projectImageLimit, projectVideoLimit, projectAssetLimit, type MediaAsset, type ProjectInput } from "@/lib/projects";
import { acquireProjectLease, releaseProjectLease } from "@/lib/server/project-lock";

const bucketName = "projectMedia";
async function bucket() { await connect(); return new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName }); }
const objectId = (id: string) => new mongoose.mongo.ObjectId(id);
function asset(file: mongoose.mongo.GridFSFile): MediaAsset {
  const meta = file.metadata!;
  return { id: file._id.toString(), name: meta.name, kind: meta.kind, mime: meta.mime, bytes: file.length, width: meta.width || 0, height: meta.height || 0, uploadedAt: file.uploadDate.toISOString() };
}
export async function assetList(projectId: string) {
  const store = await bucket();
  return (await store.find({ "metadata.projectId": projectId }).sort({ uploadDate: 1 }).limit(projectAssetLimit).toArray()).map(asset);
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
  let size = 0, upload: mongoose.mongo.GridFSBucketWriteStream | undefined;
  async function* chunks() {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > limit) throw new ProjectError("حجم فایل بیش از حد مجاز است.", 413);
      yield Buffer.from(value);
    }
  }
  try {
    await mongoose.connection.db!.collection(`${bucketName}.files`).createIndex({ "metadata.projectId": 1, uploadDate: 1 });
    if ((await store.find({ "metadata.projectId": projectId }).limit(projectAssetLimit).toArray()).length >= projectAssetLimit) throw new ProjectError("حداکثر ۳۲ فایل برای هر پروژه قابل بارگذاری است.");
    let source: Readable, width = 0, height = 0;
    let outputMime = mime;
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
      width = result.info.width; height = result.info.height; outputMime = "image/webp"; source = Readable.from([result.data]);
    } else {
      const iterator = chunks(), prefix: Buffer[] = []; let prefixSize = 0;
      while (prefixSize < 32) { const next = await iterator.next(); if (next.done) break; prefix.push(next.value); prefixSize += next.value.length; }
      const signature = Buffer.concat(prefix);
      if (!(mime === "video/mp4" ? signature.length >= 16 && signature.toString("ascii", 4, 8) === "ftyp" : signature.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])))) throw new ProjectError("محتوای ویدیو با فرمت انتخاب‌شده مطابقت ندارد.", 415);
      source = Readable.from((async function* () { yield signature; for await (const chunk of iterator) yield chunk; })());
    }
    upload = store.openUploadStream(name, { metadata: { projectId, uploadedBy: userId, kind: image ? "image" : "video", mime: outputMime, name, width, height } });
    await pipeline(source, upload, { signal: request.signal });
    const file = await store.find({ _id: upload.id }).next();
    if (!file) throw new ProjectError("ذخیرهٔ فایل کامل نشد.", 503);
    return asset(file);
  } catch (error) {
    await reader.cancel().catch(() => {});
    if (upload) { await upload.abort().catch(() => {}); await store.delete(upload.id).catch(() => {}); }
    if (error instanceof ProjectError) throw error;
    if (request.signal.aborted) throw new ProjectError("بارگذاری لغو شد.", 499);
    throw new ProjectError("فایل قابل پردازش نیست؛ فرمت و اندازهٔ آن را بررسی کنید.", 422);
  } finally { reader.releaseLock(); await releaseProjectLease(projectId, lease); }
}
export async function serveProjectAsset(request: Request, id: string, privateAccess = false) {
  const denied = () => new Response(null, { status: 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  if (!mediaIdPattern.test(id) || !process.env.MONGODB_URI) return denied();
  const store = await bucket(), file = await store.find({ _id: objectId(id) }).next();
  if (!file) return denied();
  if (!privateAccess && !await Project.exists({ status: "published", $or: [{ coverId: id }, { "media.id": id }, { "media.posterId": id }] })) return denied();
  let start = 0, end = file.length - 1, status = 200;
  const headers = new Headers({ "Content-Type": file.metadata!.mime, "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes", "Cache-Control": privateAccess ? "private, no-store" : "public, max-age=300, must-revalidate", "Content-Security-Policy": "default-src 'none'; sandbox" });
  if (privateAccess) headers.set("X-Robots-Tag", "noindex, nofollow");
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { ...Object.fromEntries(headers), "Content-Range": `bytes */${file.length}` } });
    if (!match[1]) start = Math.max(0, file.length - Number(match[2]));
    else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= file.length) return new Response(null, { status: 416, headers: { ...Object.fromEntries(headers), "Content-Range": `bytes */${file.length}` } });
    status = 206; headers.set("Content-Range", `bytes ${start}-${end}/${file.length}`);
  }
  headers.set("Content-Length", String(end - start + 1));
  if (request.method === "HEAD") return new Response(null, { status, headers });
  const stream = store.openDownloadStream(file._id, { start, end: end + 1 });
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
  const store = await bucket();
  const file = await store.find({ _id: objectId(id) }).next();
  if (!file) return;
  const lease = await acquireProjectLease(file.metadata!.projectId);
  try {
    if (await Project.exists({ $or: [{ coverId: id }, { "media.id": id }, { "media.posterId": id }] })) throw new ProjectError("این فایل در نسخهٔ ذخیره‌شده استفاده می‌شود. ابتدا آن را از پروژه جدا و تغییرات را ذخیره کنید.", 409);
    await store.delete(file._id);
  } finally { await releaseProjectLease(file.metadata!.projectId, lease); }
}
