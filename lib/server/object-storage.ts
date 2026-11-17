import "server-only";
import { createHash } from "node:crypto";
import type { Readable } from "node:stream";
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ProjectError } from "@/lib/server/project-errors";

type ObjectLocation = { bucket: string; key: string };
let connection: { signature: string; client: S3Client; bucket: string; keyPrefix: string } | undefined;

/** Only the server receives credentials. Never expose object keys to the client. */
export function objectStorage() {
  const required = ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const;
  const missing = required.filter(name => !process.env[name]?.trim());
  if (missing.length) throw new ProjectError(`فضای آپلود هنوز تنظیم نشده است. مقادیر ${missing.join("، ")} را در محیط سرور وارد کنید.`, 503);
  let endpoint: URL;
  try { endpoint = new URL(process.env.S3_ENDPOINT!); }
  catch { throw new ProjectError("S3_ENDPOINT باید آدرس کامل سرویس S3 لیارا باشد.", 503); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname);
  if ((endpoint.protocol !== "https:" && !(local && endpoint.protocol === "http:")) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new ProjectError("S3_ENDPOINT باید آدرس HTTPS سرویس S3 لیارا باشد؛ دامنهٔ عمومی تصاویر را وارد نکنید.", 503);
  }
  const bucket = process.env.S3_BUCKET!.trim();
  if (/[\s/\\]/.test(bucket)) throw new ProjectError("S3_BUCKET باید نام باکت آپلود باشد، بدون مسیر یا دامنه.", 503);
  const keyPrefix = (process.env.S3_KEY_PREFIX?.trim() || "toplinksho/projects").replace(/^\/+|\/+$/g, "");
  if (!keyPrefix || /[\\\x00-\x1f?#]/.test(keyPrefix) || keyPrefix.split("/").some(part => !part || part === "." || part === "..")) throw new ProjectError("S3_KEY_PREFIX باید مسیر پوشهٔ پروژه‌ها در باکت باشد، مانند toplinksho/projects.", 503);
  const options = {
    endpoint: endpoint.href,
    region: process.env.S3_REGION?.trim() || "us-east-1",
    bucket,
    keyPrefix,
    accessKeyId: process.env.S3_ACCESS_KEY_ID!.trim(),
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!.trim(),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  };
  const signature = createHash("sha256").update(JSON.stringify(options)).digest("hex");
  if (connection?.signature !== signature) {
    connection?.client.destroy();
    connection = {
      signature, bucket, keyPrefix,
      client: new S3Client({
        endpoint: options.endpoint, region: options.region, forcePathStyle: options.forcePathStyle,
        credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
        maxAttempts: 2, requestHandler: { connectionTimeout: 10000, requestTimeout: 120000 },
        // Avoid aws-chunked checksum trailers unsupported by some S3-compatible hosts.
        requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED",
      }),
    };
  }
  return connection!;
}

export async function putStoredObject(location: ObjectLocation, body: Buffer | Readable, bytes: number, mime: string, signal: AbortSignal) {
  const { client } = objectStorage();
  await client.send(new PutObjectCommand({ Bucket: location.bucket, Key: location.key, Body: body, ContentLength: bytes, ContentType: mime, CacheControl: "private, no-store", ACL: "private" }), { abortSignal: signal });
}
export async function getStoredObject(location: ObjectLocation, range: string | undefined, signal: AbortSignal) {
  return objectStorage().client.send(new GetObjectCommand({ Bucket: location.bucket, Key: location.key, ...(range ? { Range: range } : {}) }), { abortSignal: signal });
}
export async function headStoredObject(location: ObjectLocation, signal: AbortSignal) {
  return objectStorage().client.send(new HeadObjectCommand({ Bucket: location.bucket, Key: location.key }), { abortSignal: signal });
}
export async function deleteStoredObject(location: ObjectLocation, signal?: AbortSignal) {
  await objectStorage().client.send(new DeleteObjectCommand({ Bucket: location.bucket, Key: location.key }), { abortSignal: signal });
}
export function storageObjectMissing(error: unknown) {
  const value = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return ["NoSuchKey", "NotFound"].includes(value.name || "") || value.$metadata?.httpStatusCode === 404;
}
