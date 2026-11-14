import Image from "next/image";
import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";

const defaultSteps = ["شناخت نیاز و اولویت‌ها", "تعریف دامنه و خروجی‌ها", "اجرا و دریافت بازخورد", "آزمون، مستندات و تحویل"];
const icons = ["discovery", "scope", "build", "verify"];

export function ServiceProcess({ title, description, steps = defaultSteps, id = "process" }: { title: string; description?: string; steps?: string[]; id?: string }) {
  const items = steps.length ? steps : defaultSteps;
  const offsets = items.map((_, index) => Math.round(62 * index ** .82));
  const railHeight = offsets.at(-1)! + 64;
  const points = items.map((_, index) => ({ x: 1000 * (1 - (index + .5) / items.length), y: 34 + offsets[index] }));
  const path = points.reduce((result, point, index) => {
    const previous = index ? points[index - 1] : { x: 1000, y: 4 };
    const before = points[index - 2] || { x: 1000, y: 4 };
    const after = points[index + 1] || { x: 0, y: point.y - 6 };
    return result + ` C${previous.x + (point.x - before.x) / 6} ${previous.y + (point.y - before.y) / 6},${point.x - (after.x - previous.x) / 6} ${point.y - (after.y - previous.y) / 6},${point.x} ${point.y}`;
  }, "M1000 4") + ` Q65 ${points.at(-1)!.y + 8},20 ${points.at(-1)!.y - 8}`;
  const gradient = `${id}-workflow-light`, mesh = `${id}-workflow-mesh`;
  return <section id={id} className="service-workflow home-section scroll-mt-32" aria-labelledby={`${id}-title`}>
    <div className="workflow-scene" aria-hidden="true">
      <span className="workflow-planet" /><span className="workflow-cloud" />
      <svg className="workflow-floor" viewBox="0 0 1200 160" preserveAspectRatio="none" focusable="false">
        <defs><linearGradient id={`${gradient}-floor`}><stop stopColor="var(--brand-blue)" /><stop offset=".5" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--brand-pink)" /></linearGradient><pattern id={mesh} width="10" height="9" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="var(--info)" /></pattern></defs>
        <path d="M0 135Q190 35 390 98T790 113T1200 68V160H0Z" fill={`url(#${gradient}-floor)`} opacity=".12" />
        <path className="workflow-floor-mesh" d="M0 135Q190 35 390 98T790 113T1200 68V160H0Z" fill={`url(#${mesh})`} opacity=".4" />
        <path d="M0 135Q190 35 390 98T790 113T1200 68" fill="none" stroke={`url(#${gradient}-floor)`} strokeWidth="2" opacity=".7" />
      </svg>
    </div>
    <Container>
      <div className="workflow-intro" data-service-reveal><h2 id={`${id}-title`} className="home-title font-extrabold">{title}<span aria-hidden="true">.</span></h2>{description && <p className="mt-3 text-sm leading-8 text-muted">{description}</p>}</div>
      <div className="workflow-track" style={{ "--workflow-count": items.length, "--workflow-rail-height": `${railHeight}px` } as CSSProperties}>
        <svg className="workflow-rail" aria-hidden="true" focusable="false" viewBox={`0 0 1000 ${railHeight}`} preserveAspectRatio="none">
          <defs><linearGradient id={gradient} x1="1" y1="0" x2="0" y2="1"><stop stopColor="var(--accent)" /><stop offset=".3" stopColor="var(--brand-pink)" /><stop offset=".65" stopColor="var(--info)" /><stop offset="1" stopColor="var(--brand-pink)" /></linearGradient></defs>
          <path d={path} stroke={`url(#${gradient})`} strokeWidth="16" opacity=".08" fill="none" />
          <path d={path} stroke={`url(#${gradient})`} strokeWidth="7" opacity=".22" fill="none" />
          <path d={path} stroke={`url(#${gradient})`} strokeWidth="2.5" fill="none" />
          <path d={`M32 ${points.at(-1)!.y - 19}L12 ${points.at(-1)!.y - 8}L35 ${points.at(-1)!.y + 3}L28 ${points.at(-1)!.y - 8}Z`} fill="var(--accent)" />
        </svg>
        <ol className="workflow-list" role="list">{items.map((text, index) => <li key={index} className="workflow-step" style={{ "--workflow-offset": `${offsets[index]}px` } as CSSProperties}>
          <div className="workflow-card">
            <Image className="workflow-icon" src={`/images/process/${icons[Math.min(index, icons.length - 1)]}.png`} alt="" width={128} height={128} sizes="(min-width: 1024px) 120px, 72px" loading="lazy" />
            <div className="workflow-copy"><span className="workflow-step-number" aria-hidden="true">{new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(index + 1)}</span><p>{text}</p></div>
          </div><span className="workflow-node" aria-hidden="true" />
        </li>)}</ol>
      </div>
    </Container>
  </section>;
}
