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
          : "inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-4 text-base font-bold text-[var(--landing-text,#F8FAFC)] transition-all hover:border-[#6366F1]/40 hover:bg-[#6366F1]/5"
      }
    >
      {label}
    </Link>
  );
}
