"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntakeBrief } from "@/components/intake/IntakeBrief";
import { IntakeQuote } from "@/components/intake/IntakeQuote";
import { IntakeChecks } from "@/components/intake/IntakeChecks";
import { IntakeReply } from "@/components/intake/IntakeReply";
import type { ParseApiResult } from "@/types/parse-api";
import { trackClientEvent } from "@/lib/analytics-client";

// ─── Constants ────────────────────────────────────────────────────────────────

type SourceType = "email" | "instagram_dm" | "youtube" | "kakao" | "other";
type ReplyTone = "polite" | "quick" | "negotiation";
type PanelState = "empty" | "loading" | "success" | "error";
type DealStatus = "Lead" | "Replied" | "Negotiating";

const SAMPLE_INQUIRY =
  "안녕하세요! ○○ 브랜드 마케팅팀입니다. 유튜브 쇼츠 1건과 인스타 릴스 1건 협업을 제안드립니다. 게시일은 2주 후이며, 제품은 제공해드립니다. 예산은 협의 가능합니다.";

const PARSE_PROGRESS = [
  "문의 분석 중...",
  "가격 계산 중...",
  "답장 초안 생성 중...",
] as const;

const PROGRESS_INTERVAL_MS = 2200;

const SOURCE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: "email", label: "이메일" },
  { value: "instagram_dm", label: "인스타 DM" },
  { value: "youtube", label: "유튜브" },
  { value: "kakao", label: "카카오" },
  { value: "other", label: "기타" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function IntakeWorkspace() {
  const router = useRouter();

  // Left panel
  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("email");

  // Right panel
  const [panelState, setPanelState] = useState<PanelState>("empty");
  const [parseResult, setParseResult] = useState<ParseApiResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  // Save / action bar
  const [selectedTone, setSelectedTone] = useState<ReplyTone>("polite");
  const [dealStatus, setDealStatus] = useState<DealStatus>("Lead");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (panelState !== "loading") return;
    setProgressStep(0);
    const id = setInterval(() => {
      setProgressStep((s) => (s < PARSE_PROGRESS.length - 1 ? s + 1 : s));
    }, PROGRESS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [panelState]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleParse() {
    if (!text.trim() || panelState === "loading") return;

    setPanelState("loading");
    setParseResult(null);
    setParseError(null);

    try {
      const res = await fetch("/api/inquiries/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: text, source_type: sourceType }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: ParseApiResult;
        error?: { message?: string };
      };

      if (!json.success) {
        setParseError(json.error?.message ?? "분석에 실패했습니다.");
        setPanelState("error");
        return;
      }

      setParseResult(json.data!);
      setPanelState("success");
    } catch {
      setParseError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setPanelState("error");
    }
  }

  function handleSampleFill() {
    setText(SAMPLE_INQUIRY);
    setSourceType("other");
    trackClientEvent("sample_inquiry_used");
  }

  async function handleSave() {
    if (!parseResult || saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiry_id: parseResult.inquiry_id,
          selected_reply_tone: selectedTone,
          source_type: sourceType,
          initial_status: dealStatus,
        }),
      });

      const json = (await res.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!json.success) {
        setSaveError(json.error?.message ?? "저장에 실패했습니다.");
        setSaving(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setSaveError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  }

  const canParse = text.trim().length > 0 && panelState !== "loading";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--d-bg)]">
      {/* ── Left panel (40%) ── */}
      <section className="w-full lg:w-[40%] border-r border-[var(--d-border)] p-8 overflow-y-auto bg-[var(--d-surface)]/20">
        <div className="max-w-xl mx-auto space-y-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#6366F1]/25 bg-[#6366F1]/10 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75 animate-ping" style={{ animationDuration: "2s" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6366F1]" />
              </span>
              <span className="text-[11px] font-bold tracking-wide text-[#a78bfa]">AI 분석 준비 완료</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--d-h)] mb-2">새로운 브랜드 제안 분석</h1>
            <p className="text-[var(--d-m)] text-sm leading-relaxed">
              브랜드로부터 받은 문의 내용을 그대로 붙여넣어 주세요. AI가 핵심 정보를 추출합니다.
            </p>
          </div>

          <div className="space-y-6">
            {/* Textarea */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-f)]">
                브랜드 문의 내용 입력
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onPaste={() => trackClientEvent("inquiry_pasted", { source_type: sourceType })}
                disabled={panelState === "loading"}
                placeholder="브랜드로부터 받은 이메일, DM, 카카오톡 내용을 그대로 붙여넣으세요."
                className="w-full h-[320px] bg-[var(--d-surface2)] border border-[var(--d-border)] rounded-xl text-sm text-[var(--d-h)] p-4 placeholder:text-[var(--d-f)] focus:ring-2 focus:ring-[#6366F1]/40 focus:border-[#6366F1]/60 resize-none transition-all outline-none disabled:opacity-60"
              />
            </div>

            {/* Source type toggle */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-f)]">
                문의 경로 (Source)
              </label>
              <div className="flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map(({ value, label }) => {
                  const isActive = sourceType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSourceType(value)}
                      disabled={panelState === "loading"}
                      className={[
                        "flex-1 py-2.5 px-2 rounded-xl border text-[13px] font-medium transition-all duration-200 disabled:opacity-50",
                        isActive
                          ? "border-[#6366F1]/60 bg-gradient-to-b from-[#6366F1] to-indigo-600 text-white font-bold shadow-md shadow-[#6366F1]/20"
                          : "border-[var(--d-border)] bg-[var(--d-surface)] text-[var(--d-m)] hover:border-[#6366F1]/20 hover:bg-[#6366F1]/5 hover:text-[var(--d-b)]",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                type="button"
                onClick={handleParse}
                disabled={!canParse}
                className="btn-gradient w-full rounded-xl py-4 font-bold text-white shadow-lg shadow-[#6366F1]/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {panelState === "loading" ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    분석 중...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    분석하기
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSampleFill}
                disabled={panelState === "loading"}
                className="w-full py-3 rounded-xl border border-dashed border-[var(--d-border)] bg-transparent text-[var(--d-f)] hover:text-[var(--d-m)] hover:border-[#6366F1]/20 text-sm font-medium transition-all disabled:opacity-50"
              >
                샘플 문의 불러오기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right panel (60%) ── */}
      <section className="w-full lg:w-[60%] p-8 overflow-y-auto bg-[var(--d-bg)] pb-24">
        <div className="max-w-4xl mx-auto space-y-10">
          {panelState === "empty" && <EmptyState />}
          {panelState === "loading" && <LoadingState step={progressStep} />}
          {panelState === "error" && (
            <ErrorState
              message={parseError}
              onRetry={handleParse}
              canRetry={!!text.trim()}
            />
          )}
          {panelState === "success" && parseResult && (
            <>
              <IntakeBrief
                data={parseResult.parsed_json}
                missingFields={parseResult.missing_fields}
              />
              <IntakeQuote data={parseResult.quote_breakdown} />
              <IntakeChecks checks={parseResult.checks} />
              <IntakeReply
                drafts={parseResult.reply_drafts}
                selectedTone={selectedTone}
                onToneChange={setSelectedTone}
              />
            </>
          )}
        </div>
      </section>

      {/* ── Sticky action bar — only visible after a successful parse ── */}
      {parseResult && (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--d-surface)]/95 backdrop-blur-md border-t border-[var(--d-border)] flex items-center px-8 z-[60] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#6366F1]/30 before:to-transparent">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <select
                  value={dealStatus}
                  onChange={(e) => setDealStatus(e.target.value as DealStatus)}
                  className="bg-[var(--d-bg)] border border-[var(--d-border)] text-[var(--d-h)] text-xs font-semibold rounded-xl py-2.5 px-4 pr-10 focus:ring-1 focus:ring-[#6366F1] outline-none appearance-none min-w-[140px]"
                >
                  <option value="Lead">검토 중</option>
                  <option value="Replied">답장 완료</option>
                  <option value="Negotiating">협의 진행 중</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d-f)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              {saveError ? (
                <p className="text-xs text-red-400 hidden md:block">{saveError}</p>
              ) : (
                <p className="text-xs text-[var(--d-f)] hidden md:block">
                  이 딜을 저장하면 파이프라인 대시보드에서 관리할 수 있습니다.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2.5 bg-transparent border border-[var(--d-border)] rounded-xl text-sm font-medium text-[var(--d-m)] hover:text-[var(--d-h)] hover:bg-white/5 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-gradient px-10 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-[#6366F1]/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    저장 중...
                  </>
                ) : "Deal로 저장"}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// ─── Panel state components ───────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--d-border)] bg-[var(--d-surface2)] px-8 py-16 text-center">
      <div className="animate-float mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#6366F1]/20 bg-gradient-to-br from-[#6366F1]/15 to-indigo-500/5 text-[#6366F1] shadow-lg shadow-[#6366F1]/10">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p className="text-base font-bold text-[var(--d-m)]">분석 결과가 여기에 표시됩니다</p>
      <p className="mt-2 text-sm text-[var(--d-f)] leading-relaxed">
        왼쪽에 브랜드 이메일이나 DM을 붙여넣고<br />분석하기를 눌러보세요.
      </p>
    </div>
  );
}

function LoadingState({ step }: { step: number }) {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-xl border border-[#6366F1]/20 bg-gradient-to-b from-[#6366F1]/5 to-transparent px-8 py-16 text-center">
      {/* Spinning icon */}
      <div className="mb-8 relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#6366F1]/30 bg-[#6366F1]/10 text-[#6366F1]">
          <svg className="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-[#6366F1]/10 blur-xl animate-pulse" />
      </div>
      {/* Step dots */}
      <div className="mb-5 flex gap-2">
        {PARSE_PROGRESS.map((_, i) => (
          <div
            key={i}
            className={[
              "rounded-full transition-all duration-500",
              i < step ? "h-1.5 w-6 bg-[#6366F1]" :
              i === step ? "h-1.5 w-10 bg-gradient-to-r from-[#6366F1] to-[#a78bfa] shadow-sm shadow-[#6366F1]/40" :
              "h-1.5 w-6 bg-[var(--d-border)]",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="text-sm font-bold text-[#a78bfa]">{PARSE_PROGRESS[step]}</p>
      <p className="mt-1.5 text-xs text-[var(--d-f)]">잠시만 기다려주세요</p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  canRetry,
}: {
  message: string | null;
  onRetry: () => void;
  canRetry: boolean;
}) {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-xl border border-red-900/50 bg-red-950/20 px-8 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-400">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="font-medium text-red-400">분석 실패</p>
      <p className="mt-2 text-sm text-red-400/70">
        {message ?? "알 수 없는 오류가 발생했습니다."}
      </p>
      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/50 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
