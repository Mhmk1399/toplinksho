"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

export function SiteFrame({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <SmoothScroll />
      {header}
      {children}
      {footer}
    </>
  );
}
