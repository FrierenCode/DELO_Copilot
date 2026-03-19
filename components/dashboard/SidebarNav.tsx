"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { History, LayoutDashboard, ScanSearch, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드", Icon: LayoutDashboard },
  { href: "/dashboard/intake", label: "문의 분석", Icon: ScanSearch },
  { href: "/history", label: "히스토리", Icon: History },
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
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[#1E1E2E] bg-[#0D0D14] md:flex">
      <Link href="/" className="flex items-center gap-2 p-6">
        <span className="text-xl font-black leading-none text-indigo-400">D.</span>
        <h1 className="text-xl font-black tracking-tighter text-slate-100">DELO</h1>
      </Link>

      <nav className="flex-1 space-y-1 px-4">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-indigo-500/10 font-semibold text-indigo-400"
                  : "font-medium text-slate-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#1E1E2E] p-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1E1E2E] bg-slate-800 text-xs font-bold text-slate-300">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-200">{displayName}</p>
            {isPro ? (
              <span className="mt-0.5 inline-block rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400">
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
            className="shrink-0 text-[10px] text-slate-600 transition-colors hover:text-slate-400"
            title="로그아웃"
          >
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
