export function NarrativeCopy({ intro, paragraphs = [] }: { intro?: string; paragraphs?: string[] }) {
  return <div data-page-copy className="max-w-4xl space-y-4 text-sm leading-8 text-slate-300 sm:text-base sm:leading-9">
    {intro && <p>{intro}</p>}
    {paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
  </div>;
}
