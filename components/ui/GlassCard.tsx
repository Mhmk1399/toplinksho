import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "md" | "lg" | "xl";
};

export function GlassCard({
  children,
  className = "",
  hover = false,
  glow = false,
  padding = "md",
  radius = "lg",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`neon-surface ${glow ? "neon-surface--glow" : ""} ${hover ? "neon-surface--interactive" : ""} ${{ none: "p-0", sm: "p-4", md: "p-6", lg: "p-[30px]" }[padding]} ${{ md: "rounded-2xl", lg: "rounded-[22px]", xl: "rounded-[30px]" }[radius]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
