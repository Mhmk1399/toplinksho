import artwork from "@/content/menu-artwork.generated.json";

// Keep the interactive navbar independent of the complete server-side artwork catalog.
export function getMenuArtwork(path: string, featured = false) {
  const images: Record<string, string> = artwork;
  return images[featured ? "featured" : path] || images["/services/development"];
}
