import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProjectCards } from "@/components/portfolio/ProjectCards";
import { listProjects } from "@/lib/server/projects";
export async function ServiceProjects({ path, title }: { path: string; title: string }) {
  let result;
  try { result = await listProjects({ service: path, limit: 3 }); }
  catch { return <section className="home-section"><Container><h2 className="home-title font-bold">نمونه‌کارهای {title}</h2><p className="mt-4 text-sm leading-8 text-muted">بارگذاری پروژه‌ها کامل نشد. <Link className="text-accent underline" href={`/portfolio?service=${encodeURIComponent(path)}`}>دوباره در فهرست نمونه‌کارها بررسی کنید.</Link></p></Container></section>; }
  if (!result.items.length) return null;
  return <section id="projects" className="home-section scroll-mt-32"><Container><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="home-title font-bold">نمونه‌کارهای {title}</h2><Link className="inline-flex min-h-11 items-center text-sm text-accent" href={`/portfolio?service=${encodeURIComponent(path)}`}>همهٔ نمونه‌کارهای این حوزه</Link></div><ProjectCards projects={result.items} /></Container></section>;
}
