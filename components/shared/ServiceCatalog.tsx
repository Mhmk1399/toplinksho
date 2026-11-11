import Link from "next/link";
import {
  ArrowUpLeft,
  Globe2,
  Megaphone,
  MousePointerClick,
  Share2,
  Shapes,
  PenTool,
  Search,
  MonitorPlay,
} from "lucide-react";
import { serviceCatalog } from "@/lib/site";

const icons = {
  campaign: Megaphone,
  social: Share2,
  ads: MousePointerClick,
  web: Globe2,
  graphic: Shapes,
  content: PenTool,
  seo: Search,
  online: MonitorPlay,
};

export function ServiceCatalog({ compact = false }: { compact?: boolean }) {
  const items = compact
    ? serviceCatalog.filter((item) =>
        [
          "campaigns",
          "social-media",
          "web-design",
          "graphic-design",
          "content-production",
          "google-ads",
        ].includes(item.slug),
      )
    : serviceCatalog;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service, index) => {
        const Icon = icons[service.icon];
        return (
          <Link
            href={`/services/${service.slug}`}
            key={service.slug}
            className={`group flex min-h-72 flex-col rounded-3xl border p-6 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-accent/50 focus-visible:border-accent md:p-7 ${index === 0 ? "border-brand-pink/20 bg-gradient-to-br from-brand-pink/10 to-panel" : "border-white/10 bg-panel/80"}`}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/4 text-accent">
                <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="text-[10px] text-muted">{service.tag}</span>
            </div>
            <h3 className="text-xl font-semibold">{service.title}</h3>
            <p className="mt-3 mb-7 text-sm leading-8 text-muted">
              {service.description}
            </p>
            <span className="mt-auto flex min-h-11 items-center justify-between border-t border-white/5 pt-4 text-xs text-accent">
              بیشتر بدانید
              <ArrowUpLeft
                size={19}
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
              />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
