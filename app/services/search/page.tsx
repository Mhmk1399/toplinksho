import { ServiceDirectory } from "@/components/services/ServiceDirectory";
import { findServicePage } from "@/lib/page-registry";
import { indexable, pageMetadata } from "@/lib/seo";

export const metadata = {
 ...pageMetadata("/services"),
 robots: { index: false, follow: indexable, googleBot: { index: false, follow: indexable } },
};

export default async function ServiceSearch({searchParams}: {searchParams: Promise<{q?: string | string[]}>}) {
 const value = (await searchParams).q;
 const query = typeof value === "string" ? value.trim().slice(0,80) : "";
 return <ServiceDirectory page={findServicePage("/services")!} query={query} searchMode />;
}
