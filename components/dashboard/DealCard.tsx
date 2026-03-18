import Link from "next/link";
import type { Deal, DealStatus } from "@/types/deal";

type StatusVisual = {
  edgeColor: string;
  badgeBg: string;
  badgeText: string;
};

const STATUS_VISUAL: Record<DealStatus, StatusVisual> = {
  Lead:        { edgeColor: "bg-slate-600",   badgeBg: "bg-slate-800",       badgeText: "text-slate-400" },
  Replied:     { edgeColor: "bg-blue-500",    badgeBg: "bg-blue-500/10",     badgeText: "text-blue-400" },
  Negotiating: { edgeColor: "bg-amber-500",   badgeBg: "bg-amber-500/10",    badgeText: "text-amber-500" },
  Confirmed:   { edgeColor: "bg-green-500",   badgeBg: "bg-emerald-500/10",  badgeText: "text-emerald-500" },
  Delivered:   { edgeColor: "bg-teal-500",    badgeBg: "bg-teal-500/10",     badgeText: "text-teal-400" },
  Paid:        { edgeColor: "bg-emerald-500", badgeBg: "bg-emerald-600/10",  badgeText: "text-emerald-600" },
  ClosedLost:  { edgeColor: "bg-gray-600",    badgeBg: "bg-gray-800",        badgeText: "text-gray-400" },
};

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
  const formattedAmount =
    deal.quote_target > 0 ? `₩${deal.quote_target.toLocaleString("ko-KR")}` : "—";

  return (
    <Link
      href={`/dashboard/deals/${deal.id}`}
      className="group relative flex items-center bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden hover:border-slate-700 transition-all"
    >
      {/* Left color edge bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${visual.edgeColor}`} />

      <div className="flex-1 grid grid-cols-12 gap-4 items-center p-5 pl-7">
        {/* Brand monogram + name + channel */}
        <div className="col-span-4 flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-sm shrink-0">
            {monogram}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-100 truncate">{deal.brand_name}</h4>
            {deal.contact_channel && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{deal.contact_channel}</p>
            )}
          </div>
        </div>

        {/* Status badge + amount */}
        <div className="col-span-3 flex flex-col items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${visual.badgeBg} ${visual.badgeText}`}
          >
            {deal.status}
          </span>
          <p className="text-xs font-bold text-slate-200">{formattedAmount}</p>
        </div>

        {/* Next action + deadline chip */}
        <div className="col-span-5 flex items-center justify-end gap-3">
          {deal.next_action && (
            <div className="text-right min-w-0">
              <p className="text-[11px] font-bold text-slate-300 truncate">{deal.next_action}</p>
              <p className="text-[10px] text-slate-500">Next Action</p>
            </div>
          )}
          {chip &&
            (chip.urgent ? (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-red-500 shrink-0">
                <span className="text-[10px] font-black">{chip.label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
            ) : (
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ${
                  chip.past ? "bg-slate-800 text-slate-500" : "bg-slate-800 text-slate-400"
                }`}
              >
                {chip.label}
              </span>
            ))}
        </div>
      </div>
    </Link>
  );
}
