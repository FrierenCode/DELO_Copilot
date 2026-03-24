"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";
type CheckStatus = "idle" | "checking" | "available" | "taken";

type Props = {
  currentNickname: string;
};

export function SettingsNicknamePanel({ currentNickname }: Props) {
  const [nickname, setNickname] = useState(currentNickname);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = nickname.trim();
    if (trimmed === currentNickname || trimmed.length < 2 || trimmed.length > 20) {
      setCheckStatus("idle");
      return;
    }

    setCheckStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/account/check-nickname?nickname=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        setCheckStatus(json.success ? (json.data.available ? "available" : "taken") : "idle");
      } catch {
        setCheckStatus("idle");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nickname, currentNickname]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || checkStatus === "taken" || checkStatus === "checking") return;

    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setErrorMessage("닉네임은 최소 2자 이상이어야 합니다");
      setStatus("error");
      return;
    }
    if (trimmed.length > 20) {
      setErrorMessage("닉네임은 최대 20자까지 입력할 수 있습니다");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });

    if (error) {
      setErrorMessage("닉네임 변경에 실패했습니다. 다시 시도해주세요");
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  const isUnchanged = nickname.trim() === currentNickname;
  const canSubmit =
    !isUnchanged &&
    checkStatus !== "taken" &&
    checkStatus !== "checking" &&
    status !== "loading";

  return (
    <section className="rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-4">
      <h2 className="mb-1 text-sm font-bold text-[var(--d-h)]">닉네임 변경</h2>
      <p className="mb-3 text-xs text-[var(--d-m)]">대시보드에 표시되는 이름을 변경합니다.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="settings-nickname" className="text-sm font-medium text-[var(--d-h)]">
            닉네임 (2~20자)
          </label>
          <div className="relative">
            <input
              id="settings-nickname"
              type="text"
              required
              maxLength={20}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setStatus("idle");
                setErrorMessage("");
              }}
              placeholder="DELO에서 사용할 이름"
              disabled={status === "loading"}
              className="w-full rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] px-4 py-3 pr-10 text-sm text-[var(--d-h)] placeholder:text-[var(--d-m)] transition-all focus:border-[var(--d-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--d-accent)]/25 disabled:opacity-50"
            />
            {!isUnchanged && nickname.trim().length >= 2 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkStatus === "checking" && (
                  <svg className="h-4 w-4 animate-spin text-[var(--d-m)]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {checkStatus === "available" && (
                  <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {checkStatus === "taken" && (
                  <svg className="h-4 w-4 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {checkStatus === "available" && !isUnchanged && (
            <p className="text-[11px] text-emerald-400">사용 가능한 닉네임입니다.</p>
          )}
          {checkStatus === "taken" && (
            <p className="text-[11px] text-rose-400">이미 사용 중인 닉네임입니다.</p>
          )}
        </div>

        {status === "success" && (
          <p className="rounded-xl border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
            닉네임이 성공적으로 변경되었습니다.
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
            disabled={!canSubmit}
            className="rounded-full bg-[var(--d-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                저장 중...
              </span>
            ) : (
              "닉네임 변경"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
