import { mediaPath, type ProjectMedia } from "@/lib/projects";
export function ProjectVideo({ media, mime, coverId, preview = false }: { media: ProjectMedia; mime: string; coverId: string; preview?: boolean }) {
  const posterId = media.posterId || coverId;
  return <video controls playsInline preload="none" aria-label={media.alt || "ویدیوی پروژه"} poster={posterId ? mediaPath(posterId, preview) : undefined} className="aspect-video w-full rounded-xl bg-ink">
    <source src={mediaPath(media.id, preview)} type={mime} />
    {media.captions && <track default kind="captions" srcLang="fa" label="فارسی" src={`${mediaPath(media.id, preview)}/captions`} />}
    <p>مرورگر شما پخش این ویدیو را پشتیبانی نمی‌کند. <a href={mediaPath(media.id, preview)}>دریافت ویدیو</a></p>
  </video>;
}
