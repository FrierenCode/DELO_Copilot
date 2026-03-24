"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import type { ReplyDrafts } from "@/types/parse-api";
import { trackClientEvent } from "@/lib/analytics-client";

type ReplyTone = "polite" | "quick" | "negotiation";

type Props = {
  drafts: ReplyDrafts;
  /** Controlled by parent — keeps save tone in sync with visible tab */
  selectedTone: ReplyTone;
  onToneChange: (tone: ReplyTone) => void;
};

const TABS: { tone: ReplyTone; label: string }[] = [
  { tone: "polite", label: "정중한 답장" },
  { tone: "quick", label: "빠른 확인" },
  { tone: "negotiation", label: "협상 제안" },
];

export function IntakeReply({ drafts, selectedTone, onToneChange }: Props) {
  const [localEdits, setLocalEdits] = useState<Partial<Record<ReplyTone, string>>>({});

  function getDisplayText(tone: ReplyTone): string {
    if (localEdits[tone] !== undefined) return localEdits[tone]!;
    return drafts[tone] ?? "";
  }

  function handleEdit(tone: ReplyTone, value: string) {
    setLocalEdits((prev) => ({ ...prev, [tone]: value }));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--d-h)]">답장 초안</h2>
      <div className="d-pixel-card bg-[var(--d-surface)] border border-[var(--d-border)] rounded-xl overflow-hidden">
        {/* Tab strip */}
        <div className="flex overflow-x-auto border-b border-[var(--d-border)] bg-[var(--d-surface2)]">
          {TABS.map(({ tone, label }) => (
            <button
              key={tone}
              type="button"
              onClick={() => {
                onToneChange(tone);
                trackClientEvent("reply_tab_changed", { tone });
              }}
              className={[
                "shrink-0 px-4 py-3 text-sm font-medium transition-colors sm:px-6",
                selectedTone === tone
                  ? "border-b-2 border-[#6366F1] text-[var(--d-h)] font-bold"
                  : "text-[var(--d-f)] hover:text-[var(--d-m)]",
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
              <div key={tone} className="p-6">
                <div className="rounded-xl border border-dashed border-[var(--d-border)] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--d-f)]">{label}</span>
                    <span className="rounded-md bg-[#6366F1]/10 px-2 py-0.5 text-xs text-[#6366F1] font-bold">
                      Standard
                    </span>
                  </div>
                  <p className="text-sm text-[var(--d-f)]">
                    이 답장 유형은 Standard 플랜에서 이용 가능합니다.
                  </p>
                </div>
              </div>
            );
          }

          const displayText = getDisplayText(tone);

          return (
            <div key={tone} className="space-y-3 p-4 sm:p-6">
              <div className="relative group">
                <textarea
                  value={displayText}
                  onChange={(e) => handleEdit(tone, e.target.value)}
                  rows={9}
                  className="w-full rounded-lg border border-[var(--d-border)] bg-[var(--d-surface2)] p-4 pr-16 text-sm leading-relaxed text-[var(--d-b)] outline-none resize-none transition-colors focus:border-[#6366F1]"
                />
                <div className="absolute top-3 right-3">
                  <CopyButton
                    text={displayText}
                    className="border-[var(--d-border)] bg-[#6366F1] text-white hover:bg-indigo-600 px-3 py-1.5 text-[11px] font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
