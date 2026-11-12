import "server-only";
import home from "@/content/home.fa.json";
import { absoluteUrl, getSeoPage } from "@/lib/seo";
import { site } from "@/lib/site";
import { findServicePage, findMainPage, breadcrumbItems, childrenOf, servicePages } from "@/lib/page-registry";

export function pageStructuredData(path:string) {
 const page=getSeoPage(path),orgId=absoluteUrl("/#organization"),websiteId=absoluteUrl("/#website"),pageId=absoluteUrl(path+"#webpage");
 const service=findServicePage(path),main=findMainPage(path);
 const trail=breadcrumbItems(path);
 const breadcrumbs={"@type":"BreadcrumbList","@id":absoluteUrl(path+"#breadcrumbs"),itemListElement:trail.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.title,item:absoluteUrl(item.path)}))};
 const org={"@type":"ProfessionalService","@id":orgId,name:site.name,alternateName:"TopLinkSho",url:absoluteUrl(),logo:{"@type":"ImageObject","@id":absoluteUrl("/#logo"),url:absoluteUrl("/images/logo.webp")},image:absoluteUrl(page.image),description:getSeoPage("/").description,telephone:site.phone,email:site.email,address:{"@type":"PostalAddress",streetAddress:"ستارخان، خیابان صحرایی، مرکز تجاری پارسیان",addressLocality:"تهران",addressCountry:"IR"},contactPoint:{"@type":"ContactPoint",telephone:site.phone,email:site.email,contactType:"customer service",availableLanguage:["fa"]},sameAs:[site.linkedin]};
 const graph:Record<string,unknown>[]=[org,{"@type":"WebSite","@id":websiteId,url:absoluteUrl(),name:site.name,alternateName:"TopLinkSho",inLanguage:"fa-IR",publisher:{"@id":orgId}},{
  "@type":page.kind==="about"?"AboutPage":page.kind==="contact"?"ContactPage":["services","cases","blog"].includes(page.kind)?"CollectionPage":"WebPage",
  "@id":pageId,url:absoluteUrl(path),name:page.title,description:page.description,inLanguage:"fa-IR",isPartOf:{"@id":websiteId},about:{"@id":orgId},
  primaryImageOfPage:{"@type":"ImageObject",url:absoluteUrl(page.image)},...(path!=="/"?{breadcrumb:{"@id":breadcrumbs["@id"]}}:{}),
 },...(path!=="/"?[breadcrumbs]:[])];
 const faq=path==="/"?home.faq.items:service?.faq||main?.faq||[];
 if(faq.length)graph.push({"@type":"FAQPage","@id":absoluteUrl(path+"#faq"),isPartOf:{"@id":pageId},mainEntity:faq.map(item=>({"@type":"Question",name:item.question,acceptedAnswer:{"@type":"Answer",text:item.answer}}))});
 if(service&&!["catalog","group"].includes(service.kind))graph.push({"@type":"Service","@id":absoluteUrl(path+"#service"),name:service.title,description:service.description,serviceType:service.title,url:absoluteUrl(path),provider:{"@id":orgId},mainEntityOfPage:{"@id":pageId}});
 const offerings=path==="/"?home.services.items.map(item=>({title:item.title,description:item.description,path:item.href})):service?.kind==="catalog"?servicePages.filter(item=>item.kind==="service"&&item.path.split("/").length===4):childrenOf(path);
 if(offerings.length)graph.push({"@type":"OfferCatalog","@id":absoluteUrl(path+"#catalog"),name:"خدمات تاپ لینک شو",itemListElement:offerings.map(item=>({"@type":"Offer",itemOffered:{"@type":"Service",name:item.title,description:item.description,url:absoluteUrl(item.path),provider:{"@id":orgId}}}))});
 return {"@context":"https://schema.org","@graph":graph};
}
