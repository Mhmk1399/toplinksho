import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "md" | "lg" | "xl";
};

export function GlassCard({
  children,
  className = "",
  hover = false,
  glow = false,
  glowColor = "rgba(124, 58, 237, .18)",
  padding = "md",
  radius = "lg",
  style,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`glass-card pad-${padding} radius-${radius} ${hover ? "glass-hover" : ""} ${glow ? "has-glow" : ""} ${className}`}
      style={{ "--card-glow": glowColor, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}
