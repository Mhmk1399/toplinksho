import artwork from "@/content/menu-artwork.generated.json";
import { assetUrl } from "@/lib/assets";

// Keep the interactive navbar independent of the complete server-side artwork catalog.
export function getMenuArtwork(path: string, featured = false) {
  const images: Record<string, string> = artwork;
  return assetUrl(images[featured ? "featured" : path] || images["/services/development"]);
}
