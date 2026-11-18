import theme from "@/theme/theme.json";
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/", name: "تاپ لینک شو | TopLinkSho", short_name: site.name, description: "خدمات دیجیتال مارکتینگ، طراحی سایت و برندینگ تاپ لینک شو",
    lang: "fa-IR", dir: "rtl", start_url: "/", scope: "/", display: "standalone",
    background_color: theme.colors.background, theme_color: theme.colors.background, categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "مشاوره رایگان", url: "/contact#consultation" },
      { name: "خدمات ما", url: "/services" },
    ],
  };
}
