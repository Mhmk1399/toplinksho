import type { ReactNode } from "react";

export function SectionIntro({ eyebrow, title, description, headingId, compact = false }: { eyebrow: string; title: ReactNode; description?: string; headingId?: string; compact?: boolean }) {
  return <div className={`${compact ? "mb-6 md:mb-8" : "mb-10 md:mb-12"} flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-12`}>
    <div><span className="eyebrow">{eyebrow}</span><h2 id={headingId} className={compact ? "home-title max-w-2xl font-extrabold" : "max-w-2xl text-3xl leading-[1.65] font-extrabold sm:text-4xl lg:text-[44px]"}>{title}</h2></div>
    {description && <p className="max-w-md text-sm leading-8 text-muted">{description}</p>}
  </div>;
}
