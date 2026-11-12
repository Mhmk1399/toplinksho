import { Globe2, Megaphone, MousePointerClick, Share2, Shapes, PenTool, Search, MonitorPlay } from "lucide-react";
import { serviceCatalog } from "@/lib/site";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { CardGrid } from "@/components/ui/CardGrid";
const icons = { campaign: Megaphone, social: Share2, ads: MousePointerClick, web: Globe2, graphic: Shapes, content: PenTool, seo: Search, online: MonitorPlay };

export function ServiceCatalog({ compact = false }: { compact?: boolean }) {
 const items=compact?serviceCatalog.filter(item=>["campaigns","social-media","web-design","graphic-design","content-production","google-ads"].includes(item.slug)):serviceCatalog;
 return <CardGrid label="خدمات تاپ لینک شو" mobileScroll>{items.map(service=>{
  const Icon=icons[service.icon];
  return <FeatureCard key={service.slug} title={service.title} description={service.description}
   href={`/services/${service.slug}`} category={service.tag} icon={<Icon size={18} />} />;
 })}</CardGrid>;
}
