import { Card } from "@/components/ui/Card";
import type { CheckItem } from "@/types/parse-api";
import { cn } from "@/lib/utils";

type ChecksCardProps = {
  checks: CheckItem[];
};

const PRIORITY_STYLES: Record<CheckItem["priority"], string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export function ChecksCard({ checks }: ChecksCardProps) {
  if (checks.length === 0) {
    return (
      <Card title="Deal Checks">
        <p className="text-sm text-neutral-500">No checks flagged.</p>
      </Card>
    );
  }

  const sorted = [...checks].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Card title="Deal Checks">
      <div className="flex flex-col gap-2">
        {sorted.map((check) => (

          <div
            key={check.check_code}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5",
              PRIORITY_STYLES[check.priority],
            )}
          >
            <span className="mt-0.5 shrink-0 text-xs font-bold uppercase">
              {check.priority}
            </span>
            <p className="text-sm leading-snug">{check.message}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        이 확인 항목은 운영 참고용이며, 법률 자문이 아닙니다.
      </p>
    </Card>
  );
}
