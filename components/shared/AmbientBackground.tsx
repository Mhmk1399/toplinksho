type AmbientBackgroundProps = { variant?: "hero" | "service" | "portfolio" | "minimal" };

export function AmbientBackground({ variant = "minimal" }: AmbientBackgroundProps) {
  return (
    <div className={`ambient ambient-${variant}`} aria-hidden="true">
      <span className="ambient-light light-a" />
      <span className="ambient-light light-b" />
      <span className="ambient-light light-c" />
      {variant === "hero" ? <span className="ambient-particles" /> : null}
    </div>
  );
}
