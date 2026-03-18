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
      {/* Underline tab strip */}
      <div className="border-b border-[#1E1E2E]">
        <div className="flex gap-8">
          {TABS.map(({ id, label }) => {
            const count = filterDealsByTab(deals, id).length;
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={[
                  "pb-4 text-sm transition-colors",
                  active
                    ? "font-bold border-b-2 border-indigo-500 text-indigo-400"
                    : "font-medium text-slate-500 hover:text-slate-300 border-b-2 border-transparent",
                ].join(" ")}
              >
                {label} ({count})
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
          <p className="py-8 text-center text-sm text-slate-500">
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
