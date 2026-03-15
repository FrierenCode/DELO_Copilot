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

  // Dashboard pages have their own sidebar — hide the root nav there.
  if (pathname.startsWith("/dashboard")) return null;

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
