"use client";

import Image from "next/image";
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
    pathname === "/signup" ||
    pathname === "/onboarding" ||
    pathname === "/terms" ||
    pathname === "/privacy"
  ) return null;

  return (
    <header className="border-b border-[#1E1E2E]/60 bg-[#0A0A0F]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/fox-icon.svg" width={24} height={24} alt="DELO 로고" priority />
          <span className="text-sm font-semibold tracking-tight text-white">DELO</span>
        </Link>
        <nav className="flex gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 transition-colors hover:text-[#6366F1]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
