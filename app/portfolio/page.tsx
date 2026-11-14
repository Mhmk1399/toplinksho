import { Select } from "@/components/ui/Select";
import Link from "next/link";
import content from "@/content/portfolio.fa.json";
import { PublicFrame } from "@/components/content/PublicFrame";
import { Container } from "@/components/ui/Container";
import { ProjectCards } from "@/components/portfolio/ProjectCards";
import { listProjects, projectServices } from "@/lib/server/projects";
import { pageMetadata, absoluteUrl, indexable } from "@/lib/seo";
import { buttonClasses } from "@/components/ui/Button";
import { projectPath } from "@/lib/projects";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; page?: string }>;
}) {
  const query = await searchParams,
    metadata = pageMetadata("/portfolio");
  if (query.service || query.page)
    metadata.robots = { index: false, follow: indexable };
  return metadata;
}
export default async function Portfolio({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; page?: string }>;
}) {
  const query = await searchParams,
    service = projectServices.some((item) => item.path === query.service)
      ? query.service
      : "";
  const result = await listProjects({ service, page: Number(query.page || 1) });
  const url = (page: number) =>
    "/portfolio?" +
    new URLSearchParams({
      ...(service ? { service } : {}),
      page: String(page),
    });
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: content.title,
    numberOfItems: result.total,
    itemListElement: result.items.map((project, index) => ({
      "@type": "ListItem",
      position: (result.page - 1) * 12 + index + 1,
      name: project.title,
      url: absoluteUrl(projectPath(project.slug)),
    })),
  };
  return (
    <PublicFrame
      page={{ ...content, path: "/portfolio" }}
      secondary={{ label: "مشاهدهٔ پروژه‌ها", href: "#projects" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <section id="projects" className="home-section scroll-mt-32">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="eyebrow">تجربه‌های اجراشده</span>
              <h2 className="home-title font-bold">
                پروژه‌ای نزدیک به نیازتان پیدا کنید.
              </h2>
            </div>
            <form
              noValidate
              method="get"
              action="/portfolio#projects"
              className="flex w-full flex-wrap items-end gap-3 sm:w-auto"
            >
              <Select
                key={service}
                id="portfolio-service"
                name="service"
                label="خدمت مرتبط"
                defaultValue={service}
                placeholder="همهٔ خدمات"
                options={projectServices.map((item) => ({
                  value: item.path,
                  label: item.title,
                }))}
                containerClassName="min-w-0 flex-1 sm:w-72 sm:max-w-80"
              />
              <button type="submit" className={buttonClasses({ size: "sm" })}>
                نمایش
              </button>
              {service && (
                <Link
                  className="inline-flex min-h-11 items-center text-xs text-accent"
                  href="/portfolio#projects"
                >
                  پاک کردن فیلتر
                </Link>
              )}
            </form>
          </div>
          <p className="mb-6 text-xs text-muted">
            {result.total.toLocaleString("fa-IR")} پروژه
            {service
              ? ` در ${projectServices.find((item) => item.path === service)?.title}`
              : ""}
          </p>
          {result.items.length ? (
            <ProjectCards projects={result.items} />
          ) : (
            <div className="neon-surface px-6 py-10">
              <h3 className="mb-3 text-xl font-bold">
                {service
                  ? "هنوز پروژه‌ای در این حوزه منتشر نشده است."
                  : content.emptyTitle}
              </h3>
              <p className="max-w-2xl text-sm leading-8 text-muted">
                {content.emptyDescription}
              </p>
              <Link
                href="/contact#consultation"
                className="mt-5 inline-flex min-h-11 items-center text-sm text-accent"
              >
                گفت‌وگو دربارهٔ پروژهٔ شما
              </Link>
            </div>
          )}
          {result.pages > 1 && (
            <nav
              aria-label="صفحه‌بندی نمونه‌کارها"
              className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm"
            >
              {result.page > 1 && (
                <Link
                  href={url(result.page - 1)}
                  className={buttonClasses({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  صفحهٔ قبل
                </Link>
              )}
              <span>
                صفحهٔ {result.page.toLocaleString("fa-IR")} از{" "}
                {result.pages.toLocaleString("fa-IR")}
              </span>
              {result.page < result.pages && (
                <Link
                  href={url(result.page + 1)}
                  className={buttonClasses({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  صفحهٔ بعد
                </Link>
              )}
            </nav>
          )}
        </Container>
      </section>
    </PublicFrame>
  );
}
