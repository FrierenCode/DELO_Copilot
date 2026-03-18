"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "landing-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.landingTheme = theme;
}

export function LandingThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);
      const nextTheme = savedTheme === "light" ? "light" : "dark";
      setTheme(nextTheme);
      applyTheme(nextTheme);
    } catch {
      applyTheme("dark");
    }
  }, []);

  function handleSetTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage errors and keep the current page state in sync.
    }
  }

  return (
    <div className="hidden items-center gap-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] p-1 text-xs font-medium text-[var(--landing-muted)] transition-colors md:flex">
      <button
        type="button"
        onClick={() => handleSetTheme("light")}
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
        onClick={() => handleSetTheme("dark")}
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
