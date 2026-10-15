"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-boot";

export type Theme = "dark" | "light";


function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

/** Current theme, kept in sync with <html data-theme> so every component (including WebGL scenes) can react. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const setTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch { /* storage unavailable: still switches for this visit */ }
    window.setTimeout(() => root.classList.remove("theme-anim"), 400);
  }, []);
  const toggle = useCallback(() => setTheme(read() === "dark" ? "light" : "dark"), [setTheme]);
  return { theme, setTheme, toggle };
}
