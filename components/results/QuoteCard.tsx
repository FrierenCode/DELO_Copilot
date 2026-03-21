import type { QuoteBreakdown } from "@/types/parse-api";

type QuoteCardProps = {
  data: QuoteBreakdown;
  bare?: boolean;
};

function formatKRW(amount: number) {
  return "₩" + amount.toLocaleString("ko-KR");
}

export function QuoteCard({ data, bare = false }: QuoteCardProps) {
  const hasBreakdown =
    data.base_fee !== undefined || data.floor !== undefined || data.premium !== undefined;

  const inner = (
    <>
      <div className="mb-6">
        <div className="text-3xl font-black tracking-tighter" style={{ color: "var(--p-tertiary)" }}>
          {formatKRW(data.target)}
        </div>
        <p className="mt-1 text-[10px]" style={{ color: "var(--p-muted)" }}>적정 단가 기준</p>
      </div>

      {hasBreakdown && (
        <div className="mb-4 space-y-2">
          {data.floor !== undefined && (
            <div
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: "var(--p-surface)" }}
            >
              <span className="text-xs font-bold" style={{ color: "var(--p-muted)" }}>최저</span>
              <span className="text-xs font-black" style={{ color: "var(--p-text)" }}>{formatKRW(data.floor)}</span>
            </div>
          )}
          {data.base_fee !== undefined && (
            <div
              className="flex items-center justify-between rounded-xl p-3"
              style={{
                backgroundColor: "var(--p-tertiary-soft)",
                border: "1px solid var(--p-tertiary-soft-bd)",
              }}
            >
              <span className="text-xs font-bold" style={{ color: "var(--p-tertiary)" }}>기본</span>
              <span className="text-xs font-black" style={{ color: "var(--p-tertiary)" }}>{formatKRW(data.base_fee)}</span>
            </div>
          )}
          {data.premium !== undefined && (
            <div
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: "var(--p-surface)" }}
            >
              <span className="text-xs font-bold" style={{ color: "var(--p-muted)" }}>프리미엄</span>
              <span className="text-xs font-black" style={{ color: "var(--p-text)" }}>{formatKRW(data.premium)}+</span>
            </div>
          )}
        </div>
      )}

      {data.explanation && (
        <p className="mb-3 text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
          {data.explanation}
        </p>
      )}

      <div
        className="mb-3 flex items-start gap-2 rounded-xl px-3 py-2.5"
        style={{ backgroundColor: bare ? "var(--p-surface-2)" : "var(--p-surface)" }}
      >
        <span className="mt-px shrink-0 text-xs" style={{ color: "var(--p-tertiary)" }}>⚡</span>
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--p-muted)" }}>
          초기 제안 예산보다 10~20% 높게 제시하고 협상 여지를 두는 것을 권장합니다
        </p>
      </div>

      <p className="text-[10px]" style={{ color: "var(--p-dim)" }}>
        운영 참고용 가이드이며, 법률·세무·회계 자문이 아닙니다.
      </p>
    </>
  );

  if (bare) return <div>{inner}</div>;

  return (
    <div
      className="overflow-hidden rounded-2xl border-l-4"
      style={{
        backgroundColor: "var(--p-surface-2)",
        borderLeftColor: "var(--p-tertiary)",
        boxShadow: "var(--p-card-shadow)",
        border: "1px solid var(--p-card-border)",
        borderLeftWidth: "4px",
      }}
    >
      <div className="p-6">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-muted)" }}>
          예상 견적
        </h3>
        {inner}
      </div>
    </div>
  );
}
