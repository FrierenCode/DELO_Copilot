"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "sent" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle" && status !== "error") return;

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const redirectTo = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  function handleReset() {
    setStatus("idle");
    setErrorMessage("");
  }

  const isSuccess = status === "sent";

  return (
    <div className="login-page min-h-screen text-[var(--login-text)] transition-colors">
      <header className="fixed left-0 top-0 z-10 w-full p-8">
        <Link href="/" className="flex w-fit items-center gap-2">
          <div className="text-[var(--login-accent)]">
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">DELO</span>
        </Link>
      </header>

      <main className="flex min-h-screen items-center justify-center bg-[var(--login-background)] p-6 pt-28 transition-colors">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[420px]">
            <div
              className={[
                "rounded-2xl border border-[var(--login-border)] bg-[var(--login-surface)] p-8 shadow-2xl transition-colors",
                isSuccess ? "motion-safe:animate-[loginSuccessCard_360ms_ease-out]" : "",
              ].join(" ")}
            >
              {isSuccess ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--login-accent-soft)] text-[var(--login-accent)]">
                    <svg
                      width="32"
                      height="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h1 className="mb-3 text-2xl font-bold text-[var(--login-heading)]">
                    이메일을 확인해 주세요
                  </h1>
                  <p className="mb-8 text-sm leading-relaxed text-[var(--login-muted)]">
                    <span className="font-medium italic text-[var(--login-accent)]">{email}</span>
                    <br />
                    로그인 링크를 전송했습니다. 받은 편지함이나 스팸함을 확인해 주세요.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--login-muted)] transition-colors hover:text-[var(--login-accent)]"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 12H5m7-7-7 7 7 7" />
                    </svg>
                    다른 이메일로 다시 시도하기
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--login-accent-soft)] text-[var(--login-accent)]">
                      <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2L4.09 12.26c-.4.48-.6.72-.6.99 0 .22.08.43.24.58.16.15.37.17.6.17H12l-1 8.74 8.91-10.26c.4-.48.6-.72.6-.99 0-.22-.08-.43-.24-.58-.16-.15-.37-.17-.6-.17H12l1-8.74z" />
                      </svg>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-[var(--login-heading)]">로그인</h1>
                    <p className="text-sm text-[var(--login-muted)]">
                      이메일로 로그인 링크를 보내드립니다
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="ml-1 text-xs font-semibold uppercase tracking-wider text-[var(--login-muted)]"
                      >
                        이메일 주소
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        disabled={status === "loading"}
                        className="w-full rounded-xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 text-[var(--login-heading)] placeholder:text-[var(--login-placeholder)] transition-all focus:border-[var(--login-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--login-accent)]/30 disabled:opacity-50"
                      />
                    </div>

                    {status === "error" && (
                      <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                        {errorMessage || "로그인 링크 전송 중 오류가 발생했습니다. 다시 시도해 주세요."}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full rounded-full bg-[var(--login-accent)] py-3.5 font-bold text-white shadow-lg shadow-[var(--login-accent)]/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "loading" ? "전송 중..." : "로그인 링크 받기"}
                    </button>
                  </form>

                  <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--login-border)]" />
                    </div>
                    <span className="relative bg-[var(--login-surface)] px-4 text-xs font-medium text-[var(--login-muted)] transition-colors">
                      또는
                    </span>
                  </div>

                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--login-border)] bg-transparent py-3.5 text-[var(--login-heading)] transition-all hover:bg-[var(--login-hover)]"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-black text-[10px] font-bold text-white">
                      G
                    </span>
                    <span className="font-medium">Google로 계속하기</span>
                  </button>

                  <p className="mt-8 text-center text-[11px] leading-relaxed text-[var(--login-muted)]">
                    계속 진행하면{" "}
                    <Link href="/terms" className="underline transition-colors hover:text-[var(--login-heading)]">
                      이용약관
                    </Link>{" "}
                    및{" "}
                    <Link href="/privacy" className="underline transition-colors hover:text-[var(--login-heading)]">
                      개인정보처리방침
                    </Link>
                    에 동의하는 것으로 간주됩니다.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="mx-auto max-w-[520px]">
              {isSuccess ? (
                <div className="rounded-[28px] border border-[var(--login-preview-border)] bg-[var(--login-preview-bg)] p-8 backdrop-blur-sm motion-safe:animate-[loginPreviewCard_520ms_ease-out] transition-colors">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--login-accent)]">
                        Magic Link
                      </p>
                      <h2 className="mt-3 text-3xl font-bold text-[var(--login-heading)]">
                        링크를 보냈습니다
                      </h2>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--login-accent-soft)] text-[var(--login-accent)]">
                      <svg
                        width="26"
                        height="26"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" />
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                      </svg>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--login-border)] bg-[var(--login-panel)] p-6 transition-colors">
                    <p className="text-sm text-[var(--login-muted)]">전송 대상</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--login-heading)]">{email}</p>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--login-muted)]">
                      메일을 열고 로그인 링크를 누르면 바로 DELO로 돌아옵니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-[var(--login-preview-border)] bg-[var(--login-preview-bg)] p-8 backdrop-blur-sm transition-colors">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--login-accent)]">
                    Deal Workflow
                  </p>
                  <h2 className="mt-4 text-4xl font-bold leading-tight text-[var(--login-heading)]">
                    문의를
                    <br />
                    답변 가능한 상태까지
                    <br />
                    바로 정리합니다
                  </h2>
                  <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--login-muted)]">
                    로그인 후에는 문의 분석, 적정 견적, 응답 초안, 진행 히스토리를 한 흐름으로
                    이어서 관리할 수 있습니다.
                  </p>

                  <div className="mt-10 space-y-4">
                    <div className="rounded-2xl border border-[var(--login-border)] bg-[var(--login-panel)] p-5 transition-colors">
                      <p className="text-sm font-medium text-[var(--login-heading)]">1. 문의 분석</p>
                      <p className="mt-2 text-sm text-[var(--login-muted)]">
                        브랜드 요청의 핵심 조건과 빠진 항목을 자동으로 정리합니다.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--login-border)] bg-[var(--login-panel)] p-5 transition-colors">
                      <p className="text-sm font-medium text-[var(--login-heading)]">2. 견적과 리스크 확인</p>
                      <p className="mt-2 text-sm text-[var(--login-muted)]">
                        비용 범위와 계약상 주의 포인트를 한 번에 확인할 수 있습니다.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--login-border)] bg-[var(--login-panel)] p-5 transition-colors">
                      <p className="text-sm font-medium text-[var(--login-heading)]">3. 응답 초안 작성</p>
                      <p className="mt-2 text-sm text-[var(--login-muted)]">
                        상황에 맞는 회신 문구를 바로 생성해서 협상 속도를 높입니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center">
        <p className="text-xs text-[var(--login-footer)]">© 2025 DELO Copilot. All rights reserved.</p>
      </footer>

      <style jsx>{`
        @keyframes loginSuccessCard {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes loginPreviewCard {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
