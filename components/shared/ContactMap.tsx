"use client";

import { useState } from "react";
import { MapPin, ArrowUpLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export function ContactMap() {
  const [showMap, setShowMap] = useState(false);
  const query = encodeURIComponent(site.address);
  return <div className="overflow-hidden rounded-3xl border border-white/10 bg-panel">
    <div className="flex flex-col justify-between gap-5 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:p-8"><div><p className="mb-2 text-xs text-accent">دفتر اصلی شرکت</p><h3 className="text-xl font-semibold">در تماس باشیم</h3><p className="mt-3 text-sm leading-8 text-muted">{site.address}</p></div><a href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noreferrer" className="text-link shrink-0">مسیریابی در نقشه<ArrowUpLeft size={18} aria-hidden="true" /></a></div>
    <div className="relative h-80 overflow-hidden sm:h-96">
      {showMap ? <iframe title="نقشهٔ دفتر تاپ لینک شو در ستارخان تهران" src={`https://maps.google.com/maps?q=${query}&output=embed`} className="size-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <div className="grid size-full place-items-center bg-[radial-gradient(ellipse_at_center,rgba(52,61,181,.12),transparent_65%)] px-6 text-center"><div><span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-accent/20 bg-accent/5"><MapPin size={30} strokeWidth={1.4} aria-hidden="true" className="text-accent" /></span><p className="mb-5 text-sm text-muted">تهران، ستارخان</p><Button type="button" variant="secondary" onClick={() => setShowMap(true)}>نمایش نقشه</Button><p className="mt-4 text-[11px] leading-6 text-muted">با انتخاب نمایش نقشه، سرویس Google Maps بارگذاری می‌شود.</p></div></div>}
    </div>
  </div>;
}
