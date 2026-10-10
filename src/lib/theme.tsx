"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const KEY = "mr-theme";

function resolved(t: Theme): "light" | "dark" {
  if (t !== "system" || typeof window === "undefined") return t === "dark" ? "dark" : "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: "system", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme) || "system";
    setThemeState(saved);
    document.documentElement.dataset.theme = resolved(saved);
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(KEY) as Theme) === "system" || !localStorage.getItem(KEY)) {
        document.documentElement.dataset.theme = mq.matches ? "dark" : "light";
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(KEY, t);
    document.documentElement.dataset.theme = resolved(t);
  };
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

/** Inline <script> source to avoid theme flash: keep in sync with resolved(). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('mr-theme')||'system';var d=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.theme=d;}catch(e){document.documentElement.dataset.theme='light';}})();`;
