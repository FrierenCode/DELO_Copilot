"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "landing-theme";

type Theme = "light" | "dark";

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

function Toggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-8 w-[3.75rem] items-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] p-1 shadow-inner transition-all duration-300 hover:border-[#6366F1]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/50"
    >
      {/* Track fill */}
      <span
        className={[
          "absolute inset-0 rounded-full transition-all duration-300",
          isDark
            ? "bg-gradient-to-r from-[#6366F1]/20 to-indigo-900/20"
            : "bg-gradient-to-r from-amber-400/15 to-orange-300/10",
        ].join(" ")}
      />

      {/* Icons row */}
      <span className="relative flex w-full items-center justify-between px-1">
        {/* Sun */}
        <span
          className={[
            "flex items-center justify-center transition-all duration-300",
            !isDark ? "text-amber-400 opacity-100 scale-110" : "text-[var(--landing-muted)] opacity-40 scale-90",
          ].join(" ")}
        >
          <SunIcon />
        </span>
        {/* Moon */}
        <span
          className={[
            "flex items-center justify-center transition-all duration-300",
            isDark ? "text-[#a78bfa] opacity-100 scale-110" : "text-[var(--landing-muted)] opacity-40 scale-90",
          ].join(" ")}
        >
          <MoonIcon />
        </span>
      </span>

      {/* Sliding thumb */}
      <span
        className={[
          "absolute top-1 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300",
          isDark
            ? "left-[calc(100%-1.75rem)] bg-gradient-to-br from-[#6366F1] to-indigo-500 text-white shadow-[#6366F1]/30"
            : "left-1 bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-amber-400/30",
        ].join(" ")}
        style={{ boxShadow: isDark ? "0 2px 8px rgba(99,102,241,0.4)" : "0 2px 8px rgba(251,191,36,0.4)" }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

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
    return <div className="h-8 w-[3.75rem] rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)]" />;
  }

  return <Toggle theme={theme} setTheme={setTheme} />;
}
