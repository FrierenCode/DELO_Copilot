"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
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
  const [notes, setNotes] = useState(deal.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Header: brand name + status select + save */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-neutral-900">{deal.brand_name}</h1>
          <p className="text-xs text-neutral-500">
            {deal.contact_channel} · {deal.platform_requested}
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DealStatus)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>

      {/* Save feedback */}
      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          저장되었습니다.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quote summary */}
        <Card title="견적">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {formatKRW(deal.quote_target)}
            </span>
            <span className="text-xs text-neutral-500">권장 단가</span>
          </div>
          <div className="space-y-1 text-xs text-neutral-500">
            <div>Floor: {formatKRW(deal.quote_floor)}</div>
            <div>Premium: {formatKRW(deal.quote_premium)}</div>
          </div>
        </Card>

        {/* Editable schedule fields */}
        <Card title="액션 & 일정">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">다음 액션</span>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                maxLength={500}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">액션 기한</span>
              <input
                type="datetime-local"
                value={nextActionDueAt}
                onChange={(e) => setNextActionDueAt(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">납품 마감</span>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">결제 기한</span>
              <input
                type="datetime-local"
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </label>
          </div>
        </Card>

        {/* Checks */}
        {checks.length > 0 && (
          <Card title="확인 필요 항목">
            <div className="flex flex-col gap-2">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className={[
                    "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                    check.severity === "HIGH"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : check.severity === "MEDIUM"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-neutral-200 bg-neutral-50 text-neutral-600",
                  ].join(" ")}
                >
                  <span className="mt-0.5 shrink-0 text-xs font-bold">
                    {check.severity === "HIGH"
                      ? "긴급"
                      : check.severity === "MEDIUM"
                        ? "권장"
                        : "참고"}
                  </span>
                  <p>{check.message}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reply drafts */}
        {drafts.length > 0 && (
          <Card title="답장 초안">
            <div className="flex flex-col gap-4">
              {drafts.map((draft) => (
                <div key={draft.id}>
                  <p className="mb-1 text-xs font-medium capitalize text-neutral-500">
                    {draft.tone}
                  </p>
                  <pre className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 font-sans text-xs text-neutral-700">
                    {draft.body}
                  </pre>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Notes */}
      <Card title="노트">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="딜 관련 메모를 입력하세요..."
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </Card>

      {/* Status change history */}
      {statusLogs.length > 0 && (
        <Card title="상태 변경 이력">
          <div className="flex flex-col gap-2">
            {statusLogs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>{formatDate(log.created_at)}</span>
                <StatusBadge status={log.from_status} />
                <span>→</span>
                <StatusBadge status={log.to_status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <div>
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
