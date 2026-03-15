import { formatKRW } from "@/lib/dashboard-helpers";
import type { DashboardSummary } from "@/lib/dashboard-helpers";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    { label: "전체 딜", value: String(summary.total) },
    { label: "진행중", value: String(summary.active) },
    { label: "이번 주 마감", value: String(summary.dueThisWeek) },
    { label: "파이프라인", value: formatKRW(summary.pipeline) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="mt-1 truncate text-xl font-bold text-neutral-900">{value}</p>
        </div>
      ))}
    </div>
  );
}
