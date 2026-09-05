import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function ServiceCard({ icon: Icon, number, title, label, description, color }: { icon: LucideIcon; number: number; title: string; label?: string; description: string; color: string }) {
  return <GlassCard className={`service-card accent-${color}`} hover glow padding="lg"><span className="service-number">۰{number}</span><span className="service-icon"><Icon size={25} strokeWidth={1.7} /></span><div><h3>{title}</h3>{label ? <span className="service-label" dir="ltr">{label}</span> : null}<p>{description}</p></div><a href="#contact">بیشتر بدانید <ArrowLeft size={16} /></a></GlassCard>;
}

export function MetricCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="stat"><span>{icon}</span><div><strong dir="ltr">{value}</strong><p>{label}</p></div></div>;
}

export function PortfolioCard({ name, category, result, visual, size }: { name: string; category: string; result: string; visual: string; size: string }) {
  return <article className={`project-card project-${visual} ${size}`}><div className="project-art" aria-hidden="true"><span /><i /><b /></div><div className="project-overlay"><span>{category}</span><h3>{name}</h3><p>{result}</p></div></article>;
}

export function ArticleCard({ title, excerpt, category, date, icon: Icon, visual }: { title: string; excerpt: string; category: string; date: string; icon: LucideIcon; visual: string }) {
  return <article className="article-card"><div className={`article-image article-${visual}`}><span><Icon size={36} strokeWidth={1.35} /></span><i /><b /></div><div className="article-body"><div className="article-meta"><span>{category}</span><time>{date}</time></div><h3>{title}</h3><p>{excerpt}</p><a href="#">مطالعه مقاله <ArrowLeft size={16} /></a></div></article>;
}
