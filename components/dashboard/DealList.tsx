"use client";

import { useState } from "react";
import { DealCard } from "./DealCard";
import { EmptyDealsState } from "./EmptyDealsState";
import { filterDealsByTab, type DealTab } from "@/lib/dashboard-helpers";
import type { Deal } from "@/types/deal";

const TABS: { id: DealTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "active", label: "진행중" },
  { id: "done", label: "완료" },
  { id: "lost", label: "손실" },
];

export function DealList({ deals }: { deals: Deal[] }) {
  const [activeTab, setActiveTab] = useState<DealTab>("all");
  const filtered = filterDealsByTab(deals, activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Tab strip */}
      <div className="flex w-fit gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === id
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        deals.length === 0 ? (
          <EmptyDealsState />
        ) : (
          <p className="py-8 text-center text-sm text-neutral-400">
            이 탭에 해당하는 딜이 없습니다.
          </p>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
