"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  email: string;
};

export function SettingsDangerZonePanel({ email }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
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

  return (
    <>
      <section className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.03]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--d-b)]">회원 탈퇴</p>
              <p className="mt-0.5 text-xs text-[var(--d-f)]">
                계정과 모든 데이터가 영구적으로 삭제됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setShowModal(true); setConfirmInput(""); setDeleteError(null); }}
              className="shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setShowModal(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-[var(--d-surface)] shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            <div className="p-6">
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

              <ul className="mb-5 space-y-2 rounded-xl border border-red-500/15 bg-red-500/5 p-4">
                {[
                  "모든 딜 데이터와 분석 히스토리가 삭제됩니다",
                  "크리에이터 프로필 정보가 삭제됩니다",
                  "Standard 구독이 있다면 즉시 해지됩니다",
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

              <div className="mb-5 space-y-2">
                <label className="text-xs font-bold text-[var(--d-m)]">
                  확인을 위해 이메일 주소를 입력하세요
                </label>
                <p className="rounded-lg bg-[var(--d-surface2)] px-3 py-2 text-xs font-mono text-[var(--d-m)] border border-[var(--d-border)]">
                  {email}
                </p>
                <input
                  type="email"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-[var(--d-border)] py-2.5 text-sm font-medium text-[var(--d-m)] transition-all hover:bg-white/5 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting || confirmInput !== email}
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
    </>
  );
}
