import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { formatKRW, formatDate } from "@/lib/dashboard-helpers";
import type { Deal } from "@/types/deal";

export function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link
      href={`/dashboard/deals/${deal.id}`}
      className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-1 text-sm font-semibold text-neutral-900">
          {deal.brand_name}
        </span>
        <StatusBadge status={deal.status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span>견적 {formatKRW(deal.quote_target)}</span>
        {deal.deadline && <span>마감 {formatDate(deal.deadline)}</span>}
      </div>

      {deal.next_action && (
        <p className="line-clamp-1 text-xs text-neutral-400">→ {deal.next_action}</p>
      )}
    </Link>
  );
}
