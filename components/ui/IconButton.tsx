import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function IconButton({ label, children, ...props }: { label: string; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return <Button variant="icon" aria-label={label} {...props}>{children}</Button>;
}
