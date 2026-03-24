"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";

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
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--d-h)]">
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
          className="w-full rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] px-4 py-3 pr-12 text-sm text-[var(--d-h)] placeholder:text-[var(--d-m)] transition-all focus:border-[var(--d-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--d-accent)]/25 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--d-m)] transition-colors hover:text-[var(--d-h)]"
          tabIndex={-1}
        >
          {show ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function SettingsPasswordPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    if (newPassword.length < 10) {
      setErrorMessage("새 비밀번호는 최소 10자 이상이어야 합니다");
      setStatus("error");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setErrorMessage("새 비밀번호에 소문자를 포함해야 합니다");
      setStatus("error");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMessage("새 비밀번호에 대문자를 포함해야 합니다");
      setStatus("error");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setErrorMessage("새 비밀번호에 숫자를 포함해야 합니다");
      setStatus("error");
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      setErrorMessage("새 비밀번호에 특수문자를 포함해야 합니다");
      setStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("새 비밀번호가 일치하지 않습니다");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();

    // Re-authenticate with current password first
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (!email) {
      setErrorMessage("사용자 정보를 가져올 수 없습니다");
      setStatus("error");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError) {
      setErrorMessage("현재 비밀번호가 올바르지 않습니다");
      setStatus("error");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setErrorMessage("비밀번호 변경에 실패했습니다. 다시 시도해주세요");
      setStatus("error");
      return;
    }

    setStatus("success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <section className="rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-4">
      <h2 className="mb-1 text-sm font-bold text-[var(--d-h)]">비밀번호 변경</h2>
      <p className="mb-3 text-xs text-[var(--d-m)]">현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <PasswordInput
          id="currentPassword"
          label="현재 비밀번호"
          value={currentPassword}
          onChange={setCurrentPassword}
          disabled={status === "loading"}
          autoComplete="current-password"
        />
        <PasswordInput
          id="newPassword"
          label="새 비밀번호 (최소 10자, 대·소문자·숫자·특수문자 포함)"
          value={newPassword}
          onChange={setNewPassword}
          disabled={status === "loading"}
          autoComplete="new-password"
        />
        <PasswordInput
          id="confirmNewPassword"
          label="새 비밀번호 확인"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={status === "loading"}
          autoComplete="new-password"
        />

        {status === "success" && (
          <p className="rounded-xl border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
            비밀번호가 성공적으로 변경되었습니다.
          </p>
        )}

        {(status === "error" || errorMessage) && (
          <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-[var(--d-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                변경 중...
              </span>
            ) : (
              "비밀번호 변경"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
