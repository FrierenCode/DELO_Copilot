"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AlertItem, AlertResult } from "@/types/dashboard";

export function AlertPanel({ alerts }: { alerts: AlertResult }) {
  if (alerts.items.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-amber-800">
        알림 ({alerts.items.length}건)
      </h2>
      <div className="flex flex-col gap-2">
        {alerts.items.map((item, i) => (
          <AlertRow key={`${item.deal_id}-${item.type}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function AlertRow({ item }: { item: AlertItem }) {
  return (
    <Link
      href={`/dashboard/deals/${item.deal_id}`}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:brightness-95",
        item.severity === "high"
          ? "border-red-200 bg-white text-red-800"
          : "border-amber-200 bg-white text-amber-800",
      )}
    >
      <span className="mt-0.5 shrink-0 text-xs font-bold uppercase">
        {item.severity === "high" ? "긴급" : "주의"}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium">{item.brand_name}</p>
        <p className="text-xs opacity-80">{item.message}</p>
      </div>
    </Link>
  );
}
