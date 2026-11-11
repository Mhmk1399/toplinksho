import { pageStructuredData } from "@/lib/structured-data";

export function PageStructuredData({ path }: { path: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageStructuredData(path)).replace(/</g, "\\u003c") }} />;
}
