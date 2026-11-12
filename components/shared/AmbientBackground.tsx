type AmbientBackgroundProps = { variant?: "hero" | "service" | "portfolio" | "minimal" };

export function AmbientBackground({ variant = "minimal" }: AmbientBackgroundProps) {
  const lights = {
    hero: ["-right-40 -top-28 size-[520px] bg-violet-600/25", "-left-32 top-40 size-[440px] bg-[var(--paint-f02b78)]/20", "left-1/3 top-2/3 size-80 bg-blue-600/15"],
    service: ["-right-40 top-20 size-[450px] bg-violet-600/20", "-left-32 bottom-0 size-96 bg-sky-500/15", "hidden"],
    portfolio: ["-left-40 top-24 size-[480px] bg-[var(--paint-f02b78)]/15", "-right-32 bottom-0 size-[420px] bg-blue-600/20", "hidden"],
    minimal: ["right-1/3 top-0 size-80 bg-violet-600/15", "hidden", "hidden"],
  }[variant];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {lights.map((classes, index) => <span className={`absolute rounded-full blur-[110px] ${classes}`} key={index} />)}
      {variant === "hero" ? <span className="absolute inset-0 opacity-20 [background-image:radial-gradient(var(--paint-ffffff73)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" /> : null}
    </div>
  );
}
