"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message === "Invalid login credentials") {
        setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다");
      } else if (error.message.includes("Email not confirmed")) {
        setErrorMessage("이메일 인증이 필요합니다. 받은 편지함을 확인해주세요");
      } else {
        setErrorMessage("로그인 중 오류가 발생했습니다");
      }
      setStatus("error");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="login-page min-h-screen bg-[var(--login-bg-solid)] text-[var(--login-text)] transition-colors">
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

      <main className="relative flex min-h-screen items-center justify-center bg-[var(--login-background)] p-6 pt-28 transition-colors">
        {/* Ambient glow — dark mode only */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden dark-only-glow">
          <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#6366F1]/6 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-indigo-900/8 blur-[80px]" />
        </div>
        <div className="relative w-full max-w-[420px]">
          <div className="w-full">
            <div className="glow-sm overflow-hidden rounded-2xl border border-[var(--login-border)] bg-[var(--login-surface)] shadow-2xl transition-colors">
              <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent" />
              <div className="p-8">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--login-accent-soft)] text-[var(--login-accent)]">
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L4.09 12.26c-.4.48-.6.72-.6.99 0 .22.08.43.24.58.16.15.37.17.6.17H12l-1 8.74 8.91-10.26c.4-.48.6-.72.6-.99 0-.22-.08-.43-.24-.58-.16-.15-.37-.17-.6-.17H12l1-8.74z" />
                  </svg>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-[var(--login-heading)]">로그인</h1>
                <p className="text-sm text-[var(--login-muted)]">
                  이메일과 비밀번호로 로그인하세요
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

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="ml-1 text-xs font-semibold uppercase tracking-wider text-[var(--login-muted)]"
                  >
                    비밀번호
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      disabled={status === "loading"}
                      className="w-full rounded-xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 pr-12 text-[var(--login-heading)] placeholder:text-[var(--login-placeholder)] transition-all focus:border-[var(--login-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--login-accent)]/30 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--login-muted)] transition-colors hover:text-[var(--login-heading)]"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {status === "error" && (
                  <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-gradient w-full rounded-full py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      로그인 중...
                    </span>
                  ) : (
                    "로그인"
                  )}
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
                className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--login-border)] bg-transparent py-3.5 text-[var(--login-heading)] transition-all hover:border-[var(--login-accent)]/30 hover:bg-[var(--login-accent)]/5"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-black text-[10px] font-bold text-white">
                  G
                </span>
                <span className="font-medium">Google로 계속하기</span>
              </button>

              <p className="mt-6 text-center text-sm text-[var(--login-muted)]">
                계정이 없으신가요?{" "}
                <Link href="/signup" className="font-medium text-[var(--login-accent)] transition-colors hover:brightness-110">
                  회원가입
                </Link>
              </p>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--login-muted)]">
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
            </div>
            </div>{/* closes glow-sm wrapper */}
          </div>
        </div>
      </main>

      <footer className="p-8 text-center">
        <p className="text-xs text-[var(--login-footer)]">© 2025 DELO Copilot. All rights reserved.</p>
      </footer>
    </div>
  );
}
