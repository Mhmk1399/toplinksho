import visuals from "@/content/visuals.fa.json";
import artwork from "@/content/card-artwork.fa.json";

export type CardArtwork = { src: string; alt: string; title: string; context: string };
const cards: Record<string, CardArtwork> = artwork;
export function getCardArtwork({ artworkKey, path }: { artworkKey?: string; path?: string }) {
 const key = artworkKey || (path?.startsWith("/") ? "route:" + path.split("#")[0].split("?")[0] : "");
 return cards[key] ? { ...cards[key], key } : undefined;
}

export type VisualKey = keyof typeof visuals;
export function visualFor(path = "", group?: string): VisualKey {
 if (/ai-|automation/.test(path)) return "automation";
 if (/design|brand|graphic/.test(path) || group === "design") return "design";
 if (/growth|seo|social|campaign|ads|advertising|content-production|real-estate/.test(path) || group === "growth") return "growth";
 return "development";
}
export function getVisual(key: VisualKey) { return visuals[key]; }

