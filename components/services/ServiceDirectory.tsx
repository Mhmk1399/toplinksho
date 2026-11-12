import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { PublicFrame } from "@/components/content/PublicFrame";
import { Container } from "@/components/ui/Container";
import { LinkCards, PageCTA } from "@/components/content/ContentBlocks";
import { buttonClasses } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { PageOverview } from "@/components/content/PageOverview";
import { childrenOf, servicePages, serviceGroups, type ServicePageData } from "@/lib/page-registry";

const normalized=(value:string)=>value.toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ").replace(/\s+/g," ").trim();

export function ServiceDirectory({ page, query="", searchMode=false }: { page: ServicePageData; query?: string; searchMode?: boolean }) {
 const groups=page.kind==="catalog"?serviceGroups:serviceGroups.filter(group=>group.id===page.group);
 const results=query?servicePages.filter(item=>["service","specialism"].includes(item.kind)&&normalized(item.title+" "+item.description).includes(normalized(query))):[];
 return <PublicFrame page={page} secondary={{label:"انتخاب راهکار",href:"#catalog"}} schema={!searchMode}>
  {!searchMode && <PageOverview page={page} />}
  <section id="catalog" className="home-section scroll-mt-32"><Container>
   {page.kind==="catalog" && <>
    <form noValidate action="/services/search#catalog" method="get" role="search" className="neon-surface mb-8 p-5 sm:p-7">
     <label htmlFor="service-search" className="mb-3 block text-base font-semibold">دنبال چه راهکاری هستید؟</label>
     <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search aria-hidden="true" size={19} className="absolute right-4 top-4 text-muted" /><input id="service-search" name="q" defaultValue={query} maxLength={80} placeholder="مثلاً طراحی سایت، رزرو یا سئو" className="min-h-12 w-full rounded-xl border border-line bg-ink py-3 pl-4 pr-12 text-sm outline-none focus:border-accent" /></div><button type="submit" className={buttonClasses({size:"sm"})}>جست‌وجوی خدمات</button>{query && <Link href="/services#catalog" className={buttonClasses({variant:"ghost",size:"sm"})}>پاک کردن جست‌وجو</Link>}</div>
    </form>
    {!query && <CardGrid label="گروه‌های خدمات" mobileScroll className="mb-10">{serviceGroups.map(group=><FeatureCard key={group.id}
     title={group.title} description={group.description} href={group.path} headingAs="h2"
     category={childrenOf(group.path).length.toLocaleString("fa-IR")+" حوزهٔ تخصصی"} linkLabel={"خدمات "+group.title} />)}</CardGrid>}
   </>}
   {query ? <div><h2 className="home-title mb-6 font-bold">نتیجهٔ جست‌وجو</h2><p className="mb-6 text-sm text-muted" role="status">{results.length.toLocaleString("fa-IR")} راهکار برای «{query}»</p>{results.length?<LinkCards items={results} />:<div className="neon-surface p-7"><p className="text-sm leading-8 text-muted">نتیجه‌ای پیدا نشد. عبارت کوتاه‌تری بنویسید یا از دسته‌بندی‌ها شروع کنید.</p><Link className="mt-4 inline-flex min-h-11 items-center text-sm text-accent" href="/services#catalog">مشاهدهٔ همهٔ دسته‌بندی‌ها</Link></div>}</div> :
   <div className="space-y-10">{groups.map(group=><section key={group.id} aria-labelledby={group.id+"-heading"}>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><span className="eyebrow">خدمات {group.title}</span><h2 id={group.id+"-heading"} className="home-title font-extrabold">{group.heading}</h2><p className="mt-2 max-w-2xl text-sm leading-8 text-muted">{group.description}</p></div>{page.kind==="catalog" && <Link href={group.path} className="inline-flex min-h-11 items-center gap-2 text-sm text-accent">بررسی این گروه<ArrowLeft size={16} aria-hidden="true" /></Link>}</div>
    <CardGrid label={group.heading} mobileScroll>{childrenOf(group.path).map(item=><FeatureCard key={item.path}
     title={item.title} description={item.description} href={item.path} category={group.title} linkLabel={"جزئیات خدمات "+item.title}>
      <details className="border-t border-line pt-2"><summary className="min-h-11 cursor-pointer rounded-lg py-2 text-xs leading-7 text-slate-300 hover:text-accent">زیرخدمات این حوزه</summary><ul className="space-y-1 pt-2">{childrenOf(item.path).map(child=><li key={child.path}><Link href={child.path} className="block rounded-lg py-2 text-xs leading-7 text-muted transition-colors hover:text-accent">{child.title}</Link></li>)}</ul></details>
     </FeatureCard>)}</CardGrid>
   </section>)}</div>}
  </Container></section><PageCTA />
 </PublicFrame>;
}
