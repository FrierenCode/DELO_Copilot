"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { History, LayoutDashboard, ScanSearch, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드", Icon: LayoutDashboard },
  { href: "/dashboard/intake", label: "문의 분석", Icon: ScanSearch },
  { href: "/dashboard/history", label: "히스토리", Icon: History },
  { href: "/dashboard/settings", label: "설정", Icon: Settings },
] as const;

const STORAGE_KEY = "landing-theme";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const dark = saved !== "light";
      setIsDark(dark);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("landing-light", !isDark);
    root.classList.toggle("landing-dark", isDark);
    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark, mounted]);

  if (!mounted) {
    return <div className="h-8 w-[3.75rem] rounded-full bg-[var(--d-border)]" />;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={() => setIsDark(!isDark)}
      className="relative flex h-8 w-[3.75rem] items-center rounded-full border border-[var(--d-border)] bg-[var(--d-bg)] p-1 shadow-inner transition-all duration-300 hover:border-[#6366F1]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/50"
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
            !isDark ? "text-amber-400 opacity-100 scale-110" : "text-slate-600 opacity-40 scale-90",
          ].join(" ")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </span>
        {/* Moon */}
        <span
          className={[
            "flex items-center justify-center transition-all duration-300",
            isDark ? "text-[#a78bfa] opacity-100 scale-110" : "text-slate-600 opacity-40 scale-90",
          ].join(" ")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </span>

      {/* Sliding thumb */}
      <span
        className={[
          "absolute top-1 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300",
          isDark
            ? "left-[calc(100%-1.75rem)] bg-gradient-to-br from-[#6366F1] to-indigo-500 text-white"
            : "left-1 bg-gradient-to-br from-amber-400 to-orange-400 text-white",
        ].join(" ")}
        style={{ boxShadow: isDark ? "0 2px 8px rgba(99,102,241,0.4)" : "0 2px 8px rgba(251,191,36,0.4)" }}
      >
        {isDark ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        )}
      </span>
    </button>
  );
}

type Props = {
  userEmail: string | null;
  userName: string | null;
  isPro: boolean;
};

export function SidebarNav({ userEmail, userName, isPro }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const displayName = userName || userEmail?.split("@")[0] || "사용자";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className="hidden h-screen w-[240px] shrink-0 flex-col border-r border-[var(--d-border)] bg-[var(--d-surface2)] md:flex">
      <Link href="/" className="flex items-center gap-3 p-6 pb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366F1] to-indigo-500 text-white text-sm font-black shadow-lg shadow-[#6366F1]/30">
          D
        </div>
        <h1 className="text-xl font-black tracking-tighter text-[var(--d-h)]">DELO</h1>
      </Link>
      <div className="h-px bg-gradient-to-r from-[#6366F1]/20 to-transparent mx-4 mb-2" />

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 py-2.5 text-sm transition-all",
                active
                  ? "rounded-r-lg bg-[#6366F1]/10 font-semibold text-[#6366F1] border-l-2 border-[#6366F1] pl-[10px] pr-3"
                  : "rounded-lg px-3 font-medium text-[var(--d-m)] hover:bg-white/[0.04] hover:text-[var(--d-h)]",
              ].join(" ")}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--d-border)] p-4 space-y-3">
        {/* Theme toggle row */}
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-semibold text-[var(--d-f)] uppercase tracking-wider">테마</span>
          <ThemeToggle />
        </div>

        {/* User row */}
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-purple-500 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[var(--d-b)]">{displayName}</p>
            {isPro ? (
              <span className="mt-0.5 inline-block rounded border border-[#6366F1]/20 bg-gradient-to-r from-[#6366F1]/20 to-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-[#a78bfa]">
                Pro Plan
              </span>
            ) : (
              <span className="mt-0.5 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                Free Plan
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 text-[10px] text-[var(--d-f)] transition-colors hover:text-[var(--d-m)]"
            title="로그아웃"
          >
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
