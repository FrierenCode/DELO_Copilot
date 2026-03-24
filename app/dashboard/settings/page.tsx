import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanForUser } from "@/services/usage-guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const plan = await getUserPlanForUser(user.id);
  const isPro = plan === "standard";

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <header>
        <h1 className="text-xl font-black text-[var(--d-h)]">설정</h1>
        <p className="mt-0.5 text-sm text-[var(--d-m)]">계정, 구독, 지원 정보를 관리합니다.</p>
      </header>

      {/* ── Navigation ── */}
      <div className="rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] divide-y divide-[var(--d-border)] overflow-hidden">
        <Link
          href="/dashboard/settings/profile"
          className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#6366F1]/5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#a78bfa] transition-colors group-hover:bg-[#6366F1]/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--d-h)]">내 정보</p>
            <p className="text-xs text-[var(--d-m)]">닉네임, 비밀번호, 이메일</p>
          </div>
          <svg className="w-4 h-4 text-[var(--d-f)] group-hover:text-[#6366F1] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/dashboard/settings/billing"
          className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#6366F1]/5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#a78bfa] transition-colors group-hover:bg-[#6366F1]/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--d-h)]">구독 & 결제</p>
              {isPro ? (
                <span className="px-1.5 py-0.5 bg-[#6366F1]/15 text-indigo-400 text-[10px] font-bold rounded border border-[#6366F1]/20">
                  Standard
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-[var(--d-border)] text-[var(--d-m)] text-[10px] font-bold rounded border border-[var(--d-border)]">
                  Free
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--d-m)]">플랜 확인 및 업그레이드</p>
          </div>
          <svg className="w-4 h-4 text-[var(--d-f)] group-hover:text-[#6366F1] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ── 고객 지원 & 약관 ── */}
      <div>
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-[var(--d-f)]">고객 지원 & 약관</p>
        <div className="rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] divide-y divide-[var(--d-border)] overflow-hidden">
          <a
            href="mailto:support@delocopilot.com"
            className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#6366F1]/5"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-[var(--d-m)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-[var(--d-h)]">문의하기</p>
                <p className="text-xs text-[var(--d-f)]">support@delocopilot.com</p>
              </div>
            </div>
            <svg className="w-3.5 h-3.5 text-[var(--d-f)] group-hover:text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <Link
            href="/terms"
            className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#6366F1]/5"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-[var(--d-m)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-[var(--d-h)]">이용약관</p>
            </div>
            <svg className="w-3.5 h-3.5 text-[var(--d-f)] group-hover:text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/privacy"
            className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-[#6366F1]/5"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-[var(--d-m)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-sm text-[var(--d-h)]">개인정보처리방침</p>
            </div>
            <svg className="w-3.5 h-3.5 text-[var(--d-f)] group-hover:text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
