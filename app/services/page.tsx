import { ServiceDirectory } from "@/components/services/ServiceDirectory";
import { findServicePage } from "@/lib/page-registry";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("/services");
export const revalidate = 60;
export default function Services(){
 return <ServiceDirectory page={findServicePage("/services")!} />;
}
