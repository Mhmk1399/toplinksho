import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function IconButton({ label, children, onClick, type = "button", ...props }: { label: string; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return <Button variant="icon" type={type} onClick={onClick} aria-label={label} {...props}>{children}</Button>;
}
