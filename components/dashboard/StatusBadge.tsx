import { cn } from "@/lib/utils";
import type { DealStatus } from "@/types/deal";

const STATUS_CONFIG: Record<DealStatus, { label: string; className: string }> = {
  Lead:        { label: "리드",      className: "bg-blue-50   text-blue-700   border-blue-200" },
  Replied:     { label: "회신 완료", className: "bg-purple-50 text-purple-700 border-purple-200" },
  Negotiating: { label: "협상중",    className: "bg-amber-50  text-amber-700  border-amber-200" },
  Confirmed:   { label: "확정",      className: "bg-green-50  text-green-700  border-green-200" },
  Delivered:   { label: "납품 완료", className: "bg-teal-50   text-teal-700   border-teal-200" },
  Paid:        { label: "지급 완료", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  ClosedLost:  { label: "손실",      className: "bg-red-50    text-red-700    border-red-200" },
};

export function StatusBadge({ status }: { status: DealStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
