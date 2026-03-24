import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SettingsNicknamePanel } from "@/components/settings/SettingsNicknamePanel";
import { SettingsPasswordPanel } from "@/components/settings/SettingsPasswordPanel";
import { SettingsDangerZonePanel } from "@/components/settings/SettingsDangerZonePanel";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const hasPasswordIdentity = user.identities?.some((id) => id.provider === "email") ?? false;

  const joinedLabel = user.created_at
    ? new Date(user.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--d-m)] transition-colors hover:text-[var(--d-h)] mb-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          설정으로 돌아가기
        </Link>
        <h1 className="text-xl font-black text-[var(--d-h)]">내 정보</h1>
        <p className="mt-0.5 text-sm text-[var(--d-m)]">계정 정보를 확인하고 수정합니다.</p>
      </div>

      {/* 계정 정보 (read-only) */}
      <section className="rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-4">
        <h2 className="mb-3 text-sm font-bold text-[var(--d-h)]">계정 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-f)]">이메일</label>
            <p className="text-sm text-[var(--d-m)]">{user.email}</p>
            <p className="text-[11px] text-[var(--d-f)]">변경은 고객 지원으로 문의해주세요.</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--d-f)]">가입일</label>
            <p className="text-sm text-[var(--d-b)]">{joinedLabel ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* 닉네임 변경 */}
      <SettingsNicknamePanel
        currentNickname={(user.user_metadata?.full_name as string | undefined) ?? ""}
      />

      {/* 비밀번호 변경 (이메일 가입자만) */}
      {hasPasswordIdentity && <SettingsPasswordPanel />}

      {/* 위험 구역 */}
      <SettingsDangerZonePanel email={user.email ?? ""} />
    </div>
  );
}
