import { cn } from "@/lib/utils";
import type { DealStatus } from "@/types/deal";

const STATUS_CONFIG: Record<DealStatus, { label: string; className: string }> = {
  Lead:        { label: "Lead",        className: "bg-slate-800       text-slate-400   border-slate-700" },
  Replied:     { label: "Replied",     className: "bg-blue-500/10     text-blue-400    border-blue-500/20" },
  Negotiating: { label: "Negotiating", className: "bg-amber-500/10    text-amber-500   border-amber-500/20" },
  Confirmed:   { label: "Confirmed",   className: "bg-emerald-500/10  text-emerald-500 border-emerald-500/20" },
  Delivered:   { label: "Delivered",   className: "bg-teal-500/10     text-teal-400    border-teal-500/20" },
  Paid:        { label: "Paid",        className: "bg-emerald-600/10  text-emerald-600 border-emerald-600/20" },
  ClosedLost:  { label: "ClosedLost",  className: "bg-gray-800        text-gray-400    border-gray-700" },
};

export function StatusBadge({ status }: { status: DealStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-800 text-slate-400 border-slate-700",
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
