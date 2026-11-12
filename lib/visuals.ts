import visuals from "@/content/visuals.fa.json";

export type VisualKey = keyof typeof visuals;
export function visualFor(path = "", group?: string): VisualKey {
 if (/ai-|automation/.test(path)) return "automation";
 if (/design|brand|graphic/.test(path) || group === "design") return "design";
 if (/growth|seo|social|campaign|ads|advertising|content-production|real-estate/.test(path) || group === "growth") return "growth";
 return "development";
}
export function getVisual(key: VisualKey) { return visuals[key]; }

