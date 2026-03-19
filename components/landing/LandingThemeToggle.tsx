"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "landing-theme";

type Theme = "light" | "dark";

export function LandingThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("landing-light", theme === "light");
    root.classList.toggle("landing-dark", theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div className="hidden items-center gap-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] p-1 text-xs font-medium text-[var(--landing-muted)] transition-colors md:flex">
        <button type="button" className="rounded-full px-3 py-1.5 transition-colors hover:text-[var(--landing-text)]">
          Light
        </button>
        <button type="button" className="rounded-full bg-[var(--landing-accent)] px-3 py-1.5 text-white transition-colors">
          Dark
        </button>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] p-1 text-xs font-medium text-[var(--landing-muted)] transition-colors md:flex">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={[
          "rounded-full px-3 py-1.5 transition-colors",
          theme === "light"
            ? "bg-[var(--landing-accent)] text-white"
            : "hover:text-[var(--landing-text)]",
        ].join(" ")}
        aria-pressed={theme === "light"}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={[
          "rounded-full px-3 py-1.5 transition-colors",
          theme === "dark"
            ? "bg-[var(--landing-accent)] text-white"
            : "hover:text-[var(--landing-text)]",
        ].join(" ")}
        aria-pressed={theme === "dark"}
      >
        Dark
      </button>
    </div>
  );
}
