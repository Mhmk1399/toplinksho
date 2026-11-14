import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PublicFrame } from "@/components/content/PublicFrame";
import { Container } from "@/components/ui/Container";
import { SectionNav } from "@/components/shared/SectionNav";
import { FaqBlock, PageCTA } from "@/components/content/ContentBlocks";
import { mediaPath, projectPath, type ProjectView } from "@/lib/projects";
import { projectSchema } from "@/lib/project-seo";
import { findServicePage } from "@/lib/page-registry";
import { ProjectVideo } from "@/components/portfolio/ProjectVideo";
function Paragraphs({ text }: { text: string }) { return <div className="space-y-4 text-sm leading-9 text-muted">{text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p className="whitespace-pre-line break-words" key={index}>{paragraph}</p>)}</div>; }
export function ProjectDetail({ project, preview = false }: { project: ProjectView; preview?: boolean }) {
  const path = projectPath(project.slug);
  const sections = [{ heading: "نیاز و چالش پروژه", body: project.challenge, bullets: [] }, { heading: "راهکار و مسیر اجرا", body: project.solution, bullets: [] }, ...project.sections, { heading: "خروجی و دستاوردها", body: project.outcome, bullets: [] }].filter(section => section.body || section.bullets.length);
  return <PublicFrame page={{ path, title: project.title, description: project.summary || "معرفی پروژه", image: project.coverId ? mediaPath(project.coverId, preview) : "/images/hero-services.png", imageAlt: project.coverAlt, imageUnoptimized: preview, eyebrow: "نمونه‌کار تاپ لینک شو" }} schema={false} breadcrumbs={[{ title: "صفحه اصلی", path: "/" }, { title: "نمونه‌کارها", path: "/portfolio" }, { title: project.title, path }]} secondary={{ label: "جزئیات پروژه", href: "#overview" }}>
    {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema(project)).replace(/</g, "\\u003c") }} />}
    {preview && <Container><p className="mb-5 rounded-2xl border border-accent/30 bg-panel p-4 text-sm leading-8 text-accent">پیش‌نمایش خصوصی؛ فقط نسخهٔ ذخیره‌شده را می‌بینید. <Link href={`/admin/projects/${project.id}`} className="underline">بازگشت به ویرایش</Link></p></Container>}
    <SectionNav items={[{ id: "overview", label: "دربارهٔ پروژه" }, ...(project.media.length ? [{ id: "gallery", label: "تصاویر و ویدیوها" }] : []), ...(project.faq.length ? [{ id: "faq", label: "پرسش‌ها" }] : [])]} />
    <section id="overview" className="home-section scroll-mt-32"><Container><div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-10">{sections.map((section, index) => <section key={index}><h2 className="home-title mb-4 font-bold">{section.heading}</h2><Paragraphs text={section.body} />{section.bullets.length > 0 && <ul className="mt-4 list-disc space-y-2 ps-5 text-sm leading-8 text-muted">{section.bullets.map((item, index) => <li key={index}>{item}</li>)}</ul>}</section>)}</div>
      <aside className="neon-surface p-6"><h2 className="route-card-title mb-5 font-bold">شناسنامهٔ پروژه</h2><dl className="space-y-4 text-sm">{[["کارفرما", project.client], ["حوزهٔ فعالیت", project.industry], ["زمان اجرا", project.year], ["مدت همکاری", project.duration]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-3 border-b border-line pb-3"><dt className="text-muted">{label}</dt><dd>{value}</dd></div>)}</dl><h3 className="mt-6 text-sm font-bold">خدمات مرتبط</h3><ul className="mt-3 space-y-2">{project.services.map(path => <li key={path}><Link href={path} className="inline-flex min-h-11 items-center text-sm text-accent">{findServicePage(path)?.title}</Link></li>)}</ul>{project.technologies.length > 0 && <><h3 className="mt-5 text-sm font-bold">ابزارها و فناوری‌ها</h3><p className="mt-3 text-sm leading-8 text-muted">{project.technologies.join("، ")}</p></>}{project.tags.length > 0 && <p className="mt-5 text-xs leading-8 text-muted">{project.tags.join(" · ")}</p>}{project.website && <a href={project.website} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-accent">مشاهدهٔ وب‌سایت پروژه<ExternalLink size={15} aria-hidden="true" /></a>}</aside>
    </div></Container></section>
    {project.media.length > 0 && <section id="gallery" className="home-section scroll-mt-32 border-y border-line"><Container><h2 className="home-title mb-7 font-bold">تصاویر و ویدیوهای پروژه</h2><div className="grid items-start gap-6 sm:grid-cols-2">{project.media.map(item => {
      const asset = project.assets.find(asset => asset.id === item.id); if (!asset) return null;
      return <figure key={item.id} className="overflow-hidden rounded-3xl border border-line bg-panel">{asset.kind === "image" ? <Image src={mediaPath(item.id, preview)} alt={item.alt} width={asset.width} height={asset.height} unoptimized={preview} sizes="(max-width: 639px) 92vw, 600px" loading="lazy" className="h-auto w-full" /> : <ProjectVideo media={item} mime={asset.mime} coverId={project.coverId} preview={preview} />}{(item.caption || asset.kind === "video") && <figcaption className="p-4 text-sm leading-8 text-muted">{item.caption || item.alt}{asset.kind === "video" && <a className="mt-2 block text-accent underline" href={mediaPath(item.id, preview)} download>دریافت ویدیو</a>}</figcaption>}</figure>;
    })}</div></Container></section>}
    <FaqBlock items={project.faq} title="پرسش‌های رایج پروژه" /><PageCTA />
  </PublicFrame>;
}
