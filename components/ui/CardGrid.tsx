import type { ReactNode } from "react";

export function CardGrid({
  children,
  label,
  mobileScroll = false,
  className = "",
}: {
  children: ReactNode;
  label: string;
  mobileScroll?: boolean;
  className?: string;
}) {
  return (
    <div className={`card-grid-wrap ${className}`}>
      {mobileScroll && (
        <p className="card-grid-cue">
          برای دیدن کارت‌های بیشتر، به طرفین بکشید.
        </p>
      )}
      <div
        className={`card-grid ${mobileScroll ? "card-grid--rail" : ""}`}
        {...(mobileScroll
          ? { role: "region", "aria-label": label, tabIndex: 0 }
          : {})}
      >
        {children}
      </div>
    </div>
  );
}
