import Link from "next/link";
import type { Deal, DealStatus } from "@/types/deal";

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

function getDeadlineChip(deadline?: string): { label: string; urgent: boolean; past: boolean } | null {
  if (!deadline) return null;
  const now = Date.now();
  const dl = new Date(deadline).getTime();
  const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `D+${Math.abs(diffDays)}`, urgent: false, past: true };
  if (diffDays <= 3) return { label: `D-${diffDays}`, urgent: true, past: false };
  return { label: `D-${diffDays}`, urgent: false, past: false };
}

export function DealCard({ deal }: { deal: Deal }) {
  const visual = STATUS_VISUAL[deal.status] ?? STATUS_VISUAL.Lead;
  const chip = getDeadlineChip(deal.deadline);
  const monogram = deal.brand_name.slice(0, 1).toUpperCase();
  const monogramGradient = getMonogramGradient(deal.brand_name);
  const formattedAmount =
    deal.quote_target > 0 ? `₩${deal.quote_target.toLocaleString("ko-KR")}` : "—";

  return (
    <Link
      href={`/dashboard/deals/${deal.id}`}
      className="d-pixel-card group relative flex items-center overflow-hidden rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] transition-all duration-200 hover:border-[#6366F1]/30 hover:bg-[var(--d-surface2)] hover:shadow-lg hover:shadow-[#6366F1]/5 hover:-translate-y-0.5"
    >
      {/* Left gradient edge bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${visual.edgeGradient}`} />

      {/* Hover shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/20 to-transparent" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 pl-6 sm:grid-cols-12 sm:items-center sm:gap-4 sm:p-5 sm:pl-7">
        {/* Brand monogram + name + channel */}
        <div className="flex min-w-0 items-center gap-3 sm:col-span-4 sm:gap-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${monogramGradient} flex items-center justify-center font-black text-white text-sm shrink-0 shadow-lg`}>
            {monogram}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-[var(--d-h)] truncate group-hover:text-[var(--d-h)] transition-colors">{deal.brand_name}</h4>
            {deal.contact_channel && (
              <p className="text-[10px] text-[var(--d-f)] mt-0.5 truncate">{deal.contact_channel}</p>
            )}
          </div>
        </div>

        {/* Status badge + amount */}
        <div className="flex items-center justify-between gap-3 sm:col-span-3 sm:flex-col sm:items-center sm:justify-center sm:gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${visual.badgeBg} ${visual.badgeText}`}
          >
            {visual.label}
          </span>
          <p className="text-xs font-black text-[var(--d-b)] tabular-nums">{formattedAmount}</p>
        </div>

        {/* Next action + deadline chip */}
        <div className="flex items-start justify-between gap-3 sm:col-span-4 sm:items-center sm:justify-end">
          {deal.next_action && (
            <div className="text-right min-w-0">
              <p className="text-[11px] font-bold text-[var(--d-b)] truncate">{deal.next_action}</p>
              <p className="text-[10px] text-[var(--d-f)]">Next Action</p>
            </div>
          )}
          {chip &&
            (chip.urgent ? (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 px-2 py-1 rounded-lg text-red-400 shrink-0">
                <span className="text-[10px] font-black">{chip.label}</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
              </div>
            ) : (
              <span
                className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                  chip.past ? "bg-[var(--d-border)] text-[var(--d-f)]" : "bg-[var(--d-border)] text-[var(--d-m)]"
                }`}
              >
                {chip.label}
              </span>
            ))}
        </div>

        {/* Arrow icon */}
        <div className="hidden sm:col-span-1 sm:flex sm:justify-end">
          <svg
            className="w-4 h-4 text-slate-600 group-hover:text-[#6366F1] transition-all duration-200 group-hover:translate-x-0.5"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
