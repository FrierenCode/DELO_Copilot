"use client";

import { usePathname } from "next/navigation";

export function RootMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dashboard pages manage their own layout (sidebar + content area).
  if (pathname.startsWith("/dashboard")) {
    return <div className="min-h-screen">{children}</div>;
  }

  return <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>;
}
