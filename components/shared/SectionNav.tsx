import { ListTree } from "lucide-react";
import { Container } from "@/components/ui/Container";

type SectionLink = { id: string; label: string };

export function SectionNav({ items }: { items: readonly SectionLink[] }) {
  return (
    <Container as="nav" aria-label="دسترسی سریع این صفحه" className="page-section-nav mb-5">
      <div className="section-nav-shell flex min-w-0 items-center gap-3 rounded-3xl px-2 py-1 lg:w-fit lg:max-w-full lg:px-3">
        <span className="hidden shrink-0 items-center gap-2 border-e border-line pe-5 ps-2 text-xs text-muted lg:inline-flex">
          <ListTree size={17} aria-hidden="true" className="text-accent" />
          در این صفحه
        </span>
        <ul className="section-nav-links flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overscroll-x-contain p-1">
          {items.map(({ id, label }) => (
            <li key={id} className="shrink-0">
              <a href={`#${id}`} className="section-nav-link flex min-h-11 items-center justify-center whitespace-nowrap rounded-2xl border px-4 py-2 text-xs font-semibold sm:px-5">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
