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
          ? "rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          : "rounded-lg border border-neutral-200 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
      }
    >
      {label}
    </Link>
  );
}
