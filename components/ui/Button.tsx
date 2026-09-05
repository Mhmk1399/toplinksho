import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "start" | "end";
};

type LinkButtonProps = BaseProps & { href: string; loading?: never; disabled?: never };
type NativeButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never; loading?: boolean };

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const {
    children,
    className = "",
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "end",
  } = props;
  const content = (
    <>
      {"loading" in props && props.loading ? <LoaderCircle className="spin" size={18} /> : null}
      {icon && iconPosition === "start" ? icon : null}
      <span>{children}</span>
      {icon && iconPosition === "end" ? icon : null}
    </>
  );
  const classes = `button button-${variant} button-${size} ${className}`;

  if ("href" in props && props.href) {
    return <Link href={props.href} className={classes}>{content}</Link>;
  }

  const { loading, ...buttonProps } = props as NativeButtonProps;
  return (
    <button className={classes} disabled={buttonProps.disabled || loading} {...buttonProps}>
      {content}
    </button>
  );
}
