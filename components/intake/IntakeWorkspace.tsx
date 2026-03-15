"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IntakeBrief } from "@/components/intake/IntakeBrief";
import { IntakeQuote } from "@/components/intake/IntakeQuote";
import { IntakeChecks } from "@/components/intake/IntakeChecks";
import { IntakeReply } from "@/components/intake/IntakeReply";
import type { ParseApiResult } from "@/types/parse-api";

// ─── Constants ────────────────────────────────────────────────────────────────

type SourceType = "email" | "dm" | "other";
type ReplyTone = "polite" | "quick" | "negotiation";
type PanelState = "empty" | "loading" | "success" | "error";
type DealStatus = "Lead" | "Replied" | "Negotiating";

const SAMPLE_INQUIRY =
  "안녕하세요! ○○ 브랜드 마케팅팀입니다. 유튜브 쇼츠 1건과 인스타 릴스 1건 협업을 제안드립니다. 게시일은 2주 후이며, 제품은 제공해드립니다. 예산은 협의 가능합니다.";

// Shown sequentially while the parse API call is in-flight
const PARSE_PROGRESS = [
  "문의 분석 중...",
  "가격 계산 중...",
  "답장 초안 생성 중...",
] as const;

const PROGRESS_INTERVAL_MS = 2200;

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

  // Advance the progress text while loading; reset when done
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
  }

  async function handleSave() {
    if (!parseResult || saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Preferred path: inquiry_id lets the backend reuse the existing parse record
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const canParse = text.trim().length > 0 && panelState !== "loading";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    // pb-24 reserves space so the sticky action bar never overlaps content
    <div className="flex flex-col gap-6 pb-24">
      {/* Two-column layout: stacks on mobile, side-by-side on md+ */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {/* ── Left panel (40%) ── */}
        <div className="flex flex-col gap-4 md:w-[40%] md:shrink-0">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            {/* Inquiry textarea */}
            <div className="mb-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={panelState === "loading"}
                placeholder="브랜드 이메일이나 DM을 붙여넣으세요"
                rows={10}
                className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              />
            </div>

            {/* Source type select — labels in Korean, values match backend enum */}
            <div className="mb-4 flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">문의 유형</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                disabled={panelState === "loading"}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:opacity-60"
              >
                {/* 이메일 → "email" */}
                <option value="email">이메일</option>
                {/* Instagram DM → "dm" */}
                <option value="dm">Instagram DM</option>
                {/* 기타 → "other" */}
                <option value="other">기타</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleParse}
                disabled={!canParse}
                className="flex-1"
              >
                {panelState === "loading" ? "분석 중..." : "분석하기"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSampleFill}
                disabled={panelState === "loading"}
                className="sm:shrink-0"
              >
                샘플 문의로 체험
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right panel (60%) ── */}
        <div className="flex flex-1 flex-col gap-4">
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
      </div>

      {/* ── Sticky action bar — only visible after a successful parse ── */}
      {parseResult && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-200 bg-white px-4 py-3 shadow-lg sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <select
              value={dealStatus}
              onChange={(e) => setDealStatus(e.target.value as DealStatus)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="Lead">Lead</option>
              <option value="Replied">Replied</option>
              <option value="Negotiating">Negotiating</option>
            </select>

            {saveError ? (
              <p className="flex-1 text-xs text-red-600">{saveError}</p>
            ) : (
              <div className="flex-1" />
            )}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "Deal로 저장"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Panel state components ───────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-8 py-16 text-center">
      <p className="text-base font-medium text-neutral-400">분석 결과가 여기에 표시됩니다</p>
      <p className="mt-2 text-sm text-neutral-400">
        왼쪽에 브랜드 이메일이나 DM을 붙여넣고 분석하기를 눌러보세요.
      </p>
    </div>
  );
}

function LoadingState({ step }: { step: number }) {
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white px-8 py-16 text-center shadow-sm">
      {/* Step indicator dots */}
      <div className="mb-4 flex gap-1.5">
        {PARSE_PROGRESS.map((_, i) => (
          <div
            key={i}
            className={[
              "h-1.5 w-8 rounded-full transition-all duration-500",
              i <= step ? "bg-neutral-900" : "bg-neutral-200",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-neutral-700">{PARSE_PROGRESS[step]}</p>
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
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-8 py-16 text-center">
      <p className="font-medium text-red-700">분석 실패</p>
      <p className="mt-2 text-sm text-red-600">
        {message ?? "알 수 없는 오류가 발생했습니다."}
      </p>
      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
