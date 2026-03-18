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
          ? "inline-flex items-center justify-center rounded-full bg-[var(--landing-accent,#6366F1)] px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
          : "inline-flex items-center justify-center rounded-full border border-[var(--landing-border,#1E1E2E)] bg-[var(--landing-surface,#13131A)]/80 px-8 py-4 text-base font-bold text-[var(--landing-text,#F8FAFC)] transition-all hover:brightness-95"
      }
    >
      {label}
    </Link>
  );
}
