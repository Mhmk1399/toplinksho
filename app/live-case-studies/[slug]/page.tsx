import { notFound } from "next/navigation";
import { MainPage } from "@/components/content/MainPage";
import { mainPages,findMainPage } from "@/lib/page-registry";
import { pageMetadata } from "@/lib/seo";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return mainPages.filter(page=>page.kind==="case").map(page=>({slug:page.path.split("/").pop()!}));}
export async function generateMetadata({params}:Props){const page=findMainPage("/live-case-studies/"+(await params).slug);if(!page)notFound();return pageMetadata(page.path);}
export default async function Page({params}:Props){const page=findMainPage("/live-case-studies/"+(await params).slug);if(!page)notFound();return <MainPage page={page}/>;}
