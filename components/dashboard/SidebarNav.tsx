"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, ScanSearch, History, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드", Icon: LayoutDashboard },
  { href: "/dashboard/intake", label: "새 문의 분석", Icon: ScanSearch },
  { href: "/dashboard/history", label: "히스토리", Icon: History },
  { href: "/settings", label: "설정", Icon: Settings },
] as const;

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
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col bg-[#0D0D14] border-r border-[#1E1E2E]">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <span className="text-indigo-400 text-xl font-black leading-none">⚡</span>
        <h1 className="text-xl font-black tracking-tighter text-slate-100">DELO</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 font-medium",
              ].join(" ")}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-[#1E1E2E]">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-[#1E1E2E] text-xs font-bold text-slate-300 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{displayName}</p>
            {isPro ? (
              <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-bold mt-0.5">
                Pro Plan
              </span>
            ) : (
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[9px] font-bold mt-0.5">
                Free Plan
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors shrink-0"
            title="로그아웃"
          >
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
}
