import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { visualFor, type VisualKey } from "@/lib/visuals";

export function ServiceCard({ icon: Icon, title, label, description, href }: { href: string; icon: LucideIcon; number: number; title: string; label?: string; description: string; color: string }) {
 return <FeatureCard title={title} description={description} href={href} category={label || "خدمات"} icon={<Icon size={18} />} />;
}
export function MetricCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
 return <div className="neon-surface flex items-center justify-center gap-4 p-6"><span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent">{icon}</span><div><strong className="text-3xl font-extrabold" dir="ltr">{value}</strong><p className="mt-1 text-sm text-muted">{label}</p></div></div>;
}
export function PortfolioCard({ name, category, result, visual, size }: { name: string; category: string; result: string; visual: string; size: string }) {
 const images: Record<string,VisualKey>={cosmetic:"design",food:"design",commerce:"development",fashion:"design"};
 return <FeatureCard title={name} description={result} category={category} visual={images[visual] || "design"} className={size==="wide"?"md:col-span-2":""} />;
}
export function ArticleCard({ title, excerpt, category, date, icon: Icon, visual, href }: { href: string; title: string; excerpt: string; category: string; date: string; icon: LucideIcon; visual: string }) {
 return <FeatureCard title={title} description={excerpt} category={category} href={href} visual={visualFor(visual)}
  icon={<Icon size={18} />} linkLabel="مطالعهٔ مقاله" footer={<time className="text-xs text-muted">{date}</time>} />;
}
