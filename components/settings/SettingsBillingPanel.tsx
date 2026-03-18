"use client";

import { useState } from "react";
import Link from "next/link";
import { trackClientEvent } from "@/lib/analytics-client";

type Props = {
  plan: "free" | "pro";
  email: string;
  createdAt: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};

const FREE_FEATURES: { label: string; included: boolean }[] = [
  { label: "기본 파싱 (10회 / 월)", included: true },
  { label: "기본 견적 산출", included: true },
  { label: "이메일 초안 1개", included: true },
  { label: "협상 AI 및 상세 분석", included: false },
  { label: "딜 파이프라인 관리", included: false },
];

const PRO_FEATURES: { label: string }[] = [
  { label: "무제한 파싱" },
  { label: "스마트 체크리스트" },
  { label: "딜 상세 분석 리포트" },
  { label: "이메일 초안 3개" },
  { label: "협상 전략 AI 가이드" },
  { label: "통합 딜 파이프라인" },
  { label: "실시간 알림 서비스" },
];

export function SettingsBillingPanel({
  plan,
  email,
  createdAt,
  subscriptionStatus,
  currentPeriodEnd,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = plan === "pro";
  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const periodLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\. /g, "-").replace(".", "")
    : null;

  const joinedLabel = createdAt
    ? new Date(createdAt).toLocaleDateString("ko-KR", {
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
        body: JSON.stringify({ cancel_path: "/settings" }),
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
      <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {isPro ? (
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full">
                  Pro 플랜
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-full">
                  Free 플랜
                </span>
              )}
              {isPro && isActive && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-slate-400 font-medium">현재 이용 중</span>
                </div>
              )}
              {subscriptionStatus === "canceled" && (
                <span className="text-xs text-amber-400">취소됨 (기간 만료까지 Pro 유지)</span>
              )}
              {subscriptionStatus === "past_due" && (
                <span className="text-xs text-rose-400">결제 미납 — 플랜 갱신 필요</span>
              )}
            </div>

            {isPro && (
              <div className="mt-1 space-y-1">
                <p className="text-sm text-slate-400">
                  구독 상태:{" "}
                  <span className="text-white font-medium">
                    {isActive ? "활성" : subscriptionStatus ?? "—"}
                  </span>
                </p>
                {periodLabel && (
                  <p className="text-sm text-slate-400">
                    다음 갱신일: <span className="text-white font-medium">{periodLabel}</span>
                  </p>
                )}
              </div>
            )}

            {!isPro && (
              <div className="mt-3 bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-4 items-center">
                  <div className="hidden sm:flex w-10 h-10 bg-indigo-500/20 rounded-lg items-center justify-center text-indigo-400 shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-200 max-w-md">
                    Pro로 업그레이드하면{" "}
                    <span className="text-indigo-400 font-bold">
                      협상 AI, 딜 파이프라인, 무제한 파싱
                    </span>
                    을 사용할 수 있습니다.
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="whitespace-nowrap px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-full transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? "이동 중..." : "Pro 시작하기 →"}
                </button>
              </div>
            )}
          </div>

          {isPro && (
            <button className="px-4 py-2 border border-[#1E1E2E] text-slate-300 text-sm font-medium rounded-full hover:bg-slate-800 transition-colors">
              구독 관리
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-400">
            {error}
          </p>
        )}
      </section>

      {/* ── Section 2: Plan Comparison ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE card */}
        <div className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-8 flex flex-col opacity-80">
          <div className="mb-6">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Free</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-white">₩0</span>
              <span className="text-slate-500 font-medium">/ 월</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm">
                {f.included ? (
                  <>
                    <span className="text-green-500 text-lg leading-none">✓</span>
                    <span className="text-slate-300">{f.label}</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-600 text-lg leading-none">—</span>
                    <span className="text-slate-500">{f.label}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="text-center py-2 text-slate-500 text-sm font-medium">
            현재 플랜 아님
          </div>
        </div>

        {/* PRO card */}
        <div
          className={`bg-[#13131A] rounded-xl p-8 flex flex-col relative ${
            isPro
              ? "border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              : "border border-[#1E1E2E]"
          }`}
        >
          {isPro && (
            <div className="absolute -top-3 right-8">
              <span className="bg-indigo-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                현재 플랜
              </span>
            </div>
          )}
          <div className="mb-6">
            <span className="text-indigo-400 text-sm font-bold uppercase tracking-widest">Pro</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-white">₩19,900</span>
              <span className="text-slate-500 font-medium">/ 월</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="text-green-500 text-lg leading-none">✓</span>
                {f.label}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-indigo-500/10 rounded-full text-indigo-400 font-bold text-sm">
              <span>✓</span>
              이용 중
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full text-sm transition-colors disabled:opacity-60"
            >
              {loading ? "이동 중..." : "Pro 시작하기 →"}
            </button>
          )}
        </div>
      </section>

      {/* ── Section 3: Account Info ── */}
      <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-6">계정 정보</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                이메일 주소
              </label>
              <div className="px-4 py-2.5 bg-[#0D0D14] border border-[#1E1E2E] rounded-lg text-slate-500 text-sm">
                {email}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                가입일
              </label>
              <div className="px-4 py-2.5 bg-[#0D0D14] border border-[#1E1E2E] rounded-lg text-slate-300 text-sm">
                {joinedLabel ?? "—"}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-slate-500">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[13px]">이메일 변경은 고객 지원을 통해 요청해 주세요.</p>
          </div>
        </div>
      </section>

      {/* ── Section 4: Support & Legal ── */}
      <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <h2 className="text-lg font-bold text-white p-6 pb-2">고객 지원 및 약관</h2>
        <div className="divide-y divide-[#1E1E2E]">
          <a
            href="mailto:support@delocopilot.com"
            className="flex items-center justify-between p-6 hover:bg-[#0D0D14] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">문의하기</p>
                <p className="text-xs text-slate-500">support@delocopilot.com</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <Link
            href="/terms"
            className="flex items-center justify-between p-6 hover:bg-[#0D0D14] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white">이용약관</p>
            </div>
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/privacy"
            className="flex items-center justify-between p-6 hover:bg-[#0D0D14] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white">개인정보처리방침</p>
            </div>
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
