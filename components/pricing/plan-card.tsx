"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { trackClientEvent } from "@/lib/analytics-client";

export type PlanFeature = {
  text: string;
  included: boolean;
};

type Props = {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  badge?: string;
  features: PlanFeature[];
  ctaLabel: string;
  /** "free" = simple Link to /signup, "checkout" = Polar checkout flow */
  ctaVariant: "free" | "checkout";
  isLoggedIn: boolean;
  isHighlighted?: boolean;
};

export function PlanCard({
  name,
  price,
  priceNote,
  description,
  badge,
  features,
  ctaLabel,
  ctaVariant,
  isLoggedIn,
  isHighlighted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!isLoggedIn) {
      window.location.href = "/signup?redirect=/pricing";
      return;
    }
    setLoading(true);
    setError(null);
    try {
      trackClientEvent("checkout_started", { source: "pricing_page" });
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_path: "/pricing" }),
      });
      const data = await res.json();
      if (!res.ok || !data.data?.url) {
        setError("결제 페이지를 열 수 없습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      window.location.href = data.data.url;
    } catch {
      setError("결제 페이지를 열 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
        isHighlighted
          ? "shadow-[0_0_48px_var(--p-glow)]"
          : ""
      }`}
      style={{
        backgroundColor: "var(--p-surface)",
        borderColor: isHighlighted ? "var(--p-primary)" : "var(--p-border)",
      }}
    >
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="whitespace-nowrap rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white"
            style={{ background: "var(--p-btn-gradient)" }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="mb-6">
        <p
          className="mb-2 text-xs font-black uppercase tracking-widest"
          style={{ color: "var(--p-secondary)" }}
        >
          {name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black" style={{ color: "var(--p-text)" }}>
            {price}
          </span>
          <span className="text-sm" style={{ color: "var(--p-muted)" }}>
            {priceNote}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
          {description}
        </p>
      </div>

      {/* Feature list */}
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            {f.included ? (
              <Check
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--p-primary)" }}
              />
            ) : (
              <X
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--p-dim)" }}
              />
            )}
            <span
              className="text-sm leading-snug"
              style={{ color: f.included ? "var(--p-text)" : "var(--p-muted)" }}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {error && (
        <p className="mb-3 text-xs" style={{ color: "var(--p-error)" }}>
          {error}
        </p>
      )}

      {/* CTA */}
      {ctaVariant === "free" ? (
        <Link
          href="/signup"
          onClick={() => trackClientEvent("landing_cta_clicked", { cta: "pricing_free" })}
          className="block w-full rounded-full border py-3 text-center text-sm font-bold transition-all hover:brightness-110 active:scale-95"
          style={{
            borderColor: "var(--p-border)",
            color: "var(--p-text)",
          }}
        >
          {ctaLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-full py-3 text-center text-sm font-black text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "var(--p-btn-gradient)", boxShadow: "var(--p-btn-shadow)" }}
        >
          {loading ? "처리 중..." : ctaLabel}
        </button>
      )}
    </div>
  );
}
