import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "gold" | "ghost" | "danger";
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 min-h-[44px]";
  const styles: Record<string, string> = {
    primary: "mr-btn-primary",
    gold: "mr-btn-gold",
    ghost: "mr-chip",
    danger: "rounded-full border border-red-400 text-red-600 font-semibold",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;
}
