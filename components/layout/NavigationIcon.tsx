import {
  Bot,
  Braces,
  Globe2,
  House,
  Info,
  Layers3,
  Monitor,
  PenTool,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Users,
  BookOpen,
  Tags,
} from "lucide-react";

export function NavigationIcon({
  path,
  size = 18,
}: {
  path: string;
  size?: number;
}) {
  const slug = path.split("/").filter(Boolean).at(-1) || "home";
  const icons = {
    home: House,
    services: Layers3,
    development: Braces,
    design: Monitor,
    growth: TrendingUp,
    "web-development": Globe2,
    "app-development": Smartphone,
    "e-commerce-development": ShoppingCart,
    "ai-automation": Bot,
    "web-design": Monitor,
    "ui-designs": Layers3,
    "brand-identity": PenTool,
    seo: Search,
    "social-media-marketing": Users,
    security: ShieldCheck,
    blog: BookOpen,
    pricing: Tags,
    "about-us": Info,
    contact: Phone,
  };
  const Icon = icons[slug as keyof typeof icons] || Layers3;
  return <Icon size={size} strokeWidth={1.65} aria-hidden="true" />;
}
