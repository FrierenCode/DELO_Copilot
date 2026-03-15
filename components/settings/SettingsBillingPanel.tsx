"use client";

import { useState } from "react";
import { trackClientEvent } from "@/lib/analytics-client";

type Props = {
  plan: "free" | "pro";
  email: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};

export function SettingsBillingPanel({
  plan,
  email,
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
        month: "long",
        day: "numeric",
      })
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
    <div className="flex flex-col gap-4">
      {/* Account */}
      <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5">
        <h2 className="text-sm font-semibold text-neutral-900">계정</h2>
        <p className="mt-1 text-sm text-neutral-500">{email}</p>
      </section>

      {/* Plan */}
      <section className="rounded-xl border border-neutral-200 bg-white px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">플랜</h2>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isPro
                    ? "bg-violet-100 text-violet-700"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {isPro ? "Pro" : "Free"}
              </span>
              {isActive && periodLabel && (
                <span className="text-xs text-neutral-400">
                  다음 갱신일: {periodLabel}
                </span>
              )}
              {subscriptionStatus === "canceled" && (
                <span className="text-xs text-amber-600">취소됨 (기간 만료까지 Pro 유지)</span>
              )}
              {subscriptionStatus === "past_due" && (
                <span className="text-xs text-red-600">결제 미납 — 플랜 갱신 필요</span>
              )}
            </div>
          </div>

          {!isPro && (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? "이동 중..." : "Pro로 업그레이드"}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        {!isPro && (
          <div className="mt-4 rounded-lg bg-neutral-50 p-4">
            <p className="text-xs font-medium text-neutral-700 mb-2">Pro 플랜 혜택</p>
            <ul className="space-y-1 text-xs text-neutral-500">
              <li>✓ 월 문의 파싱 무제한</li>
              <li>✓ Deal 저장 무제한</li>
              <li>✓ AI 협상 답장 (negotiation tone)</li>
              <li>✓ 견적 상세 내역 전체 공개</li>
              <li>✓ 체크 항목 전체 공개</li>
              <li>✓ 운영 알림 (마감 임박, 미답변 등)</li>
            </ul>
          </div>
        )}
      </section>

      {/* Legal */}
      <p className="text-xs text-neutral-400">
        결제 관련 문의는{" "}
        <a href="mailto:support@creatordealcopilot.com" className="underline hover:text-neutral-600">
          support@creatordealcopilot.com
        </a>
        으로 연락하세요.{" "}
        <a href="/terms" className="underline hover:text-neutral-600">
          이용약관
        </a>{" "}
        및{" "}
        <a href="/privacy" className="underline hover:text-neutral-600">
          개인정보처리방침
        </a>
        에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
