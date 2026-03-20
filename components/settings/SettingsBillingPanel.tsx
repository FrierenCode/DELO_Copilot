"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setDeleteError(json.error?.message ?? "계정 삭제에 실패했습니다.");
        setDeleting(false);
        return;
      }
      router.push("/");
    } catch {
      setDeleteError("네트워크 오류가 발생했습니다.");
      setDeleting(false);
    }
  }

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
      <section className="relative overflow-hidden rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/50 to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {isPro ? (
                  <span className="px-3 py-1 bg-gradient-to-r from-[#6366F1]/20 to-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-[#6366F1]/20">
                    Pro 플랜
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
                  <span className="text-xs text-amber-400">취소됨 (기간 만료까지 Pro 유지)</span>
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
                        Pro로 업그레이드하면{" "}
                        <span className="font-bold text-[#a78bfa]">
                          협상 AI, 딜 파이프라인, 무제한 파싱
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
                      ) : (
                        "Pro 시작하기 →"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isPro && (
              <button className="px-4 py-2 border border-[var(--d-border)] text-[var(--d-b)] text-sm font-medium rounded-full hover:bg-slate-800/60 hover:border-slate-600 transition-all">
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
            현재 플랜 아님
          </div>
        </div>

        {/* PRO card */}
        <div
          className={`relative overflow-hidden rounded-xl p-8 flex flex-col bg-[var(--d-surface)] ${
            isPro
              ? "border-2 border-[#6366F1]/50 shadow-xl shadow-[#6366F1]/10"
              : "border border-[var(--d-border)]"
          }`}
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/80 to-transparent" />
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366F1]/4 via-transparent to-transparent" />

          {isPro && (
            <div className="absolute -top-3 right-8">
              <span className="bg-gradient-to-r from-[#6366F1] to-indigo-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-lg shadow-[#6366F1]/30">
                현재 플랜
              </span>
            </div>
          )}
          <div className="relative mb-6">
            <span className="text-[#a78bfa] text-xs font-black uppercase tracking-widest">Pro</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-[var(--d-h)]">₩19,900</span>
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
              ) : (
                "Pro 시작하기 →"
              )}
            </button>
          )}
        </div>
      </section>

      {/* ── Section 3: Account Info ── */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
        <div className="p-6">
          <h2 className="mb-6 text-lg font-bold text-[var(--d-h)]">계정 정보</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--d-f)] uppercase tracking-wider">
                  이메일 주소
                </label>
                <div className="px-4 py-2.5 bg-[var(--d-surface2)] border border-[var(--d-border)] rounded-lg text-[var(--d-m)] text-sm">
                  {email}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--d-f)] uppercase tracking-wider">
                  가입일
                </label>
                <div className="px-4 py-2.5 bg-[var(--d-surface2)] border border-[var(--d-border)] rounded-lg text-[var(--d-b)] text-sm">
                  {joinedLabel ?? "—"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[var(--d-f)]">
              <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--d-f)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[13px]">이메일 변경은 고객 지원을 통해 요청해 주세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Support & Legal ── */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
        <h2 className="p-6 pb-2 text-lg font-bold text-[var(--d-h)]">고객 지원 및 약관</h2>
        <div className="divide-y divide-[var(--d-border)]">
          <a
            href="mailto:support@delocopilot.com"
            className="group flex items-center justify-between p-6 transition-colors hover:bg-[#6366F1]/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1]/20 to-indigo-500/10 text-[#a78bfa] transition-all group-hover:from-[#6366F1]/30 group-hover:to-indigo-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--d-h)]">문의하기</p>
                <p className="text-xs text-[var(--d-f)]">support@delocopilot.com</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-[var(--d-f)] transition-all group-hover:text-[#6366F1] group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <Link
            href="/terms"
            className="group flex items-center justify-between p-6 transition-colors hover:bg-[#6366F1]/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 text-slate-400 transition-all group-hover:from-[#6366F1]/20 group-hover:to-indigo-500/10 group-hover:text-[#a78bfa]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[var(--d-h)]">이용약관</p>
            </div>
            <svg className="w-4 h-4 text-[var(--d-f)] transition-all group-hover:text-[#6366F1] group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/privacy"
            className="group flex items-center justify-between p-6 transition-colors hover:bg-[#6366F1]/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 text-slate-400 transition-all group-hover:from-[#6366F1]/20 group-hover:to-indigo-500/10 group-hover:text-[#a78bfa]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[var(--d-h)]">개인정보처리방침</p>
            </div>
            <svg className="w-4 h-4 text-[var(--d-f)] transition-all group-hover:text-[#6366F1] group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Section 5: Danger Zone ── */}
      <section className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.03]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="p-6">
          <h2 className="mb-1 text-sm font-bold text-red-400">위험 구역</h2>
          <p className="mb-5 text-xs text-[var(--d-f)]">
            아래 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--d-b)]">회원 탈퇴</p>
              <p className="mt-0.5 text-xs text-[var(--d-f)]">
                계정과 모든 데이터가 영구적으로 삭제됩니다.
              </p>
            </div>
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmInput(""); setDeleteError(null); }}
              className="shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </section>

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-[var(--d-surface)] shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <div className="p-6">
              {/* Icon + title */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--d-h)]">정말 탈퇴하시겠어요?</h3>
                  <p className="text-xs text-[var(--d-f)]">이 작업은 되돌릴 수 없습니다.</p>
                </div>
              </div>

              {/* Warning list */}
              <ul className="mb-5 space-y-2 rounded-xl border border-red-500/15 bg-red-500/5 p-4">
                {[
                  "모든 딜 데이터와 분석 히스토리가 삭제됩니다",
                  "크리에이터 프로필 정보가 삭제됩니다",
                  "Pro 구독이 있다면 즉시 해지됩니다",
                  "삭제된 데이터는 복구할 수 없습니다",
                ].map((msg) => (
                  <li key={msg} className="flex items-start gap-2 text-xs text-red-400/80">
                    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {msg}
                  </li>
                ))}
              </ul>

              {/* Confirm input */}
              <div className="mb-5 space-y-2">
                <label className="text-xs font-bold text-[var(--d-m)]">
                  확인을 위해 이메일 주소를 입력하세요
                </label>
                <p className="rounded-lg bg-[var(--d-surface2)] px-3 py-2 text-xs font-mono text-[var(--d-m)] border border-[var(--d-border)]">
                  {email}
                </p>
                <input
                  type="email"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={email}
                  disabled={deleting}
                  className="w-full rounded-xl border border-[var(--d-border)] bg-[var(--d-surface2)] px-4 py-2.5 text-sm text-[var(--d-h)] placeholder:text-[var(--d-f)] focus:border-red-500/60 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
                />
              </div>

              {deleteError && (
                <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {deleteError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-[var(--d-border)] py-2.5 text-sm font-medium text-[var(--d-m)] transition-all hover:bg-white/5 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmInput !== email}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      삭제 중...
                    </>
                  ) : "영구 삭제"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
