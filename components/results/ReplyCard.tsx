"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { SignupPromptModal } from "@/components/ui/SignupPromptModal";
import type { ReplyDrafts } from "@/types/parse-api";

type ReplyTone = "polite" | "quick" | "negotiation";

type ReplyCardProps = {
  drafts: ReplyDrafts;
  inquiryId?: string;
  isLoggedIn?: boolean;
  bare?: boolean;
};

type ReplyBlockProps = {
  label: string;
  desc: string;
  tone: ReplyTone;
  text: string | null;
  inquiryId?: string;
  isLoggedIn?: boolean;
  onSaved: (tone: ReplyTone, value: string) => void;
  onPromptSignup: () => void;
};

function ReplyBlock({ label, desc, tone, text, inquiryId, isLoggedIn, onSaved, onPromptSignup }: ReplyBlockProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const signupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (signupTimerRef.current) clearTimeout(signupTimerRef.current); };
  }, []);

  function scheduleSignupPrompt(delay: number) {
    if (signupTimerRef.current) clearTimeout(signupTimerRef.current);
    signupTimerRef.current = setTimeout(onPromptSignup, delay);
  }

  if (text === null) {
    return (
      <div className="rounded-xl p-3" style={{ backgroundColor: "var(--p-surface)" }}>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-secondary)" }}>
            {label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
            style={{ backgroundColor: "var(--p-secondary-soft)", color: "var(--p-secondary)" }}
          >
            Standard
          </span>
        </div>
        <p className="mb-2 text-[10px]" style={{ color: "var(--p-dim)" }}>{desc}</p>
        <p className="text-xs" style={{ color: "var(--p-dim)" }}>Standard 플랜에서 사용 가능합니다</p>
      </div>
    );
  }

  async function handleSave() {
    const skipApi = !isLoggedIn || !inquiryId || inquiryId === "demo";
    if (skipApi) {
      onSaved(tone, draft);
      setEditing(false);
      if (!isLoggedIn) scheduleSignupPrompt(1000);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_drafts: { [tone]: draft } }),
      });
      const json = await res.json();
      if (!json.success) { setSaveError(json.error?.message ?? "Save failed."); return; }
      onSaved(tone, draft);
      setEditing(false);
    } catch {
      setSaveError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(text ?? "");
    setEditing(false);
    setSaveError(null);
  }

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "var(--p-surface)" }}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-secondary)" }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {!editing && (
            <CopyButton
              text={text}
              onAfterCopy={!isLoggedIn ? () => scheduleSignupPrompt(2000) : undefined}
            />
          )}
          <button
            type="button"
            onClick={() => { setDraft(text); setEditing((v) => !v); setSaveError(null); }}
            className="rounded-full px-3 py-1 text-xs font-bold transition-all hover:brightness-110"
            style={{ backgroundColor: "var(--p-surface-3)", color: "var(--p-muted)" }}
          >
            {editing ? "닫기" : "수정"}
          </button>
        </div>
      </div>
      <p className="mb-2 text-[10px]" style={{ color: "var(--p-dim)" }}>{desc}</p>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            className="p-textarea w-full rounded-xl border-none p-4 text-xs leading-relaxed"
          />
          {saveError && <p className="text-xs" style={{ color: "var(--p-error)" }}>{saveError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full px-4 py-1.5 text-xs font-black text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "var(--p-btn-gradient)" }}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-full px-4 py-1.5 text-xs font-bold transition-all disabled:opacity-50"
              style={{ backgroundColor: "var(--p-surface-3)", color: "var(--p-muted)" }}
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color: "var(--p-text)", fontFamily: "inherit" }}>
          {text}
        </pre>
      )}
    </div>
  );
}

export function ReplyCard({ drafts: initialDrafts, inquiryId, isLoggedIn = false, bare = false }: ReplyCardProps) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const blocks: { label: string; desc: string; tone: ReplyTone; text: string | null }[] = [
    { label: "관계 우선", desc: "첫 답변 추천 · 금액 없이 관심 표현", tone: "polite", text: drafts.polite },
    { label: "단도직입", desc: "참고 단가 포함 · 빠른 확인용", tone: "quick", text: drafts.quick },
    { label: "전략 협상", desc: "가치 앵커링 + 조건 협상 · 레버리지 최대화", tone: "negotiation", text: drafts.negotiation },
  ];

  const inner = (
    <div className="flex flex-col gap-3">
      {blocks.map((b) => (
        <ReplyBlock
          key={b.tone}
          label={b.label}
          desc={b.desc}
          tone={b.tone}
          text={b.text}
          inquiryId={inquiryId}
          isLoggedIn={isLoggedIn}
          onSaved={(tone, val) => setDrafts((prev) => ({ ...prev, [tone]: val }))}
          onPromptSignup={() => setShowSignupPrompt(true)}
        />
      ))}
    </div>
  );

  if (bare) {
    return (
      <>
        {inner}
        <SignupPromptModal open={showSignupPrompt} onClose={() => setShowSignupPrompt(false)} />
      </>
    );
  }

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl border-l-4"
        style={{
          backgroundColor: "var(--p-surface-2)",
          borderLeftColor: "var(--p-secondary)",
          boxShadow: "var(--p-card-shadow)",
          border: "1px solid var(--p-card-border)",
          borderLeftWidth: "4px",
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-muted)" }}>
              답장 초안
            </h3>
            {!isLoggedIn && (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--p-secondary)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          {inner}
        </div>
      </div>
      <SignupPromptModal open={showSignupPrompt} onClose={() => setShowSignupPrompt(false)} />
    </>
  );
}
