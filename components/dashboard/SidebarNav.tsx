"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard/intake", label: "Intake" },
  { href: "/dashboard", label: "Deals" },
  { href: "/settings", label: "Settings" },
] as const;

type Props = {
  userEmail: string | null;
  isPro: boolean;
};

export function SidebarNav({ userEmail, isPro }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string): boolean {
    // Exact match for /dashboard to avoid matching /dashboard/intake
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-neutral-200 bg-white">
      {/* Logo + Pro badge */}
      <div className="border-b border-neutral-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-neutral-900">Deal Copilot</span>
          {isPro && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              PRO
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={[
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
            ].join(" ")}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-neutral-100 px-4 py-3">
        {userEmail && (
          <p className="mb-2 truncate text-xs text-neutral-400" title={userEmail}>
            {userEmail}
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
