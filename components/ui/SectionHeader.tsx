type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  highlightText?: string;
  description?: string;
  alignment?: "right" | "center";
};

export function SectionHeader({ eyebrow, title, highlightText, description, alignment = "right" }: SectionHeaderProps) {
  const parts = highlightText ? title.split(highlightText) : [title];
  return (
    <header className={`max-w-[650px] ${alignment === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#d8caff] before:h-px before:w-5 before:bg-[#ff3d9a] before:shadow-[0_0_12px_#f02b78]">{eyebrow}</span> : null}
      <h2 className="m-0 text-[clamp(30px,3.4vw,46px)] leading-[1.35] font-[780]">{parts[0]}{highlightText ? <span className="bg-[linear-gradient(135deg,#3157ff,#8b3dff_45%,#f02b78)] bg-clip-text text-transparent">{highlightText}</span> : null}{parts[1]}</h2>
      {description ? <p className="mt-4 text-[17px] leading-[1.9] text-white/70">{description}</p> : null}
    </header>
  );
}
