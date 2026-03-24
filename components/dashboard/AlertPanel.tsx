"use client";

import Link from "next/link";
import type { AlertItem, AlertResult } from "@/types/dashboard";

export function AlertPanel({ alerts }: { alerts: AlertResult }) {
  const firstDealId = alerts.items[0]?.deal_id;
  if (alerts.items.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
      {/* Shimmer accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            {/* Pulsing icon */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 shrink-0">
              <span className="text-amber-400 text-sm leading-none">⚠</span>
              <span className="absolute inset-0 rounded-lg bg-amber-500/10 animate-ping opacity-60" />
            </div>
            <p className="text-sm font-bold text-amber-300">
              확인이 필요한 딜{" "}
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] font-black text-amber-400">
                {alerts.items.length}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 pl-1">
            {alerts.items.map((item, i) => (
              <AlertRow key={`${item.deal_id}-${item.type}-${i}`} item={item} />
            ))}
          </div>
        </div>

        <Link
          href={firstDealId ? `/dashboard/deals/${firstDealId}` : "/dashboard/deals"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-6 py-2.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-500/20 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/10 md:w-auto md:whitespace-nowrap"
        >
          긴급 항목 확인하기
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function AlertRow({ item }: { item: AlertItem }) {
  return (
    <Link
      href={`/dashboard/deals/${item.deal_id}`}
      className="group flex items-center gap-2.5 text-xs transition-opacity hover:opacity-100 opacity-80"
    >
      <span
        className={[
          "relative flex h-2 w-2 shrink-0",
        ].join(" ")}
      >
        <span
          className={[
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            item.severity === "high" ? "bg-red-500 animate-ping" : "bg-amber-400 animate-ping",
          ].join(" ")}
          style={{ animationDuration: "2s" }}
        />
        <span
          className={[
            "relative inline-flex h-2 w-2 rounded-full",
            item.severity === "high" ? "bg-red-500" : "bg-amber-400",
          ].join(" ")}
        />
      </span>
      <span className="text-[var(--d-m)] group-hover:text-[var(--d-b)] transition-colors">
        <span className="font-semibold text-[var(--d-b)]">{item.brand_name}</span>: {item.message}
      </span>
    </Link>
  );
}
