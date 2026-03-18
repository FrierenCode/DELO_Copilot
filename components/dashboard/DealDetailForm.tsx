"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatKRW, formatDate, toDatetimeLocal, fromDatetimeLocal } from "@/lib/dashboard-helpers";
import type { Deal, DealCheck, DealStatusLog, ReplyDraftRecord, DealStatus } from "@/types/deal";

const STATUSES: DealStatus[] = [
  "Lead",
  "Replied",
  "Negotiating",
  "Confirmed",
  "Delivered",
  "Paid",
  "ClosedLost",
];

const TONE_LABEL: Record<ReplyDraftRecord["tone"], string> = {
  polite: "정중한 답장",
  quick: "빠른 확인",
  negotiation: "협상 제안",
};

const TONE_ORDER: ReplyDraftRecord["tone"][] = ["polite", "quick", "negotiation"];

const STATUS_SELECT_COLOR: Record<DealStatus, string> = {
  Lead:        "bg-slate-600/20 text-slate-300 border-slate-600/40",
  Replied:     "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Negotiating: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  Confirmed:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  Delivered:   "bg-teal-500/20 text-teal-400 border-teal-500/40",
  Paid:        "bg-emerald-600/20 text-emerald-500 border-emerald-600/40",
  ClosedLost:  "bg-gray-600/20 text-gray-400 border-gray-600/40",
};

const STATUS_DOT_COLOR: Record<DealStatus, string> = {
  Lead:        "bg-slate-600",
  Replied:     "bg-blue-500",
  Negotiating: "bg-amber-500",
  Confirmed:   "bg-emerald-500",
  Delivered:   "bg-teal-500",
  Paid:        "bg-emerald-600",
  ClosedLost:  "bg-gray-600",
};

const CHECK_BADGE: Record<DealCheck["severity"], { label: string; className: string }> = {
  LOW:    { label: "CONFIRM", className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  MEDIUM: { label: "WARNING", className: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  HIGH:   { label: "DANGER",  className: "bg-rose-500/10 text-rose-400 border border-rose-500/20" },
};

type Props = {
  deal: Deal;
  checks: DealCheck[];
  drafts: ReplyDraftRecord[];
  statusLogs: DealStatusLog[];
};

export function DealDetailForm({ deal, checks, drafts, statusLogs }: Props) {
  const router = useRouter();

  const [status, setStatus] = useState<DealStatus>(deal.status);
  const [nextAction, setNextAction] = useState(deal.next_action ?? "");
  const [nextActionDueAt, setNextActionDueAt] = useState(
    toDatetimeLocal(deal.next_action_due_at),
  );
  const [deadline, setDeadline] = useState(toDatetimeLocal(deal.deadline));
  const [paymentDueDate, setPaymentDueDate] = useState(toDatetimeLocal(deal.payment_due_date));
  const [followupNeeded, setFollowupNeeded] = useState(deal.followup_needed);
  const [notes, setNotes] = useState(deal.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Draft tabs
  const sortedDrafts = TONE_ORDER
    .map((t) => drafts.find((d) => d.tone === t))
    .filter(Boolean) as ReplyDraftRecord[];
  const [activeDraftIdx, setActiveDraftIdx] = useState(0);
  const activeDraft = sortedDrafts[activeDraftIdx];
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!activeDraft) return;
    await navigator.clipboard.writeText(activeDraft.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // Build payload with only changed fields
    const payload: Record<string, unknown> = {};
    if (status !== deal.status) payload.status = status;
    if (nextAction !== (deal.next_action ?? "")) payload.next_action = nextAction;
    const origDueAt = toDatetimeLocal(deal.next_action_due_at);
    if (nextActionDueAt !== origDueAt) {
      const converted = fromDatetimeLocal(nextActionDueAt);
      if (converted) payload.next_action_due_at = converted;
    }
    const origDeadline = toDatetimeLocal(deal.deadline);
    if (deadline !== origDeadline) {
      const converted = fromDatetimeLocal(deadline);
      if (converted) payload.deadline = converted;
    }
    const origPayment = toDatetimeLocal(deal.payment_due_date);
    if (paymentDueDate !== origPayment) {
      const converted = fromDatetimeLocal(paymentDueDate);
      if (converted) payload.payment_due_date = converted;
    }
    if (followupNeeded !== deal.followup_needed) payload.followup_needed = followupNeeded;
    if (notes !== (deal.notes ?? "")) payload.notes = notes;

    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      if (!json.success) {
        setSaveError(json.error?.message ?? "저장에 실패했습니다.");
        // Roll back status select if transition was rejected
        if (json.error?.code === "INVALID_STATUS_TRANSITION") {
          setStatus(deal.status);
        }
        return;
      }

      setSaveSuccess(true);
      // Refresh server component to get updated data
      router.refresh();
    } catch {
      setSaveError("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const monogram = deal.brand_name.slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Save feedback banners */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
          </svg>
          저장되었습니다.
        </div>
      )}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
          </svg>
          {saveError}
        </div>
      )}

      {/* Header card */}
      <div className="flex items-center justify-between bg-[#13131A] border border-[#1E1E2E] p-6 rounded-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#0A0A0F] border border-[#1E1E2E] rounded-full flex items-center justify-center text-2xl font-black text-indigo-400 shrink-0">
            {monogram}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">{deal.brand_name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {deal.contact_channel}
              {deal.platform_requested ? ` · ${deal.platform_requested}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DealStatus)}
            className={`appearance-none pl-4 pr-8 py-2 rounded-lg border font-semibold text-xs tracking-wide focus:outline-none cursor-pointer ${STATUS_SELECT_COLOR[status]}`}
            style={{ background: "transparent" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#13131A] text-slate-100">
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* 2-column content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column — 딜 정보 / 체크리스트 / 답장 초안 */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* 견적 카드 */}
          <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
            <h2 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              딜 정보 (견적 제안)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Floor */}
              <div className="bg-[#0A0A0F] border border-[#1E1E2E] p-4 rounded-xl flex flex-col justify-between hover:border-slate-600 transition-colors">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Floor</span>
                <p className="text-lg font-bold mt-2 text-slate-100">{formatKRW(deal.quote_floor)}</p>
              </div>
              {/* Target — recommended */}
              <div className="bg-indigo-500/5 border-2 border-indigo-500 p-4 rounded-xl relative flex flex-col justify-between">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-[10px] text-white font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  추천
                </span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">Target</span>
                <p className="text-lg font-bold mt-2 text-slate-100">{formatKRW(deal.quote_target)}</p>
              </div>
              {/* Premium */}
              <div className="bg-[#0A0A0F] border border-[#1E1E2E] p-4 rounded-xl flex flex-col justify-between hover:border-slate-600 transition-colors">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Premium</span>
                <p className="text-lg font-bold mt-2 text-slate-100">{formatKRW(deal.quote_premium)}</p>
              </div>
            </div>
          </section>

          {/* 계약 체크리스트 */}
          {checks.length > 0 && (
            <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
              <h2 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
                계약 체크리스트
              </h2>
              <div className="space-y-2">
                {checks.map((check) => {
                  const badge = CHECK_BADGE[check.severity];
                  return (
                    <div
                      key={check.id}
                      className="flex items-center justify-between p-3 bg-[#0A0A0F] rounded-lg border border-[#1E1E2E]"
                    >
                      <span className="text-sm font-medium text-slate-300">{check.message}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ml-3 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 답장 초안 탭 */}
          {sortedDrafts.length > 0 && (
            <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl overflow-hidden">
              <div className="bg-[#0A0A0F] border-b border-[#1E1E2E] flex">
                {sortedDrafts.map((draft, idx) => (
                  <button
                    key={draft.id}
                    type="button"
                    onClick={() => setActiveDraftIdx(idx)}
                    className={[
                      "px-5 py-3 text-xs font-bold transition-colors",
                      idx === activeDraftIdx
                        ? "text-indigo-400 border-b-2 border-indigo-500"
                        : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent",
                    ].join(" ")}
                  >
                    {TONE_LABEL[draft.tone]}
                  </button>
                ))}
              </div>
              <div className="p-4 space-y-4">
                <textarea
                  readOnly
                  value={activeDraft?.body ?? ""}
                  rows={8}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed text-slate-300 resize-none outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-[#1E1E2E] text-slate-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    {copied ? "복사됨!" : "복사"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right column — 딜 관리 폼 / 상태 로그 */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* 딜 관리 */}
          <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
            <h2 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">딜 관리</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">현재 상태</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DealStatus)}
                    className="w-full h-10 rounded-lg px-3 bg-[#13131A] border border-[#1E1E2E] text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">다음 액션</label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    maxLength={500}
                    placeholder="다음 액션 입력..."
                    className="w-full h-10 rounded-lg px-3 bg-[#13131A] border border-[#1E1E2E] text-slate-100 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">액션 마감일</label>
                  <input
                    type="datetime-local"
                    value={nextActionDueAt}
                    onChange={(e) => setNextActionDueAt(e.target.value)}
                    className="w-full h-10 rounded-lg px-3 bg-[#13131A] border border-[#1E1E2E] text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">콘텐츠 마감일</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-10 rounded-lg px-3 bg-[#13131A] border border-[#1E1E2E] text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">정산 마감일</label>
                <input
                  type="datetime-local"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 bg-[#13131A] border border-[#1E1E2E] text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-[#1E1E2E]">
                <span className="text-xs font-bold text-slate-400">후속 알림 (Follow-up)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followupNeeded}
                    onChange={(e) => setFollowupNeeded(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">노트</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="중요한 특이사항을 기록하세요."
                  className="w-full rounded-lg p-3 bg-[#13131A] border border-[#1E1E2E] text-slate-100 text-xs leading-relaxed focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>
          </section>

          {/* 상태 로그 타임라인 */}
          {statusLogs.length > 0 && (
            <section className="bg-[#13131A] border border-[#1E1E2E] rounded-xl p-6">
              <h2 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">상태 로그</h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[7px] before:w-[1px] before:bg-[#1E1E2E]">
                {statusLogs.map((log) => (
                  <div key={log.id} className="relative pl-7">
                    <div
                      className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-[#13131A] ${STATUS_DOT_COLOR[log.to_status] ?? "bg-slate-600"}`}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-100">
                        {log.to_status}
                        <span className="text-slate-500 font-normal ml-2">{formatDate(log.created_at)}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {log.from_status} → {log.to_status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          ← 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
