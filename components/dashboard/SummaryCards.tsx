import type { DashboardSummary } from "@/lib/dashboard-helpers";

function formatPipeline(amount: number): string {
  if (amount === 0) return "₩0";
  if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
  if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(1)}만`;
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* 전체 딜 */}
      <div className="bg-[#13131A] border border-[#1E1E2E] p-5 rounded-xl">
        <p className="text-slate-500 text-[11px] font-semibold mb-2">전체 딜</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-bold text-slate-100">{summary.total}</h3>
          <span className="text-[10px] font-medium text-slate-600">전체</span>
        </div>
      </div>

      {/* 활성 딜 */}
      <div className="bg-[#13131A] border border-[#1E1E2E] p-5 rounded-xl">
        <p className="text-indigo-400 text-[11px] font-semibold mb-2">활성 딜</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-bold text-slate-100">{summary.active}</h3>
          <span className="text-[10px] font-bold text-indigo-400">진행중</span>
        </div>
      </div>

      {/* 이번 주 마감 */}
      <div
        className={[
          "bg-[#13131A] border border-[#1E1E2E] p-5 rounded-xl",
          summary.dueThisWeek > 0 ? "ring-1 ring-amber-500/30" : "",
        ].join(" ")}
      >
        <p className="text-amber-500 text-[11px] font-semibold mb-2">이번 주 마감</p>
        <div className="flex items-baseline justify-between">
          <h3
            className={[
              "text-2xl font-bold",
              summary.dueThisWeek > 0 ? "text-amber-500" : "text-slate-100",
            ].join(" ")}
          >
            {summary.dueThisWeek}
          </h3>
          {summary.dueThisWeek > 0 && (
            <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-tight">
              Action required
            </span>
          )}
        </div>
      </div>

      {/* 확정 파이프라인 */}
      <div className="bg-[#13131A] border border-[#1E1E2E] p-5 rounded-xl">
        <p className="text-emerald-500 text-[11px] font-semibold mb-2">확정 파이프라인</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-bold text-slate-100">{formatPipeline(summary.pipeline)}</h3>
          <span className="text-[10px] font-bold text-emerald-500">Confirmed</span>
        </div>
      </div>
    </div>
  );
}
