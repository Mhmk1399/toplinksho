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
    <header className={`section-header align-${alignment}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2>{parts[0]}{highlightText ? <span className="gradient-text">{highlightText}</span> : null}{parts[1]}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
