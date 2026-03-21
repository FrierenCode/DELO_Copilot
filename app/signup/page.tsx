"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleSignup() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMessage("Google 로그인 중 오류가 발생했습니다");
      setGoogleLoading(false);
    }
  }

  async function handleDiscordSignup() {
    if (discordLoading) return;
    setDiscordLoading(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "email identify",
      },
    });
    if (error) {
      setErrorMessage("Discord 로그인 중 오류가 발생했습니다");
      setDiscordLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    if (password.length < 10) {
      setErrorMessage("비밀번호는 최소 10자 이상이어야 합니다");
      setStatus("error");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorMessage("비밀번호에 소문자를 포함해야 합니다");
      setStatus("error");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage("비밀번호에 대문자를 포함해야 합니다");
      setStatus("error");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage("비밀번호에 숫자를 포함해야 합니다");
      setStatus("error");
      return;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      setErrorMessage("비밀번호에 특수문자를 포함해야 합니다");
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        setErrorMessage("이미 가입된 이메일입니다. 로그인해주세요");
      } else {
        setErrorMessage("회원가입 중 오류가 발생했습니다");
      }
      setStatus("error");
      return;
    }

    // Supabase는 이메일 열거 방지를 위해 이미 존재하는 이메일도 성공처럼 응답함
    // identities가 빈 배열이면 이미 가입된 계정
    if (data.user && data.user.identities?.length === 0) {
      setErrorMessage("이미 가입된 이메일입니다. 로그인해주세요");
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  async function handleResend() {
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
  }

  if (status === "success") {
    return (
      <div className="login-page min-h-screen bg-[var(--login-bg-solid)] text-[var(--login-text)] transition-colors">
        <header className="fixed left-0 top-0 z-10 w-full p-8">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <Image src="/fox-icon.svg" width={28} height={28} alt="DELO 로고" priority />
            <span className="text-xl font-bold tracking-tight">DELO</span>
          </Link>
        </header>

        <main className="flex min-h-screen items-center justify-center bg-[var(--login-background)] p-6">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="glow-sm overflow-hidden rounded-2xl border border-[var(--login-border)] bg-[var(--login-surface)] shadow-2xl text-center">
              <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent" />
              <div className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--login-accent-soft)] text-[var(--login-accent)] mx-auto">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h1 className="mb-3 text-2xl font-bold text-[var(--login-heading)]">
                  이메일을 확인해 주세요
                </h1>
                <p className="mb-2 text-sm leading-relaxed text-[var(--login-muted)]">
                  가입을 완료하려면 이메일을 확인해주세요.
                </p>
                <p className="mb-8 text-sm leading-relaxed text-[var(--login-muted)]">
                  <span className="font-medium italic text-[var(--login-accent)]">{email}</span>
                  <br />
                  로 인증 링크를 보냈습니다.
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm font-medium text-[var(--login-muted)] transition-colors hover:text-[var(--login-accent)]"
                >
                  인증 메일 다시 보내기
                </button>
                <p className="mt-6 text-sm text-[var(--login-muted)]">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="font-medium text-[var(--login-accent)] transition-colors hover:brightness-110">
                    로그인
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login-page min-h-screen bg-[var(--login-bg-solid)] text-[var(--login-text)] transition-colors">
      <header className="fixed left-0 top-0 z-10 w-full p-8">
        <Link href="/" className="flex w-fit items-center gap-2.5">
          <Image src="/fox-icon.svg" width={28} height={28} alt="DELO 로고" priority />
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
          <div className="glow-sm overflow-hidden rounded-2xl border border-[var(--login-border)] bg-[var(--login-surface)] shadow-2xl transition-colors">
            <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent" />
            <div className="p-8">
              {/* Header */}
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--login-accent-soft)] text-[var(--login-accent)]">
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L4.09 12.26c-.4.48-.6.72-.6.99 0 .22.08.43.24.58.16.15.37.17.6.17H12l-1 8.74 8.91-10.26c.4-.48.6-.72.6-.99 0-.22-.08-.43-.24-.58-.16-.15-.37-.17-.6-.17H12l1-8.74z" />
                  </svg>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-[var(--login-heading)]">회원가입</h1>
                <p className="text-sm text-[var(--login-muted)]">
                  DELO 계정을 만드세요
                </p>
              </div>

              {/* Primary — Social Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={googleLoading || discordLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--login-border)] bg-[var(--login-surface)] py-3.5 text-[var(--login-heading)] shadow-sm transition-all hover:border-[var(--login-accent)]/40 hover:bg-[var(--login-accent)]/5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {googleLoading ? (
                    <svg className="h-5 w-5 animate-spin text-[var(--login-accent)]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span className="font-semibold">Google로 시작하기</span>
                </button>

                <button
                  type="button"
                  onClick={handleDiscordSignup}
                  disabled={googleLoading || discordLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--login-border)] bg-[var(--login-surface)] py-3.5 text-[var(--login-heading)] shadow-sm transition-all hover:border-[#5865F2]/40 hover:bg-[#5865F2]/5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {discordLoading ? (
                    <svg className="h-5 w-5 animate-spin" style={{ color: "#5865F2" }} viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  )}
                  <span className="font-semibold">Discord로 시작하기</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--login-border)]" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="relative bg-[var(--login-surface)] px-4 text-xs font-medium text-[var(--login-muted)] transition-colors hover:text-[var(--login-accent)]"
                >
                  이메일로 가입하기 {showEmailForm ? "↑" : "↓"}
                </button>
              </div>

              {/* Secondary — Email/Password (collapsible) */}
              {showEmailForm && (
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
                      onChange={(e) => setEmail(e.target.value)}
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
                      비밀번호 (최소 10자, 대·소문자·숫자·특수문자 포함)
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="ml-1 text-xs font-semibold uppercase tracking-wider text-[var(--login-muted)]"
                    >
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={status === "loading"}
                        className="w-full rounded-xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 pr-12 text-[var(--login-heading)] placeholder:text-[var(--login-placeholder)] transition-all focus:border-[var(--login-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--login-accent)]/30 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--login-muted)] transition-colors hover:text-[var(--login-heading)]"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
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

                  {(status === "error" || errorMessage) && (
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
                        가입 중...
                      </span>
                    ) : (
                      "이메일로 가입하기"
                    )}
                  </button>
                </form>
              )}

              {/* Google error shown outside form */}
              {!showEmailForm && errorMessage && (
                <p className="mt-2 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                  {errorMessage}
                </p>
              )}

              <p className="mt-6 text-center text-sm text-[var(--login-muted)]">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="font-medium text-[var(--login-accent)] transition-colors hover:brightness-110">
                  로그인
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
          </div>
        </div>
      </main>

      <footer className="p-8 text-center">
        <p className="text-xs text-[var(--login-footer)]">© 2025 DELO Copilot. All rights reserved.</p>
      </footer>
    </div>
  );
}
