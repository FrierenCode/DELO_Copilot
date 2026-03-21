import type { CheckItem } from "@/types/parse-api";

type ChecksCardProps = {
  checks: CheckItem[];
  bare?: boolean;
};

const PRIORITY_LABELS: Record<CheckItem["priority"], string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

// CSS 변수를 사용하므로 테마가 자동 적용됩니다
const PRIORITY_DOT: Record<CheckItem["priority"], string> = {
  HIGH: "var(--p-error)",
  MEDIUM: "var(--p-secondary)",
  LOW: "var(--p-dim)",
};

const PRIORITY_LABEL_COLOR: Record<CheckItem["priority"], string> = {
  HIGH: "var(--p-error)",
  MEDIUM: "var(--p-muted)",
  LOW: "var(--p-muted)",
};

export function ChecksCard({ checks, bare = false }: ChecksCardProps) {
  const sorted = [...checks].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  const inner = checks.length === 0 ? (
    <p className="text-sm font-bold" style={{ color: "var(--p-tertiary)" }}>
      ✓ 주요 조건이 모두 확인되었습니다
    </p>
  ) : (
    <>
      <div className="space-y-4">
        {sorted.map((check) => (
          <div key={check.check_code} className="flex items-start gap-3">
            <div
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: PRIORITY_DOT[check.priority] }}
            />
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--p-text)" }}>
                {check.message}
              </p>
              <p className="text-[10px]" style={{ color: PRIORITY_LABEL_COLOR[check.priority] }}>
                {PRIORITY_LABELS[check.priority]} 우선순위
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(["HIGH", "MEDIUM", "LOW"] as const)
          .map((p) => ({ p, count: sorted.filter((c) => c.priority === p).length }))
          .filter(({ count }) => count > 0)
          .map(({ p, count }) => (
            <span
              key={p}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-black"
              style={{
                backgroundColor: p === "HIGH" ? "var(--p-error-soft)" : "var(--p-surface-3)",
                color: p === "HIGH" ? "var(--p-error)" : "var(--p-muted)",
              }}
            >
              {PRIORITY_LABELS[p]} {count}건
            </span>
          ))}
      </div>

      <p className="mt-3 text-[10px]" style={{ color: "var(--p-dim)" }}>
        운영 참고용이며, 법률 자문이 아닙니다.
      </p>
    </>
  );

  if (bare) return <div>{inner}</div>;

  return (
    <div
      className="overflow-hidden rounded-2xl border-l-4"
      style={{
        backgroundColor: "var(--p-surface-2)",
        borderLeftColor: "var(--p-error)",
        boxShadow: "var(--p-card-shadow)",
        border: "1px solid var(--p-card-border)",
        borderLeftWidth: "4px",
      }}
    >
      <div className="p-6">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-muted)" }}>
          누락 항목 확인
        </h3>
        {inner}
      </div>
    </div>
  );
}
