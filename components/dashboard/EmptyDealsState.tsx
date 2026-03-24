"use client";

import Link from "next/link";
import type { DealStatus } from "@/types/deal";
import { getSampleDeals, type SampleDeal } from "@/constants/sample-deals";

// ── Visual maps (mirrors DealCard.tsx) ────────────────────────────────────────

type StatusVisual = {
  edgeGradient: string;
  badgeBg: string;
  badgeText: string;
  label: string;
};

const STATUS_VISUAL: Record<DealStatus, StatusVisual> = {
  Lead:        { edgeGradient: "from-slate-500 to-slate-600",     badgeBg: "bg-[var(--d-border)]",  badgeText: "text-slate-400",   label: "Lead" },
  Replied:     { edgeGradient: "from-blue-500 to-blue-600",       badgeBg: "bg-blue-500/10",        badgeText: "text-blue-400",    label: "Replied" },
  Negotiating: { edgeGradient: "from-amber-400 to-orange-500",    badgeBg: "bg-amber-500/10",       badgeText: "text-amber-400",   label: "Negotiating" },
  Confirmed:   { edgeGradient: "from-emerald-400 to-green-500",   badgeBg: "bg-emerald-500/10",     badgeText: "text-emerald-400", label: "Confirmed" },
  Delivered:   { edgeGradient: "from-teal-400 to-teal-500",       badgeBg: "bg-teal-500/10",        badgeText: "text-teal-400",    label: "Delivered" },
  Paid:        { edgeGradient: "from-emerald-400 to-emerald-600", badgeBg: "bg-emerald-600/10",     badgeText: "text-emerald-500", label: "Paid" },
  ClosedLost:  { edgeGradient: "from-gray-500 to-gray-700",       badgeBg: "bg-[var(--d-border)]",  badgeText: "text-gray-500",    label: "Closed" },
};

const MONOGRAM_GRADIENTS = [
  "from-[#6366F1] to-indigo-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-sky-500 to-blue-500",
  "from-violet-500 to-purple-600",
];

function getMonogramGradient(name: string): string {
  const code = name.charCodeAt(0) || 0;
  return MONOGRAM_GRADIENTS[code % MONOGRAM_GRADIENTS.length];
}

// ── SampleDealCard ─────────────────────────────────────────────────────────────

function SampleDealCard({ deal }: { deal: SampleDeal }) {
  const visual = STATUS_VISUAL[deal.status] ?? STATUS_VISUAL.Lead;
  const monogram = deal.brand_name.slice(0, 1).toUpperCase();
  const monogramGradient = getMonogramGradient(deal.brand_name);
  const formattedAmount = `₩${deal.quote_target.toLocaleString("ko-KR")}`;

  return (
    <div className="relative select-none overflow-hidden rounded-xl border border-dashed border-[var(--d-border)] bg-[var(--d-surface)] opacity-70">
      {/* Left gradient edge bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${visual.edgeGradient}`} />

      {/* Sample badge — top right */}
      <span className="absolute right-3 top-3 rounded-full border border-dashed border-[var(--d-border)] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[var(--d-f)]">
        샘플
      </span>

      <div className="grid grid-cols-1 gap-4 p-4 pl-6 sm:grid-cols-12 sm:items-center sm:gap-4 sm:p-5 sm:pl-7">
        {/* Brand monogram + name + channel */}
        <div className="flex min-w-0 items-center gap-3 sm:col-span-4 sm:gap-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${monogramGradient} flex items-center justify-center font-black text-white text-sm shrink-0 shadow-lg`}>
            {monogram}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-[var(--d-h)]">{deal.brand_name}</h4>
            {deal.contact_channel && (
              <p className="mt-0.5 truncate text-[10px] text-[var(--d-f)]">{deal.contact_channel}</p>
            )}
          </div>
        </div>

        {/* Status badge + amount */}
        <div className="flex items-center justify-between gap-3 sm:col-span-3 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${visual.badgeBg} ${visual.badgeText}`}>
            {visual.label}
          </span>
          <p className="text-xs font-black tabular-nums text-[var(--d-b)]">{formattedAmount}</p>
        </div>

        {/* Next action */}
        <div className="flex items-center justify-between sm:col-span-4 sm:justify-end">
          {deal.next_action && (
            <div className="min-w-0 text-right">
              <p className="truncate text-[11px] font-bold text-[var(--d-b)]">{deal.next_action}</p>
              <p className="text-[10px] text-[var(--d-f)]">Next Action</p>
            </div>
          )}
        </div>

        {/* Placeholder arrow (non-interactive) */}
        <div className="hidden sm:col-span-1 sm:flex sm:justify-end">
          <svg className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── EmptyDealsState ────────────────────────────────────────────────────────────

export function EmptyDealsState() {
  const samples = getSampleDeals();

  return (
    <div className="flex flex-col gap-4">
      {/* Sample notice banner */}
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--d-border)] bg-[var(--d-surface2)] px-4 py-2.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--d-f)]">미리보기</span>
        <span className="text-xs text-[var(--d-f)]">샘플 딜 — 실제 문의를 분석하면 이렇게 보여요</span>
      </div>

      {/* Sample deal cards */}
      <div className="space-y-3">
        {samples.map((deal) => (
          <SampleDealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Link
          href="/dashboard/intake"
          className="btn-gradient inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6366F1]/25"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          첫 협찬 문의 분석하기
        </Link>
      </div>
    </div>
  );
}
