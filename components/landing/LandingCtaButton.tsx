"use client";

import Link from "next/link";
import { trackClientEvent } from "@/lib/analytics-client";
import type { ClientAnalyticsProperties } from "@/lib/analytics-client";

type Props = {
  href: string;
  label: string;
  variant: "primary" | "secondary";
  event: string;
  eventProps?: ClientAnalyticsProperties;
};

export function LandingCtaButton({ href, label, variant, event, eventProps }: Props) {
  return (
    <Link
      href={href}
      onClick={() => trackClientEvent(event, eventProps)}
      className={
        variant === "primary"
          ? "inline-flex items-center justify-center rounded-full bg-[#6366F1] px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98]"
          : "inline-flex items-center justify-center rounded-full border border-[#1E1E2E] bg-[#13131A]/50 px-8 py-4 text-base font-bold text-[#F8FAFC] transition-all hover:bg-[#13131A]"
      }
    >
      {label}
    </Link>
  );
}
