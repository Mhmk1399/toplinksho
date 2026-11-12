import { notFound } from "next/navigation";
import { servicePages, findServicePage } from "@/lib/page-registry";
import { pageMetadata } from "@/lib/seo";
import { ServicePage } from "@/components/services/ServicePage";
import { ServiceDirectory } from "@/components/services/ServiceDirectory";
type Props={params:Promise<{slug:string[]}>};
export const dynamicParams=false;
export function generateStaticParams(){return servicePages.filter(page=>page.path!=="/services").map(page=>({slug:page.path.slice("/services/".length).split("/")}));}
export async function generateMetadata({params}:Props){const {slug}=await params;const page=findServicePage("/services/"+slug.join("/"));if(!page)notFound();return pageMetadata(page.path);}
export default async function Page({params}:Props){const {slug}=await params;const page=findServicePage("/services/"+slug.join("/"));if(!page)notFound();return page.kind==="group"?<ServiceDirectory page={page}/>:<ServicePage page={page}/>;}
