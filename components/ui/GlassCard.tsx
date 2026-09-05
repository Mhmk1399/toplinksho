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
      className={`relative isolate border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012)),rgba(15,23,55,.45)] shadow-[0_20px_60px_rgba(0,0,0,.25),inset_0_1px_0_rgba(255,255,255,.07)] backdrop-blur-[22px] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-[linear-gradient(145deg,rgba(255,255,255,.055),transparent_36%)] ${glow ? "after:pointer-events-none after:absolute after:inset-[15%_12%] after:-z-20 after:rounded-[inherit] after:bg-violet-600/20 after:blur-[45px]" : ""} ${hover ? "transition duration-200 hover:-translate-y-1 hover:border-white/15 hover:bg-[#141d44]/60" : ""} ${{ none: "p-0", sm: "p-4", md: "p-6", lg: "p-[30px]" }[padding]} ${{ md: "rounded-2xl", lg: "rounded-[22px]", xl: "rounded-[30px]" }[radius]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
