"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { InquiryCard } from "@/components/results/InquiryCard";
import { QuoteCard } from "@/components/results/QuoteCard";
import { ChecksCard } from "@/components/results/ChecksCard";
import { ReplyCard } from "@/components/results/ReplyCard";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import type { ParseApiResult } from "@/types/parse-api";

type SourceType = "email" | "dm" | "other";

type Props = {
  isLoggedIn?: boolean;
};

const PARSE_STEPS = [
  { emoji: "📋", text: "문의 내용을 읽고 있어요..." },
  { emoji: "💰", text: "시장 단가와 비교하고 있어요..." },
  { emoji: "✍️", text: "답장 초안을 준비하고 있어요..." },
] as const;

function LoadingSteps({ step }: { step: number }) {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl px-6 py-6"
      style={{
        backgroundColor: "var(--p-surface-2)",
        border: "1px solid var(--p-card-border)",
      }}
    >
      {PARSE_STEPS.slice(0, step + 1).map((s, i) => {
        const isDone = i < step;
        return (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{ animation: `p-card-in 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
          >
            <span className="w-6 text-center text-base leading-none">
              {isDone ? "✅" : s.emoji}
            </span>
            <span
              className="flex-1 text-sm font-medium"
              style={{ color: isDone ? "var(--p-muted)" : "var(--p-text)" }}
            >
              {s.text}
            </span>
            {!isDone && (
              <svg
                className="h-4 w-4 shrink-0 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: "var(--p-primary)" }}
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

type SectionRowProps = {
  accent: string;
  title: string;
  summary: ReactNode;
  children: ReactNode;
  delay?: number;
  defaultOpen?: boolean;
};

function SectionRow({ accent, title, summary, children, delay = 0, defaultOpen = false }: SectionRowProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "var(--p-surface-2)",
        border: "1px solid var(--p-card-border)",
        borderLeft: `4px solid ${accent}`,
        animation: `p-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
      }}
    >
      {/* Compact always-visible header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-opacity hover:opacity-80"
      >
        <span
          className="shrink-0 text-[10px] font-black uppercase tracking-widest"
          style={{ color: "var(--p-muted)", width: "4.5rem" }}
        >
          {title}
        </span>
        <div className="min-w-0 flex-1">{summary}</div>
        <svg
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none", color: "var(--p-dim)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Smooth accordion body */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 240ms ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            className="px-5 pb-5 pt-4"
            style={{ borderTop: "1px solid var(--p-card-border)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}


export function ParseInterface({ isLoggedIn = false }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("other");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [pendingResult, setPendingResult] = useState<ParseApiResult | null>(null);
  const [result, setResult] = useState<ParseApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const resultAreaRef = useRef<HTMLDivElement>(null);

  // Scroll into view when loading starts or result appears
  useEffect(() => {
    if (!resultAreaRef.current) return;
    if (loading || result) {
      const timer = setTimeout(() => {
        resultAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [loading, result]);

  // Step timer: advance 0→1 at 2s, 1→2 at 4s
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const t1 = setTimeout(() => setLoadingStep(1), 2000);
    const t2 = setTimeout(() => setLoadingStep(2), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  // Reveal result once last step shown AND API has responded
  useEffect(() => {
    if (!loading || !pendingResult || loadingStep < PARSE_STEPS.length - 1) return;
    const t = setTimeout(() => {
      setResult(pendingResult);
      setPendingResult(null);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [loadingStep, pendingResult, loading]);

  async function handleParse() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setPendingResult(null);
    setError(null);
    setSaveError(null);

    try {
      const res = await fetch(isLoggedIn ? "/api/inquiries/parse" : "/api/demo/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLoggedIn ? { raw_text: text, source_type: sourceType } : { content: text }
        ),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? (res.status === 429 ? "잠시 후 다시 시도해주세요." : "분석에 실패했습니다."));
        setLoading(false);
        return;
      }
      // Buffer the result — reveal effect will display it after last step
      setPendingResult(json.data as ParseApiResult);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiry_id: result.inquiry_id,
          selected_reply_tone: "polite",
          source_type: sourceType,
          initial_status: "Lead",
        }),
      });
      const json = await res.json() as { success: boolean; error?: { code?: string; message?: string } };
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

  return (
    <div className="flex flex-col gap-8">
      {/* Input card */}
      <section
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: "var(--p-surface)" }}
      >
        {/* Left accent bar */}
        <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: "var(--p-primary)" }} />

        <div className="p-4 sm:p-6 md:p-8">
          {/* Step header */}
          <div className="mb-6">
            <div className="mb-1.5 flex items-center gap-2.5">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                style={{ backgroundColor: "var(--p-primary-soft)", color: "var(--p-primary)" }}
              >
                1
              </span>
              <span className="text-sm font-black" style={{ color: "var(--p-text)" }}>
                문의 내용 붙여넣기
              </span>
            </div>
            <p className="ml-[30px] text-xs leading-relaxed" style={{ color: "var(--p-muted)" }}>
              브랜드에서 받은 협찬 제안 이메일이나 DM 내용을 그대로 복사해서 붙여넣으세요
            </p>
          </div>

          {/* Sample chips */}
          <div className="mb-5">
            <p
              className="mb-2.5 text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--p-dim)" }}
            >
              샘플로 체험해보기
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setText(sample.content)}
                  disabled={loading}
                  className="p-sample-btn rounded-full px-4 py-2 text-xs font-medium"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            rows={8}
            placeholder="예: 안녕하세요, 저희는 XX 브랜드입니다. 인스타그램 피드 포스팅 협찬을 제안드리고 싶어서 연락드렸습니다. 예산은 50만원이고, 다음 달 말 마감입니다..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            className="p-textarea w-full rounded-2xl border-none p-6 text-sm font-medium leading-relaxed transition-all disabled:opacity-50"
            style={{ resize: "vertical" }}
          />

          {/* Footer */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>채널</span>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as SourceType)}
                  disabled={loading}
                  className="min-w-[7rem] rounded-full border-none px-4 py-2 text-xs font-medium outline-none"
                  style={{ backgroundColor: "var(--p-surface-3)", color: "var(--p-text)" }}
                >
                  <option value="email">이메일</option>
                  <option value="dm">DM</option>
                  <option value="other">기타</option>
                </select>
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--p-dim)" }}>
                비회원 체험 · 시간당 10회 제한
              </p>
            )}

            <button
              type="button"
              onClick={handleParse}
              disabled={!text.trim() || loading}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-black tracking-tight text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--p-btn-gradient)", boxShadow: "var(--p-btn-shadow)" }}
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  분석 중…
                </>
              ) : (
                <>
                  분석하기
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          className="rounded-2xl px-5 py-4 text-sm font-medium"
          style={{
            backgroundColor: "var(--p-error-soft)",
            color: "var(--p-error)",
            border: "1px solid var(--p-error-soft-bd)",
          }}
        >
          {error}
        </div>
      )}

      {/* Result area — scroll target, skeleton, and final results */}
      <div ref={resultAreaRef} className="flex flex-col gap-5 sm:gap-6">
        {/* Step 2 label — visible only when results are loading or shown */}
        {(loading || result) && (
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
              style={{ backgroundColor: "var(--p-secondary-soft)", color: "var(--p-secondary)" }}
            >
              2
            </span>
            <span className="text-sm font-black" style={{ color: "var(--p-text)" }}>
              {loading ? "AI가 문의를 분석하고 있습니다…" : "분석 결과"}
            </span>
          </div>
        )}

        {/* 3-step loading progress */}
        {loading && <LoadingSteps step={loadingStep} />}

        {/* Results */}
        {result && (
          <>
            {/* Success banner */}
            <div
              className="flex items-start gap-3 rounded-2xl px-5 py-4"
              style={{
                backgroundColor: "var(--p-tertiary-soft)",
                border: "1px solid var(--p-tertiary-soft-bd)",
              }}
            >
              <span className="mt-0.5 text-base leading-none" style={{ color: "var(--p-tertiary)" }}>✓</span>
              <div>
                <p className="text-sm font-black" style={{ color: "var(--p-tertiary)" }}>
                  분석이 완료되었습니다
                </p>
                {result.missing_fields.length > 0 ? (
                  <p className="mt-0.5 text-xs" style={{ color: "var(--p-muted)" }}>
                    {result.missing_fields.length}개 항목이 확인되지 않았습니다 — 답장 전 확인을 권장합니다
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs" style={{ color: "var(--p-muted)" }}>
                    모든 주요 조건이 확인되었습니다
                  </p>
                )}
              </div>
            </div>

            {/* Accordion rows */}
            <div className="flex flex-col gap-3">
              {/* 문의 분석 */}
              <SectionRow
                accent="var(--p-primary)"
                title="문의 분석"
                delay={0}
                defaultOpen
                summary={
                  <div className="flex items-center gap-2 truncate">
                    {result.parsed_json.brand_name && result.parsed_json.brand_name !== "not specified" && (
                      <span className="truncate text-xs font-bold" style={{ color: "var(--p-text)" }}>
                        {result.parsed_json.brand_name}
                      </span>
                    )}
                    {result.parsed_json.platform_requested && result.parsed_json.platform_requested !== "not specified" && (
                      <>
                        <span style={{ color: "var(--p-dim)" }}>·</span>
                        <span className="truncate text-xs" style={{ color: "var(--p-muted)" }}>
                          {result.parsed_json.platform_requested}
                        </span>
                      </>
                    )}
                    {result.missing_fields.length > 0 && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black"
                        style={{ backgroundColor: "var(--p-error-soft)", color: "var(--p-error)" }}
                      >
                        {result.missing_fields.length}개 누락
                      </span>
                    )}
                  </div>
                }
              >
                <InquiryCard data={result.parsed_json} missingFields={result.missing_fields} bare />
              </SectionRow>

              {/* 예상 견적 */}
              <SectionRow
                accent="var(--p-tertiary)"
                title="예상 견적"
                delay={80}
                summary={
                  <span className="text-sm font-black" style={{ color: "var(--p-tertiary)" }}>
                    {`₩${result.quote_breakdown.target.toLocaleString("ko-KR")}`}
                  </span>
                }
              >
                <QuoteCard data={result.quote_breakdown} bare />
              </SectionRow>

              {/* 누락 항목 */}
              <SectionRow
                accent="var(--p-error)"
                title="누락 항목"
                delay={160}
                summary={
                  result.checks.length === 0 ? (
                    <span className="text-xs font-bold" style={{ color: "var(--p-tertiary)" }}>✓ 모두 확인됨</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {(["HIGH", "MEDIUM", "LOW"] as const)
                        .map((p) => ({ p, count: result.checks.filter((c) => c.priority === p).length }))
                        .filter(({ count }) => count > 0)
                        .map(({ p, count }) => (
                          <span
                            key={p}
                            className="rounded-full px-2 py-0.5 text-[10px] font-black"
                            style={{
                              backgroundColor: p === "HIGH" ? "var(--p-error-soft)" : "var(--p-surface-3)",
                              color: p === "HIGH" ? "var(--p-error)" : "var(--p-muted)",
                            }}
                          >
                            {p === "HIGH" ? "높음" : p === "MEDIUM" ? "보통" : "낮음"} {count}건
                          </span>
                        ))}
                    </div>
                  )
                }
              >
                <ChecksCard checks={result.checks} bare />
              </SectionRow>

              {/* 답장 초안 */}
              <SectionRow
                accent="var(--p-secondary)"
                title="답장 초안"
                delay={240}
                summary={
                  <div className="flex items-center gap-1.5">
                    {(["polite", "quick", "negotiation"] as const)
                      .filter((t) => result.reply_drafts[t] !== null)
                      .map((t) => (
                        <span
                          key={t}
                          className="rounded-full px-2 py-0.5 text-[10px] font-black"
                          style={{ backgroundColor: "var(--p-secondary-soft)", color: "var(--p-secondary)" }}
                        >
                          {t === "polite" ? "정중" : t === "quick" ? "간단" : "협상"}
                        </span>
                      ))}
                    {!isLoggedIn && (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--p-dim)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                }
              >
                <ReplyCard
                  drafts={result.reply_drafts}
                  inquiryId={result.inquiry_id}
                  isLoggedIn={isLoggedIn}
                  bare
                />
              </SectionRow>
            </div>

            {/* Single CTA */}
            <div className="mt-2 flex flex-col items-stretch gap-2">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-black tracking-tight text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "var(--p-btn-gradient)", boxShadow: "var(--p-btn-shadow)" }}
                >
                  {saving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      저장 중…
                    </>
                  ) : "딜로 저장하기"}
                </button>
              ) : (
                <a
                  href="/signup?redirect=/parse"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-black tracking-tight text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "var(--p-btn-gradient)", boxShadow: "var(--p-btn-shadow)" }}
                >
                  무료로 저장하기
                </a>
              )}
              {saveError && (
                <p className="text-center text-xs font-medium" style={{ color: "var(--p-error)" }}>
                  {saveError}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
