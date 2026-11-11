import type { ReactNode } from "react";

export function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: string }) {
  return <div className="mb-10 flex flex-col justify-between gap-5 md:mb-12 md:flex-row md:items-end md:gap-12">
    <div><span className="eyebrow">{eyebrow}</span><h2 className="max-w-2xl text-3xl leading-[1.65] font-extrabold sm:text-4xl lg:text-[44px]">{title}</h2></div>
    {description && <p className="max-w-md text-sm leading-8 text-muted">{description}</p>}
  </div>;
}
