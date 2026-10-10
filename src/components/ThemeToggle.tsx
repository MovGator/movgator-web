"use client";
import { Moon, Sun, Monitor } from "@phosphor-icons/react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const order = ["light", "dark", "system"] as const;
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Color theme: ${theme}. Activate to use ${next} theme.`}
      title={`Theme: ${theme} (switch to ${next})`}
      className="mr-chip inline-flex items-center gap-2 px-3 py-2 text-sm"
    >
      <Icon size={16} weight="regular" aria-hidden="true" />
      <span className="hidden sm:inline capitalize">{theme}</span>
    </button>
  );
}
