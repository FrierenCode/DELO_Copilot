"use client";

import { usePathname } from "next/navigation";

export function RootMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // These pages manage their own layout.
  if (
    pathname.startsWith("/dashboard") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/settings" ||
    pathname === "/onboarding" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/how-it-works" ||
    pathname === "/parse"
  ) {
    return <div className="min-h-screen">{children}</div>;
  }

  return <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>;
}
