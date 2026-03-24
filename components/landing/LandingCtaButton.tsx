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
          ? "btn-gradient group inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-bold text-white"
          : "inline-flex items-center justify-center rounded-full border-2 border-[var(--landing-accent)]/30 px-8 py-4 text-base font-bold text-[var(--landing-text,#F8FAFC)] transition-all hover:border-[var(--landing-accent)]/60 hover:bg-[var(--landing-accent)]/8"
      }
      style={variant === "secondary" ? { boxShadow: "3px 3px 0 rgba(99,102,241,0.18)" } : undefined}
    >
      {label}
    </Link>
  );
}
