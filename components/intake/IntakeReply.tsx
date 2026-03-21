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
      <h2 className="text-xl font-bold text-[#F8FAFC]">답장 초안</h2>
      <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden">
        {/* Tab strip */}
        <div className="flex border-b border-[#1E1E2E] bg-[#0A0A0F]/50">
          {TABS.map(({ tone, label }) => (
            <button
              key={tone}
              type="button"
              onClick={() => {
                onToneChange(tone);
                trackClientEvent("reply_tab_changed", { tone });
              }}
              className={[
                "px-6 py-3 text-sm font-medium transition-colors",
                selectedTone === tone
                  ? "border-b-2 border-[#6366F1] text-[#F8FAFC] font-bold"
                  : "text-[#64748B] hover:text-[#94A3B8]",
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
                <div className="rounded-xl border border-dashed border-[#1E1E2E] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#64748B]">{label}</span>
                    <span className="rounded-md bg-[#6366F1]/10 px-2 py-0.5 text-xs text-[#6366F1] font-bold">
                      Standard
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B]">
                    이 답장 유형은 Standard 플랜에서 이용 가능합니다.
                  </p>
                </div>
              </div>
            );
          }

          const displayText = getDisplayText(tone);

          return (
            <div key={tone} className="p-6 space-y-3">
              <div className="relative group">
                <textarea
                  value={displayText}
                  onChange={(e) => handleEdit(tone, e.target.value)}
                  rows={10}
                  className="w-full bg-[#0A0A0F] border border-[#1E1E2E] p-4 rounded-lg text-sm leading-relaxed text-[#CBD5E1] outline-none focus:border-[#6366F1] transition-colors resize-none"
                />
                <div className="absolute top-3 right-3">
                  <CopyButton
                    text={displayText}
                    className="border-[#1E1E2E] bg-[#6366F1] text-white hover:bg-indigo-600 px-3 py-1.5 text-[11px] font-bold shadow-sm"
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
