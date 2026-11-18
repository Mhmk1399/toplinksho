import { MainPage } from "@/components/content/MainPage";
import { findMainPage } from "@/lib/page-registry";
import { pageMetadata } from "@/lib/seo";
export const metadata=pageMetadata("/live-case-studies");
export default function Page(){return <MainPage page={findMainPage("/live-case-studies")!}/>;}
