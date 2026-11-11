import "server-only";
import { absoluteUrl, getSeoPage } from "@/lib/seo";
import { services, getService } from "@/lib/services";
import { site } from "@/lib/site";

export function pageStructuredData(path: string) {
  const page = getSeoPage(path);
  const orgId = absoluteUrl("/#organization");
  const websiteId = absoluteUrl("/#website");
  const pageId = absoluteUrl(`${path}#webpage`);
  const organization = {
    "@type": "ProfessionalService", "@id": orgId, name: site.name, alternateName: "TopLinkSho", url: absoluteUrl(),
    logo: { "@type": "ImageObject", "@id": absoluteUrl("/#logo"), url: absoluteUrl("/images/logo.webp") },
    image: absoluteUrl(page.image), description: getSeoPage("/").description,
    telephone: site.phone, email: site.email,
    address: { "@type": "PostalAddress", streetAddress: "ستارخان، خیابان صحرایی، مرکز تجاری پارسیان", addressLocality: "تهران", addressCountry: "IR" },
    contactPoint: { "@type": "ContactPoint", telephone: site.phone, email: site.email, contactType: "customer service", availableLanguage: ["fa"] },
    sameAs: [site.linkedin],
  };
  const trail = path === "/" ? [{ name: "صفحه اصلی", path: "/" }] : [
    { name: "صفحه اصلی", path: "/" },
    ...(page.kind === "service" ? [{ name: "خدمات ما", path: "/services" }] : []),
    { name: page.title, path },
  ];
  const breadcrumbs = { "@type": "BreadcrumbList", "@id": absoluteUrl(`${path}#breadcrumbs`), itemListElement: trail.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
  const service = page.slug ? getService(page.slug) : undefined;
  const graph: Record<string, unknown>[] = [
    organization,
    { "@type": "WebSite", "@id": websiteId, url: absoluteUrl(), name: site.name, alternateName: "TopLinkSho", inLanguage: "fa-IR", publisher: { "@id": orgId } },
    { "@type": page.kind === "about" ? "AboutPage" : page.kind === "contact" ? "ContactPage" : page.kind === "services" ? "CollectionPage" : "WebPage",
      "@id": pageId, url: absoluteUrl(path), name: page.title, description: page.description, inLanguage: "fa-IR",
      isPartOf: { "@id": websiteId }, about: { "@id": service ? absoluteUrl(`${path}#service`) : orgId },
      primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(page.image) },
      ...(path !== "/" ? { breadcrumb: { "@id": breadcrumbs["@id"] } } : {}),
    },
    ...(path !== "/" ? [breadcrumbs] : []),
  ];
  if (page.kind === "services" || page.kind === "home") {
    graph.push({ "@type": "OfferCatalog", "@id": absoluteUrl("/services#catalog"), name: "خدمات تاپ لینک شو", itemListElement: services.map(service => ({ "@type": "OfferCatalog", name: service.title, url: absoluteUrl(`/services/${service.slug}`), itemListElement: [{ "@type": "Offer", itemOffered: { "@type": "Service", "@id": absoluteUrl(`/services/${service.slug}#service`), name: service.title, description: service.description, url: absoluteUrl(`/services/${service.slug}`), provider: { "@id": orgId } } }] })) });
  }
  if (service) {
    graph.push({ "@type": "Service", "@id": absoluteUrl(`${path}#service`), name: service.title, description: service.description, serviceType: service.title, url: absoluteUrl(path), provider: { "@id": orgId }, mainEntityOfPage: { "@id": pageId } });
    graph.push({ "@type": "FAQPage", "@id": absoluteUrl(`${path}#faq`), isPartOf: { "@id": pageId }, mainEntity: service.faq.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
