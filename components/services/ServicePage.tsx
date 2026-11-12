import Link from "next/link";
import { Check, ArrowLeft, Layers3, Compass, Code2, Sparkles } from "lucide-react";
import { PublicFrame } from "@/components/content/PublicFrame";
import { FaqBlock, LinkCards, PageCTA } from "@/components/content/ContentBlocks";
import { Container } from "@/components/ui/Container";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { NarrativeCopy } from "@/components/content/NarrativeCopy";
import { childrenOf, serviceGroups, type ServicePageData } from "@/lib/page-registry";
const icons=[Compass,Layers3,Code2,Sparkles];
export function ServicePage({ page }: { page: ServicePageData }) {
 const children=childrenOf(page.path);
 const group=serviceGroups.find(item=>item.id===page.group);
 const siblings=childrenOf(page.parent||"/services").filter(item=>item.path!==page.path&&item.kind!=="group").slice(0,3);
 return <PublicFrame page={{...page,eyebrow:group?.title||"راهکار متناسب با کسب‌وکار"}} secondary={{label:children.length?"کشف زیرخدمات":"دامنهٔ همکاری",href:children.length?"#catalog":"#overview"}}>
  <Container><nav aria-label="دسترسی سریع این صفحه" className="mb-5 flex flex-wrap gap-2 text-xs">
   {[[children.length?"#catalog":"#overview",children.length?"زیرخدمات":"معرفی راهکار"],["#deliverables","خروجی‌ها"],["#process","مراحل همکاری"],["#faq","پرسش‌ها"]].map(([href,label])=><a key={href} href={href} className="rounded-full border border-line px-4 py-3 transition-colors hover:border-accent/40 hover:text-accent">{label}</a>)}
  </nav></Container>
  <section id="overview" className="home-section scroll-mt-32"><Container><div className="grid gap-7 lg:grid-cols-[1.3fr_.7fr]">
   <div><span className="eyebrow">شناخت نیاز، پیش از انتخاب راهکار</span><h2 className="home-title mb-4 font-extrabold">{page.title}؛ از نیاز تا اجرا</h2><NarrativeCopy intro={page.intro||page.description} paragraphs={page.bodyParagraphs} /></div>
   <FeatureCard title="برای چه نیازی مناسب است؟" description={page.fit||"برای انتخاب راهکار مناسب، نیاز فعلی، امکانات ضروری و مسیر استفادهٔ مخاطب را بررسی می‌کنیم."} path={page.path} category="انتخاب راهکار" compact />
  </div></Container></section>
  {children.length>0 && <section id="catalog" className="home-section scroll-mt-32"><Container><div className="mb-7"><span className="eyebrow">تخصص‌ها</span><h2 className="home-title font-extrabold">مسیر متناسب با نیازتان را انتخاب کنید.</h2></div><LinkCards items={children} /></Container></section>}
  <section id="deliverables" className="home-section scroll-mt-32 border-y border-line"><Container><div className="mb-7"><span className="eyebrow">دامنهٔ روشن</span><h2 className="home-title font-extrabold">خروجی‌های {page.title}</h2><p className="mt-3 max-w-2xl text-sm leading-8 text-muted">این موارد مبنای گفت‌وگوی اولیه هستند؛ امکانات ضروری، اتصال‌ها و معیار تحویل پیش از شروع پروژه با شما مشخص می‌شوند.</p></div><CardGrid label={"خروجی‌های "+page.title} mobileScroll>{(page.deliverables||["بررسی نیاز و اولویت‌ها","تعریف مسیر اجرا و خروجی","آزمون و راهنمای تحویل"]).map(item=><FeatureCard key={item} title={item} path={page.path} category="خروجی پروژه" icon={<Check size={18} />} compact />)}</CardGrid>
   <div className="neon-surface mt-6 p-5"><h3 className="mb-2 text-sm font-semibold">برای بررسی اولیه آماده کنید</h3><p className="text-sm leading-8 text-muted">{(page.inputs||["هدف پروژه، اطلاعات موجود و محدودیت‌های اصلی"]).join("؛ ")}.</p></div>
  </Container></section>
  <section id="process" className="home-section scroll-mt-32"><Container><h2 className="home-title mb-4 font-extrabold">مراحل {page.title}</h2>{page.processDescription && <p className="mb-7 max-w-3xl text-sm leading-8 text-muted">{page.processDescription}</p>}<ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{(page.process||["شناخت نیاز","تعریف دامنه","اجرا و بازخورد","آزمون و تحویل"]).map((text,index)=>{const Icon=icons[index]||Check;return <li key={text} className="border-t border-line pt-5"><div className="mb-4 flex items-center justify-between text-accent"><span className="text-sm">{new Intl.NumberFormat("fa-IR",{minimumIntegerDigits:2}).format(index+1)}</span><Icon size={19} aria-hidden="true" /></div><p className="text-sm leading-8 text-muted">{text}</p></li>;})}</ol></Container></section>
  <FaqBlock items={page.faq||[]} title={"پرسش‌های رایج دربارهٔ "+page.title} />
  {siblings.length>0 && <section className="home-section"><Container><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="route-card-title font-bold">راهکارهای مرتبط</h2><Link href={page.parent||"/services"} className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-accent">همهٔ این گروه<ArrowLeft size={16} aria-hidden="true" /></Link></div><LinkCards items={siblings} compact /></Container></section>}
  <PageCTA />
 </PublicFrame>;
}
