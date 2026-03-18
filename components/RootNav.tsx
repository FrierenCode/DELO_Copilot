"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/parse", label: "Parse" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export function RootNav() {
  const pathname = usePathname();

  // These pages manage their own nav/layout.
  if (
    pathname.startsWith("/dashboard") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/terms" ||
    pathname === "/privacy"
  ) return null;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900">
          Deal Copilot
        </Link>
        <nav className="flex gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
