"use client";

import Image from "next/image";
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
      <span
        className={[
          "absolute inset-0 rounded-full transition-all duration-300",
          isDark
            ? "bg-gradient-to-r from-[#6366F1]/20 to-indigo-900/20"
            : "bg-gradient-to-r from-amber-400/15 to-orange-300/10",
        ].join(" ")}
      />

      <span className="relative flex w-full items-center justify-between px-1">
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
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--d-border)] bg-[var(--d-surface)]/95 px-4 py-3 backdrop-blur-md md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/fox-icon.svg"
            width={24}
            height={24}
            alt="DELO 로고"
            priority
            className="[image-rendering:pixelated]"
          />
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-[var(--d-h)] leading-none">DELO</span>
            <span className="border border-[var(--d-border)] bg-[var(--d-surface2)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--d-m)]">
              {isPro ? "Standard" : "Free"}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="text-[11px] font-medium text-[var(--d-m)] transition-colors hover:text-[var(--d-h)]"
            title="로그아웃"
          >
            로그아웃
          </button>
        </div>
      </header>

      <aside className="sidebar-pixel hidden h-screen w-[240px] shrink-0 flex-col border-r-2 border-[var(--d-border)] bg-[var(--d-surface2)] md:flex">
        <Link href="/" className="flex items-center gap-3 px-5 py-5 pb-4">
          <Image
            src="/fox-icon.svg"
            width={28}
            height={28}
            alt="DELO 로고"
            priority
            className="[image-rendering:pixelated]"
          />
          <h1 className="font-pixel text-[11px] text-[var(--d-h)] leading-none">DELO</h1>
        </Link>

        <div className="mx-4 mb-3 border-t-2 border-dashed border-[#6366F1]/25" />

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 py-2.5 text-sm transition-all duration-150",
                  active
                    ? "border-l-2 border-[#6366F1] bg-[#6366F1]/10 pl-[10px] pr-3 font-semibold text-[#6366F1] shadow-[2px_2px_0_rgba(99,102,241,0.30)]"
                    : "px-3 font-medium text-[var(--d-m)] hover:translate-x-px hover:bg-[var(--d-nav-hover)] hover:text-[var(--d-h)] hover:shadow-[1px_1px_0_rgba(99,102,241,0.20)]",
                ].join(" ")}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t-2 border-dashed border-[var(--d-border)] p-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-pixel text-[7px] uppercase tracking-widest text-[var(--d-f)]">THEME</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 p-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-gradient-to-br from-[#6366F1] to-purple-500 text-xs font-bold text-white"
              style={{ boxShadow: "2px 2px 0 rgba(99,102,241,0.45)" }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[var(--d-b)]">{displayName}</p>
              {isPro ? (
                <span
                  className="mt-0.5 inline-block border border-[#6366F1]/30 bg-gradient-to-r from-[#6366F1]/20 to-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-[#a78bfa]"
                  style={{ boxShadow: "1px 1px 0 rgba(99,102,241,0.25)" }}
                >
                  Standard
                </span>
              ) : (
                <span className="mt-0.5 inline-block border border-[var(--d-border)] bg-[var(--d-border)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--d-m)]">
                  Free
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

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--d-border)] bg-[var(--d-surface)]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition-colors",
                  active ? "text-[#6366F1]" : "text-[var(--d-m)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center border transition-colors",
                    active
                      ? "border-[#6366F1]/40 bg-[#6366F1]/10"
                      : "border-[var(--d-border)] bg-[var(--d-surface2)]",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
