import type { CheckItem } from "@/types/parse-api";

type Props = {
  checks: CheckItem[];
};

type BadgeVariant = "confirmed" | "needs_check" | "missing" | "unanalyzed";

function getBadge(item: CheckItem): { variant: BadgeVariant; label: string } {
  if (item.resolved) return { variant: "confirmed", label: "확인됨" };
  if (item.priority === "HIGH") return { variant: "missing", label: "누락" };
  if (item.priority === "MEDIUM") return { variant: "needs_check", label: "확인필요" };
  return { variant: "unanalyzed", label: "미분석" };
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  confirmed: "bg-green-500/10 text-green-500",
  needs_check: "bg-yellow-500/10 text-yellow-500",
  missing: "bg-red-500/10 text-red-500",
  unanalyzed: "bg-[#1E1E2E] text-[#64748B]",
};

const BADGE_DOTS: Record<BadgeVariant, string> = {
  confirmed: "🟢",
  needs_check: "🟡",
  missing: "🔴",
  unanalyzed: "⚪",
};

export function IntakeChecks({ checks }: Props) {
  if (checks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#F8FAFC]">계약 체크리스트</h2>
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-5">
          <p className="text-sm text-[#64748B]">확인 필요 항목이 없습니다.</p>
        </div>
      </div>
    );
  }

  const sorted = [...checks].sort((a, b) => {
    const order: Record<CheckItem["priority"], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#F8FAFC]">계약 체크리스트</h2>
      <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="divide-y divide-[#1E1E2E]">
          {sorted.map((check) => {
            const { variant, label } = getBadge(check);
            return (
              <div
                key={check.check_code}
                className="p-4 px-6 flex items-center justify-between"
              >
                <span className={[
                  "text-sm font-medium",
                  variant === "unanalyzed" ? "text-[#64748B]" : "text-[#F8FAFC]",
                ].join(" ")}>
                  {check.message}
                </span>
                <span className={[
                  "px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 uppercase shrink-0 ml-4",
                  BADGE_STYLES[variant],
                ].join(" ")}>
                  {BADGE_DOTS[variant]} {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-[#334155]">
        이 확인 항목은 운영 참고용이며, 법률 자문이 아닙니다.
      </p>
    </div>
  );
}
