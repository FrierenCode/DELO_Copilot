"use client";

import { useState } from "react";
import { DealCard } from "./DealCard";
import { EmptyDealsState } from "./EmptyDealsState";
import { filterDealsByTab, type DealTab } from "@/lib/dashboard-helpers";
import type { Deal } from "@/types/deal";

const TABS: { id: DealTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "active", label: "활성" },
  { id: "done", label: "완료" },
  { id: "lost", label: "실패" },
];

export function DealList({ deals }: { deals: Deal[] }) {
  const [activeTab, setActiveTab] = useState<DealTab>("all");
  const filtered = filterDealsByTab(deals, activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Pill tab strip */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-2 rounded-xl border border-[var(--d-border)] bg-[var(--d-surface2)] p-1.5">
          {TABS.map(({ id, label }) => {
            const count = filterDealsByTab(deals, id).length;
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={[
                  "flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 sm:min-w-[7rem] sm:px-4",
                  active
                    ? "bg-gradient-to-r from-[#6366F1] to-indigo-500 text-white shadow-md shadow-[#6366F1]/25"
                    : "text-[var(--d-f)] hover:text-[var(--d-b)] hover:bg-white/5",
                ].join(" ")}
              >
                {label}
                <span
                  className={[
                    "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black tabular-nums transition-all duration-200",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--d-border)] text-[var(--d-f)]",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deal list */}
      {filtered.length === 0 ? (
        deals.length === 0 ? (
          <EmptyDealsState />
        ) : (
          <p className="py-8 text-center text-sm text-[var(--d-f)]">
            이 탭에 해당하는 딜이 없습니다.
          </p>
        )
      ) : (
        <div className="space-y-4">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
