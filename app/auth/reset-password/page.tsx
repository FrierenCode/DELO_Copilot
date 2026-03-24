"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stage = "verifying" | "form" | "success" | "error";
type Status = "idle" | "loading" | "error";

function PasswordInput({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="ml-1 text-xs font-semibold uppercase tracking-wider text-[var(--login-muted)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          disabled={disabled}
          className="w-full rounded-xl border border-[var(--login-input-border)] bg-[var(--login-input-bg)] px-4 py-3.5 pr-12 text-[var(--login-heading)] placeholder:text-[var(--login-placeholder)] transition-all focus:border-[var(--login-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--login-accent)]/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--login-muted)] transition-colors hover:text-[var(--login-heading)]"
          tabIndex={-1}
        >
          {show ? (
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
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!code && !token_hash) {
      setStage("error");
      return;
    }

    const supabase = createClient();

    async function verify() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code!);
        if (error) {
          setStage("error");
          return;
        }
      } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token_hash!,
          type: type as "recovery",
        });
        if (error) {
          setStage("error");
          return;
        }
      }
      setStage("form");
    }

    verify();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage("비밀번호 변경에 실패했습니다. 다시 시도해주세요");
      setStatus("error");
      return;
    }

    setStage("success");
  }

  const shell = (content: React.ReactNode) => (
    <div className="login-page min-h-screen bg-[var(--login-bg-solid)] text-[var(--login-text)] transition-colors">
      <header className="fixed left-0 top-0 z-10 w-full p-8">
        <Link href="/" className="flex w-fit items-center gap-2.5">
          <Image src="/fox-icon.svg" width={28} height={28} alt="DELO 로고" priority />
          <span className="text-xl font-bold tracking-tight">DELO</span>
        </Link>
      </header>
      <main className="relative flex min-h-screen items-center justify-center bg-[var(--login-background)] p-6 pt-28 transition-colors">
        <div className="pointer-events-none absolute inset-0 overflow-hidden dark-only-glow">
          <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#6366F1]/6 blur-[100px]" />
        </div>
        <div className="relative w-full max-w-[420px]">
          <div className="glow-sm overflow-hidden rounded-2xl border border-[var(--login-border)] bg-[var(--login-surface)] shadow-2xl transition-colors">
            <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent" />
            <div className="p-8">{content}</div>
          </div>
        </div>
      </main>
      <footer className="p-8 text-center">
        <p className="text-xs text-[var(--login-footer)]">© 2026 DELO. All rights reserved.</p>
      </footer>
    </div>
  );

  if (stage === "verifying") {
    return shell(
      <div className="flex flex-col items-center gap-4 py-4">
        <svg className="h-8 w-8 animate-spin text-[var(--login-accent)]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-[var(--login-muted)]">인증 중...</p>
      </div>
    );
  }

  if (stage === "error") {
    return shell(
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/40 text-red-400">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h1 className="mb-2 text-xl font-bold text-[var(--login-heading)]">링크가 만료되었습니다</h1>
          <p className="text-sm text-[var(--login-muted)]">비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.</p>
        </div>
        <Link href="/login" className="btn-gradient w-full rounded-full py-3.5 text-center font-bold text-white">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  if (stage === "success") {
    return shell(
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--login-accent-soft)] text-[var(--login-accent)]">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <h1 className="mb-2 text-xl font-bold text-[var(--login-heading)]">비밀번호가 변경되었습니다</h1>
          <p className="text-sm text-[var(--login-muted)]">새 비밀번호로 로그인해주세요.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="btn-gradient w-full rounded-full py-3.5 font-bold text-white"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  // stage === "form"
  return shell(
    <>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--login-accent-soft)] text-[var(--login-accent)]">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--login-heading)]">새 비밀번호 설정</h1>
        <p className="text-sm text-[var(--login-muted)]">새로운 비밀번호를 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          id="password"
          label="새 비밀번호 (최소 10자, 대·소문자·숫자·특수문자 포함)"
          value={password}
          onChange={setPassword}
          disabled={status === "loading"}
          autoComplete="new-password"
        />
        <PasswordInput
          id="confirmPassword"
          label="비밀번호 확인"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={status === "loading"}
          autoComplete="new-password"
        />

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
              변경 중...
            </span>
          ) : (
            "비밀번호 변경하기"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
