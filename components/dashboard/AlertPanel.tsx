"use client";

import Link from "next/link";
import type { AlertItem, AlertResult } from "@/types/dashboard";

export function AlertPanel({ alerts }: { alerts: AlertResult }) {
  if (alerts.items.length === 0) return null;

  return (
    <div className="bg-[#13131A] border-l-4 border-l-amber-500 border-y border-r border-[#1E1E2E] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-lg leading-none">⚠</span>
          <p className="text-sm font-bold text-amber-200">
            확인이 필요한 딜 ({alerts.items.length}건)
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {alerts.items.map((item, i) => (
            <AlertRow key={`${item.deal_id}-${item.type}-${i}`} item={item} />
          ))}
        </div>
      </div>
      <Link
        href="/dashboard"
        className="bg-amber-500 hover:bg-amber-600 text-[#0A0A0F] text-xs font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-amber-500/20 whitespace-nowrap text-center"
      >
        긴급 항목 확인하기
      </Link>
    </div>
  );
}

function AlertRow({ item }: { item: AlertItem }) {
  return (
    <Link
      href={`/dashboard/deals/${item.deal_id}`}
      className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity"
    >
      <span
        className={[
          "w-2 h-2 rounded-full shrink-0",
          item.severity === "high" ? "bg-red-500" : "bg-amber-500",
        ].join(" ")}
      />
      <span className="text-slate-400">
        {item.brand_name}: {item.message}
      </span>
    </Link>
  );
}
