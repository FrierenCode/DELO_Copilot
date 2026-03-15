"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import type { ReplyDrafts } from "@/types/parse-api";

type ReplyTone = "polite" | "quick" | "negotiation";

type Props = {
  drafts: ReplyDrafts;
  /** Controlled by parent — keeps save tone in sync with visible tab */
  selectedTone: ReplyTone;
  onToneChange: (tone: ReplyTone) => void;
};

const TABS: { tone: ReplyTone; label: string }[] = [
  { tone: "polite", label: "정중형" },
  { tone: "negotiation", label: "협상형" },
  { tone: "quick", label: "빠른 응답형" },
];

export function IntakeReply({ drafts, selectedTone, onToneChange }: Props) {
  // Track local edits per tone without persisting to server here
  // (save happens through the Deal save flow, not inline)
  const [localEdits, setLocalEdits] = useState<Partial<Record<ReplyTone, string>>>({});

  function getDisplayText(tone: ReplyTone): string {
    if (localEdits[tone] !== undefined) return localEdits[tone]!;
    return drafts[tone] ?? "";
  }

  function handleEdit(tone: ReplyTone, value: string) {
    setLocalEdits((prev) => ({ ...prev, [tone]: value }));
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        답장 초안
      </h2>

      {/* Tab strip */}
      <div className="mb-4 flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
        {TABS.map(({ tone, label }) => (
          <button
            key={tone}
            type="button"
            onClick={() => onToneChange(tone)}
            className={[
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              selectedTone === tone
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active tab panel */}
      {TABS.map(({ tone, label }) => {
        if (selectedTone !== tone) return null;

        const rawDraft = drafts[tone];

        // Plan-gated: backend returned null for this tone
        if (rawDraft === null) {
          return (
            <div
              key={tone}
              className="rounded-lg border border-dashed border-neutral-200 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">{label}</span>
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                  Pro
                </span>
              </div>
              <p className="text-sm text-neutral-400">
                이 답장 유형은 Pro 플랜에서 이용 가능합니다.
              </p>
            </div>
          );
        }

        const displayText = getDisplayText(tone);

        return (
          <div key={tone} className="flex flex-col gap-2">
            <div className="flex justify-end">
              {/* CopyButton reads the current (potentially edited) content */}
              <CopyButton text={displayText} />
            </div>
            <textarea
              value={displayText}
              onChange={(e) => handleEdit(tone, e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm leading-relaxed text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </div>
        );
      })}
    </div>
  );
}
