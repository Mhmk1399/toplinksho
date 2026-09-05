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
      {"loading" in props && props.loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
      {icon && iconPosition === "start" ? icon : null}
      <span>{children}</span>
      {icon && iconPosition === "end" ? icon : null}
    </>
  );
  const base = "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-[15px] border border-transparent font-semibold text-white transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0";
  const variants = {
    primary: "bg-[linear-gradient(135deg,#3157ff_0%,#8b3dff_45%,#f02b78_100%)] shadow-[0_10px_30px_rgba(124,58,237,.25),inset_0_1px_0_rgba(255,255,255,.28)] hover:shadow-[0_13px_36px_rgba(240,43,120,.3),inset_0_1px_0_rgba(255,255,255,.3)]",
    secondary: "border-white/15 bg-white/[.055] backdrop-blur-sm hover:border-white/25 hover:bg-white/[.09]",
    ghost: "bg-transparent text-white/70 hover:bg-white/[.045] hover:text-white",
    icon: "w-12 border-white/10 bg-[#0f1737]/45 p-0",
  };
  const sizes = { sm: "min-h-11 px-5 text-sm", md: "px-6 text-[15px]", lg: "min-h-[54px] px-7 text-base" };
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

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
