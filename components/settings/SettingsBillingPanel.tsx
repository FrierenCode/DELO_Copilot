"use client";

import { useState } from "react";
import { trackClientEvent } from "@/lib/analytics-client";

type Props = {
  plan: "free" | "standard";
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};

const FREE_FEATURES: { label: string; included: boolean }[] = [
  { label: "문의 분석 (5회 / 월)", included: true },
  { label: "기본 견적 산출", included: true },
  { label: "이메일 초안 1개", included: true },
  { label: "협상 AI 및 상세 분석", included: false },
  { label: "딜 진행 관리", included: false },
];

const PRO_FEATURES: { label: string }[] = [
  { label: "문의 분석 무제한" },
  { label: "스마트 체크리스트" },
  { label: "딜 상세 분석 리포트" },
  { label: "이메일 초안 3개" },
  { label: "협상 전략 AI 가이드" },
  { label: "딜 통합 관리" },
  { label: "실시간 알림 서비스" },
];

export function SettingsBillingPanel({ plan, subscriptionStatus, currentPeriodEnd }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = plan === "standard";
  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const periodLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\. /g, "-").replace(".", "")
    : null;

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_path: "/dashboard/settings/billing" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "결제 세션 생성에 실패했습니다.");
      }
      trackClientEvent("checkout_started");
      window.location.href = json.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Section 1: Current Plan ── */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/50 to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {isPro ? (
                  <span className="px-3 py-1 bg-gradient-to-r from-[#6366F1]/20 to-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-[#6366F1]/20">
                    Standard 플랜
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[var(--d-border)] text-[var(--d-m)] text-xs font-bold rounded-full border border-[var(--d-border)]">
                    Free 플랜
                  </span>
                )}
                {isPro && isActive && (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" style={{ animationDuration: "2.5s" }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs text-[var(--d-m)] font-medium">현재 이용 중</span>
                  </div>
                )}
                {subscriptionStatus === "canceled" && (
                  <span className="text-xs text-amber-400">취소됨 (기간 만료까지 Standard 유지)</span>
                )}
                {subscriptionStatus === "past_due" && (
                  <span className="text-xs text-rose-400">결제 미납 — 플랜 갱신 필요</span>
                )}
              </div>

              {isPro && (
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-[var(--d-m)]">
                    구독 상태:{" "}
                    <span className="text-[var(--d-h)] font-medium">
                      {isActive ? "활성" : subscriptionStatus ?? "—"}
                    </span>
                  </p>
                  {periodLabel && (
                    <p className="text-sm text-[var(--d-m)]">
                      다음 갱신일: <span className="text-[var(--d-h)] font-medium">{periodLabel}</span>
                    </p>
                  )}
                </div>
              )}

              {!isPro && (
                <div className="mt-3 overflow-hidden rounded-xl border border-[#6366F1]/20 bg-gradient-to-r from-[#6366F1]/8 to-indigo-500/5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1]/30 to-indigo-500/20 text-[#a78bfa] sm:flex">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--d-b)] max-w-md">
                        Standard로 업그레이드하면{" "}
                        <span className="font-bold text-[#a78bfa]">
                          협상 AI, 딜 진행 관리, 문의 분석 무제한
                        </span>
                        을 사용할 수 있습니다.
                      </p>
                    </div>
                    <button
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="btn-gradient whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6366F1]/20 disabled:opacity-60 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          이동 중...
                        </>
                      ) : "Standard 시작하기 →"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isPro && (
              <button className="px-4 py-2 border border-[var(--d-border)] text-[var(--d-b)] text-sm font-medium rounded-full hover:bg-[var(--d-surface2)] hover:border-[#6366F1]/30 transition-all">
                구독 관리
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-400">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* ── Section 2: Plan Comparison ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE card */}
        <div className="relative overflow-hidden rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-8 flex flex-col opacity-75">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
          <div className="mb-6">
            <span className="text-[var(--d-m)] text-xs font-black uppercase tracking-widest">Free</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-[var(--d-h)]">₩0</span>
              <span className="text-[var(--d-f)] font-medium">/ 월</span>
            </div>
          </div>
          <ul className="space-y-3.5 mb-8 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm">
                {f.included ? (
                  <>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </span>
                    <span className="text-[var(--d-b)]">{f.label}</span>
                  </>
                ) : (
                  <>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--d-border)] text-[var(--d-f)]">
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 6h8" />
                      </svg>
                    </span>
                    <span className="text-[var(--d-f)]">{f.label}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="text-center py-2 text-[var(--d-f)] text-sm font-medium">
            {isPro ? "현재 플랜 아님" : "현재 플랜"}
          </div>
        </div>

        {/* Standard card */}
        <div
          className={`relative rounded-xl p-8 flex flex-col bg-[var(--d-surface)] ${
            isPro
              ? "border-2 border-[#6366F1]/50 shadow-xl shadow-[#6366F1]/10"
              : "border border-[var(--d-border)]"
          }`}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366F1]/4 via-transparent to-transparent" />
          {isPro && (
            <div className="absolute -top-3 right-8">
              <span className="bg-gradient-to-r from-[#6366F1] to-indigo-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-lg shadow-[#6366F1]/30">
                현재 플랜
              </span>
            </div>
          )}
          <div className="relative mb-6">
            <span className="text-[#a78bfa] text-xs font-black uppercase tracking-widest">Standard</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-[var(--d-h)]">₩12,900</span>
              <span className="text-[var(--d-f)] font-medium">/ 월</span>
            </div>
          </div>
          <ul className="relative space-y-3.5 mb-8 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-[var(--d-b)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/20 text-[#a78bfa]">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </span>
                {f.label}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="relative flex items-center justify-center gap-2 py-2.5 bg-[#6366F1]/10 rounded-full text-[#a78bfa] font-bold text-sm border border-[#6366F1]/20">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
              이용 중
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="relative btn-gradient w-full rounded-full py-3 font-bold text-white text-sm shadow-lg shadow-[#6366F1]/25 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  이동 중...
                </>
              ) : "Standard 시작하기 →"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
