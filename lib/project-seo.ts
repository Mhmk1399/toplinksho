import "server-only";
import type { Metadata } from "next";
import { absoluteUrl, indexable } from "@/lib/seo";
import { site } from "@/lib/site";
import { mediaPath, projectPath, type ProjectView } from "@/lib/projects";
export function projectMetadata(project: ProjectView): Metadata {
  const title = project.seoTitle || `${project.title} | نمونه‌کار ${site.name}`, description = project.seoDescription || project.summary;
  const image = project.assets.find(asset => asset.id === project.coverId);
  return { title: { absolute: title }, description, alternates: { canonical: absoluteUrl(projectPath(project.slug)) },
    robots: { index: indexable, follow: indexable, ...(indexable ? { googleBot: { "max-image-preview": "large", "max-video-preview": -1 } } : {}) },
    openGraph: { type: "article", locale: "fa_IR", siteName: site.name, title, description, url: absoluteUrl(projectPath(project.slug)), publishedTime: project.publishedAt || undefined, modifiedTime: project.updatedAt, images: [{ url: absoluteUrl(mediaPath(project.coverId)), alt: project.coverAlt, width: image?.width, height: image?.height }] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(mediaPath(project.coverId))] },
  };
}
export function projectSchema(project: ProjectView) {
  const path = projectPath(project.slug), url = absoluteUrl(path), workId = url + "#project", pageId = url + "#webpage";
  const graph: Record<string, unknown>[] = [
    { "@type": "WebPage", "@id": pageId, url, name: project.title, description: project.summary, inLanguage: "fa-IR", isPartOf: { "@id": absoluteUrl("/#website") }, mainEntity: { "@id": workId }, breadcrumb: { "@id": url + "#breadcrumbs" } },
    { "@type": "CreativeWork", "@id": workId, name: project.title, description: project.summary, url, inLanguage: "fa-IR", datePublished: project.publishedAt, dateModified: project.updatedAt, image: absoluteUrl(mediaPath(project.coverId)), creator: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: site.name, url: absoluteUrl() }, mainEntityOfPage: { "@id": pageId }, keywords: project.tags.join(", "), about: project.services.map(path => ({ "@type": "Service", url: absoluteUrl(path) })) },
    { "@type": "BreadcrumbList", "@id": url + "#breadcrumbs", itemListElement: [{ title: "صفحه اصلی", path: "/" }, { title: "نمونه‌کارها", path: "/portfolio" }, { title: project.title, path }].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, item: absoluteUrl(item.path) })) },
  ];
  if (project.faq.length) graph.push({ "@type": "FAQPage", "@id": url + "#faq", isPartOf: { "@id": pageId }, mainEntity: project.faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) });
  for (const media of project.media) {
    const asset = project.assets.find(asset => asset.id === media.id);
    if (asset?.kind === "video" && media.duration > 0) graph.push({ "@type": "VideoObject", "@id": url + "#video-" + media.id, name: media.alt, description: media.caption || project.summary, thumbnailUrl: absoluteUrl(mediaPath(media.posterId || project.coverId)), uploadDate: asset.uploadedAt, contentUrl: absoluteUrl(mediaPath(media.id)), duration: `PT${Math.ceil(media.duration)}S`, isPartOf: { "@id": workId }, inLanguage: "fa-IR" });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
