import { cn } from "@/lib/utils";
import type { CheckItem } from "@/types/parse-api";

type Props = {
  checks: CheckItem[];
};

// Maps backend priority values to Korean labels and Tailwind colour classes
const PRIORITY_CONFIG: Record<
  CheckItem["priority"],
  { label: string; className: string }
> = {
  HIGH: {
    label: "긴급",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  MEDIUM: {
    label: "권장",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  LOW: {
    label: "참고",
    className: "border-neutral-200 bg-neutral-100 text-neutral-600",
  },
};

export function IntakeChecks({ checks }: Props) {
  if (checks.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          확인 필요 항목
        </h2>
        <p className="text-sm text-neutral-500">확인 필요 항목이 없습니다.</p>
      </div>
    );
  }

  const sorted = [...checks].sort((a, b) => {
    const order: Record<CheckItem["priority"], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        확인 필요 항목
      </h2>
      <div className="flex flex-col gap-2">
        {sorted.map((check) => {
          const { label, className } = PRIORITY_CONFIG[check.priority];
          return (
            <div
              key={check.check_code}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5",
                className,
              )}
            >
              <span className="mt-0.5 shrink-0 rounded text-xs font-bold">{label}</span>
              <p className="text-sm leading-snug">{check.message}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        이 확인 항목은 운영 참고용이며, 법률 자문이 아닙니다.
      </p>
    </div>
  );
}
