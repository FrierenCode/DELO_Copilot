"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";
import type { ParseApiResult } from "@/types/parse-api";

/* ─── helpers ─── */
type ReplyTone = "polite" | "quick" | "negotiation";

const TONE_LABELS: Record<ReplyTone, string> = {
  polite: "정중한 답장",
  quick: "빠른 확인",
  negotiation: "협상 제안",
};

function monogram(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatKRW(amount: number | null | undefined) {
  if (amount == null) return "—";
  return "₩" + amount.toLocaleString("ko-KR");
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const PRIORITY_BADGE: Record<string, string> = {
  HIGH: "bg-red-500/10 text-red-500",
  MEDIUM: "bg-amber-500/10 text-amber-500",
  LOW: "bg-green-500/10 text-green-500",
};

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "Missing",
  MEDIUM: "Need Check",
  LOW: "Confirmed",
};

/* ─── page ─── */
export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ParseApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ReplyTone>("polite");
  const [drafts, setDrafts] = useState<Record<ReplyTone, string | null>>({
    polite: null,
    quick: null,
    negotiation: null,
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/inquiries/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const d = json.data as ParseApiResult;
          setData(d);
          setDrafts({
            polite: d.reply_drafts.polite ?? null,
            quick: d.reply_drafts.quick ?? null,
            negotiation: d.reply_drafts.negotiation ?? null,
          });
        } else {
          setError(json.error?.message ?? "데이터를 불러오지 못했습니다.");
        }
      })
      .catch(() => setError("네트워크 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!id || !data) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_drafts: { [activeTab]: drafts[activeTab] } }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "저장 실패");
      setSaveMsg("저장됨");
      setTimeout(() => setSaveMsg(null), 2000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "오류");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    const text = drafts[activeTab];
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <Loader label="문의 상세를 불러오는 중…" />;

  if (error) return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {error}
    </div>
  );

  if (!data) return null;

  const p = data.parsed_json;
  const q = data.quote_breakdown;
  const isPro = data.reply_meta.negotiation_ai_available;
  const FREE_VISIBLE = 3;

  const parseFields = [
    { label: "브랜드명", value: p.brand_name || "—" },
    { label: "담당자", value: p.contact_name || "—" },
    { label: "채널", value: p.contact_channel || p.platform_requested || "—" },
    { label: "요청 산출물", value: p.deliverables || "—" },
    { label: "일정", value: p.timeline || "—" },
    { label: "보상", value: p.budget_mentioned || "—" },
  ];

  const sortedChecks = [...data.checks].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--d-m)] mb-6">
        <Link href="/dashboard/history" className="hover:text-[var(--d-h)] transition-colors">
          히스토리
        </Link>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
        <span className="text-[var(--d-b)]">{p.brand_name} 문의 상세</span>
      </nav>

      {/* Header Card */}
      <header className="bg-[var(--d-surface)] border border-[var(--d-border)] rounded-xl p-6 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[var(--d-surface2)] border border-[var(--d-border)] flex items-center justify-center text-indigo-400 font-bold text-2xl flex-shrink-0">
            {monogram(p.brand_name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--d-h)] mb-1">{p.brand_name}</h1>
            <p className="text-sm text-[var(--d-m)] flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {p.contact_channel || p.platform_requested || "—"}
              {data.created_at && (
                <span>· {formatDate(data.created_at)} 수신</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Link
            href="/dashboard"
            className="bg-indigo-500 hover:bg-indigo-400 text-[var(--d-h)] px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            Deal로 저장
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs text-[var(--d-m)] hover:text-[var(--d-h)] underline underline-offset-4 transition-colors"
          >
            이미 저장된 딜 보기 →
          </Link>
        </div>
      </header>

      {/* 2-column grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* ── Left col-span-7 ── */}
        <div className="col-span-12 lg:col-span-7 space-y-8">

          {/* Parsing results */}
          <section>
            <h2 className="text-lg font-bold text-[var(--d-h)] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              파싱 결과
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {parseFields.map(({ label, value }) => (
                <div key={label} className="bg-[var(--d-surface)] border border-[var(--d-border)] p-4 rounded-xl">
                  <p className="text-[11px] text-[var(--d-m)] uppercase font-bold mb-1">{label}</p>
                  <p className="text-sm text-[var(--d-b)] break-words">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quote */}
          <section>
            <h2 className="text-lg font-bold text-[var(--d-h)] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              예상 견적
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[var(--d-surface)] border border-[var(--d-border)] p-5 rounded-xl hover:border-[var(--d-border)] transition-colors">
                <p className="text-xs text-[var(--d-m)] mb-1">Floor</p>
                <p className="text-xl font-bold text-[var(--d-b)]">{formatKRW(q.floor)}</p>
              </div>
              <div className="bg-[var(--d-surface)] border-2 border-indigo-500 p-5 rounded-xl relative overflow-hidden shadow-xl shadow-indigo-500/10">
                <div className="absolute top-0 right-0 bg-indigo-500 text-[10px] font-bold px-2 py-0.5 text-[var(--d-h)] uppercase tracking-tighter rounded-bl-lg">
                  Recommended
                </div>
                <p className="text-xs text-indigo-400 font-bold mb-1">Target</p>
                <p className="text-xl font-bold text-[var(--d-h)]">{formatKRW(q.target)}</p>
              </div>
              <div className="bg-[var(--d-surface)] border border-[var(--d-border)] p-5 rounded-xl hover:border-[var(--d-border)] transition-colors">
                <p className="text-xs text-[var(--d-m)] mb-1">Premium</p>
                <p className="text-xl font-bold text-[var(--d-b)]">{formatKRW(q.premium)}</p>
              </div>
            </div>
          </section>

          {/* Contract checklist */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--d-h)] flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,11 12,14 22,4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                계약 체크리스트
              </h2>
              <span className="text-[11px] text-[var(--d-m)] italic">* DELO AI가 법적 검토를 보조합니다.</span>
            </div>

            <div className="bg-[var(--d-surface)] border border-[var(--d-border)] rounded-xl divide-y divide-[var(--d-border)] overflow-hidden">
              {sortedChecks.length === 0 && (
                <p className="p-4 text-sm text-[var(--d-m)]">체크 항목이 없습니다.</p>
              )}
              {sortedChecks.map((check, i) => {
                const isBlurred = !isPro && i >= FREE_VISIBLE;
                return (
                  <div key={check.check_code} className="p-4 flex items-center justify-between relative">
                    <span className={`text-sm text-[var(--d-b)] pr-4 ${isBlurred ? "blur-[3px] select-none" : ""}`}>
                      {check.message}
                    </span>
                    {isBlurred ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--d-surface)]/40">
                        <span className="bg-[var(--d-surface2)] text-[var(--d-m)] text-[10px] px-2 py-1 rounded border border-[var(--d-border)]">
                          PRO 전용 항목
                        </span>
                      </div>
                    ) : (
                      <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase ${PRIORITY_BADGE[check.priority]}`}>
                        {PRIORITY_LABEL[check.priority]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] text-[var(--d-f)] leading-relaxed px-1">
              본 체크리스트는 AI 자동 분석 결과로, 실제 법적 효력을 보장하지 않습니다. 중요한 계약 전 반드시 전문가의 검토를 받으시기 바랍니다.
            </p>

            {!isPro && sortedChecks.length > FREE_VISIBLE && (
              <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-sm text-indigo-300 flex items-center justify-between gap-4">
                <span>나머지 {sortedChecks.length - FREE_VISIBLE}개 항목은 Pro에서 확인할 수 있습니다.</span>
                <Link href="/dashboard/settings" className="shrink-0 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                  업그레이드 →
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* ── Right col-span-5 ── */}
        <div className="col-span-12 lg:col-span-5 space-y-6">

          {/* Reply draft panel */}
          <section className="bg-[var(--d-surface)] border border-[var(--d-border)] rounded-xl flex flex-col">
            <div className="p-4 border-b border-[var(--d-border)]">
              <h2 className="text-sm font-bold text-[var(--d-h)] flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                답장 초안
              </h2>
              <div className="flex gap-2 p-1 bg-[var(--d-bg)]/50 rounded-lg">
                {(["polite", "quick", "negotiation"] as ReplyTone[]).map((tone) => {
                  const active = activeTab === tone;
                  const locked = !isPro && tone !== "polite";
                  return (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => !locked && setActiveTab(tone)}
                      className={[
                        "flex-1 text-[11px] font-medium py-1.5 px-1 rounded-md transition-colors",
                        active
                          ? "bg-[var(--d-surface2)] text-[var(--d-h)] border border-[var(--d-border)]"
                          : locked
                          ? "text-[var(--d-f)] cursor-not-allowed"
                          : "text-[var(--d-m)] hover:text-[var(--d-h)]",
                      ].join(" ")}
                    >
                      {TONE_LABELS[tone]}
                      {locked && (
                        <span className="ml-1 text-[9px] align-middle text-indigo-500">PRO</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative p-4">
              <button
                type="button"
                onClick={handleCopy}
                title="복사"
                className="absolute top-6 right-6 p-2 rounded-lg bg-[var(--d-surface2)] border border-[var(--d-border)] text-[var(--d-m)] hover:text-[var(--d-h)] transition-colors z-10"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>

              {!isPro && activeTab !== "polite" ? (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-sm text-[var(--d-m)]">이 초안은 Standard 전용입니다.</p>
                  <Link href="/dashboard/settings" className="text-xs text-indigo-400 font-bold hover:underline underline-offset-4">
                    Standard로 업그레이드 →
                  </Link>
                </div>
              ) : (
                <textarea
                  value={drafts[activeTab] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [activeTab]: e.target.value }))
                  }
                  rows={10}
                  className="w-full bg-transparent border-none text-[var(--d-b)] text-sm leading-relaxed focus:outline-none resize-none pr-10"
                  placeholder="초안 생성 중..."
                />
              )}
            </div>

            <div className="p-4 border-t border-[var(--d-border)] flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={[
                  "text-[12px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50",
                  saveMsg === "저장됨"
                    ? "text-green-400 border-green-500/20"
                    : "text-[var(--d-m)] hover:text-[var(--d-h)] border-transparent hover:border-[var(--d-border)]",
                ].join(" ")}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17,21 17,13 7,13 7,21" /><polyline points="7,3 7,8 15,8" />
                </svg>
                {saving ? "저장 중…" : (saveMsg ?? "수정 저장")}
              </button>
            </div>
          </section>

          {/* Raw text toggle */}
          <section className="bg-[var(--d-surface)] border border-[var(--d-border)] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setRawOpen((v) => !v)}
              className="w-full p-4 flex items-center justify-between text-[var(--d-m)] hover:text-[var(--d-h)] transition-colors"
            >
              <span className="text-sm font-bold flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                원문 보기
              </span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${rawOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
            {rawOpen && (
              <div className="px-4 pb-4">
                {data.raw_text_preview ? (
                  <pre className="text-xs text-[var(--d-m)] leading-relaxed whitespace-pre-wrap bg-[var(--d-bg)] rounded-lg p-3 max-h-48 overflow-y-auto">
                    {data.raw_text_preview}
                  </pre>
                ) : (
                  <p className="text-xs text-[var(--d-f)] pb-2">원문 미리보기를 사용할 수 없습니다.</p>
                )}
              </div>
            )}
          </section>

          {/* Pro upgrade banner (free only) */}
          {!isPro && (
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[var(--d-h)] mb-1">PRO 업그레이드</h3>
                  <p className="text-[11px] text-[var(--d-m)] leading-relaxed mb-3">
                    더 상세한 계약 조항 분석과 3가지 스타일의 AI 초안을 무제한으로 사용해보세요.
                  </p>
                  <Link
                    href="/dashboard/settings"
                    className="block w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-[var(--d-h)] text-[12px] font-bold rounded-lg transition-all text-center"
                  >
                    혜택 더보기
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
