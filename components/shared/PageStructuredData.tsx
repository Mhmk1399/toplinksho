import { pageStructuredData } from "@/lib/structured-data";

export function PageStructuredData({ path, canonicalPath }: { path: string; canonicalPath?: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageStructuredData(path, canonicalPath)).replace(/</g, "\\u003c") }} />;
}
