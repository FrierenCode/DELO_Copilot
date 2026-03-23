"use client";

import { usePathname } from "next/navigation";

// Only these app routes use the shared constrained layout.
// All other routes (public pages, auth, dashboard) manage their own layout.
// Add a path here only if it needs the shared max-w-3xl main wrapper.
const APP_CONSTRAINED_ROUTES = ["/history"];

export function RootMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (APP_CONSTRAINED_ROUTES.includes(pathname)) {
    return <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>;
  }

  return <div className="min-h-screen">{children}</div>;
}
