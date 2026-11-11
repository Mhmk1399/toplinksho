import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Container<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...props
}: ContainerProps<T>) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={`relative z-[1] mx-auto w-[min(calc(100%-4rem),80rem)] max-md:w-[min(calc(100%-2rem),80rem)] ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
