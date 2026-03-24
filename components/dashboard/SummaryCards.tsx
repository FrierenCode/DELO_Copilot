import type { DashboardSummary } from "@/lib/dashboard-helpers";

function formatPipeline(amount: number): string {
  if (amount === 0) return "₩0";
  if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
  if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(1)}만`;
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 전체 딜 */}
      <div className="card-hover d-pixel-card relative overflow-hidden bg-[var(--d-surface)] border border-[var(--d-border)] p-5 rounded-xl">
        <div className="h-0.5 rounded-t-xl bg-gradient-to-r from-slate-400/40 to-transparent -mx-5 -mt-5 mb-5" />
        <p className="text-[var(--d-f)] text-[11px] font-semibold mb-2">전체 딜</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-black text-[var(--d-h)]">{summary.total}</h3>
          <span className="text-[10px] font-medium text-[var(--d-f)]">전체</span>
        </div>
      </div>

      {/* 활성 딜 */}
      <div className="card-hover d-pixel-card relative overflow-hidden bg-[var(--d-surface)] border border-[var(--d-border)] p-5 rounded-xl">
        <div className="h-0.5 rounded-t-xl bg-gradient-to-r from-[#6366F1]/60 to-transparent -mx-5 -mt-5 mb-5" />
        <p className="text-indigo-400 text-[11px] font-semibold mb-2">활성 딜</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-black text-[var(--d-h)]">{summary.active}</h3>
          <span className="text-[10px] font-bold text-indigo-400">진행중</span>
        </div>
      </div>

      {/* 이번 주 마감 */}
      <div
        className={[
          "card-hover d-pixel-card relative overflow-hidden bg-[var(--d-surface)] border border-[var(--d-border)] p-5 rounded-xl",
          summary.dueThisWeek > 0 ? "ring-1 ring-amber-500/30" : "",
        ].join(" ")}
      >
        <div className="h-0.5 rounded-t-xl bg-gradient-to-r from-amber-500/60 to-transparent -mx-5 -mt-5 mb-5" />
        <p className="text-amber-500 text-[11px] font-semibold mb-2">이번 주 마감</p>
        <div className="flex items-baseline justify-between">
          <h3
            className={[
              "text-3xl font-black",
              summary.dueThisWeek > 0 ? "text-amber-500" : "text-[var(--d-h)]",
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
      <div className="card-hover d-pixel-card relative overflow-hidden bg-[var(--d-surface)] border border-[var(--d-border)] p-5 rounded-xl">
        <div className="h-0.5 rounded-t-xl bg-gradient-to-r from-emerald-500/60 to-transparent -mx-5 -mt-5 mb-5" />
        <p className="text-emerald-500 text-[11px] font-semibold mb-2">확정 딜 금액</p>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-black text-[var(--d-h)]">{formatPipeline(summary.pipeline)}</h3>
          <span className="text-[10px] font-bold text-emerald-500">Confirmed</span>
        </div>
      </div>
    </div>
  );
}
