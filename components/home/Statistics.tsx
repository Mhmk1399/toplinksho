"use client";

import { useEffect, useRef, useState } from "react";
import { Award, BriefcaseBusiness, HeartHandshake, UsersRound } from "lucide-react";
import { MetricCard } from "@/components/shared/ContentCards";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";

const metrics = [
  { end: 8, suffix: "+", label: "سال تجربه", icon: Award },
  { end: 250, suffix: "+", label: "پروژه موفق", icon: BriefcaseBusiness },
  { end: 98, suffix: "٪", label: "رضایت مشتریان", icon: HeartHandshake },
  { end: 150, suffix: "+", label: "برند همراه", icon: UsersRound },
];

export function Statistics() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } }, { threshold: .35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="py-10"><Container><div ref={ref}>
      <GlassCard className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1" padding="none" radius="xl">
        {metrics.map(({ end, suffix, label, icon: Icon }) => <Metric key={label} end={end} suffix={suffix} label={label} icon={<Icon size={22} />} active={active} />)}
      </GlassCard>
    </div></Container></section>
  );
}

function Metric({ end, suffix, label, icon, active }: { end: number; suffix: string; label: string; icon: React.ReactNode; active: boolean }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedFrame = requestAnimationFrame(() => setValue(end));
      return () => cancelAnimationFrame(reducedFrame);
    }
    const start = performance.now();
    let animationFrame = 0;
    const frame = (now: number) => { const progress = Math.min((now - start) / 950, 1); setValue(Math.round(end * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) animationFrame = requestAnimationFrame(frame); };
    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, end]);
  return <MetricCard icon={icon} value={`${value}${suffix}`} label={label} />;
}
