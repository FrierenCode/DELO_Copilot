"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import type { ReplyDrafts } from "@/types/parse-api";

type ReplyTone = "polite" | "quick" | "negotiation";

type ReplyCardProps = {
  drafts: ReplyDrafts;
  inquiryId?: string;
};

type ReplyBlockProps = {
  label: string;
  tone: ReplyTone;
  text: string | null;
  inquiryId?: string;
  onSaved: (tone: ReplyTone, value: string) => void;
};

function ReplyBlock({ label, tone, text, inquiryId, onSaved }: ReplyBlockProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (text === null) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {label}
          </span>
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">Pro</span>
        </div>
        <p className="text-sm text-neutral-400">Upgrade to Pro to unlock this reply.</p>
      </div>
    );
  }

  async function handleSave() {
    if (!inquiryId) {
      onSaved(tone, draft);
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_drafts: { [tone]: draft } }),
      });
      const json = await res.json();
      if (!json.success) {
        setSaveError(json.error?.message ?? "Save failed.");
        return;
      }
      onSaved(tone, draft);
      setEditing(false);
    } catch {
      setSaveError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(text ?? "");
    setEditing(false);
    setSaveError(null);
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {!editing && <CopyButton text={text} />}
          <button
            type="button"
            onClick={() => {
              setDraft(text);
              setEditing((v) => !v);
              setSaveError(null);
            }}
            className="rounded-md border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            {editing ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
          {saveError && (
            <p className="text-xs text-red-600">{saveError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{text}</pre>
      )}
    </div>
  );
}

export function ReplyCard({ drafts: initialDrafts, inquiryId }: ReplyCardProps) {
  const [drafts, setDrafts] = useState(initialDrafts);

  function handleSaved(tone: ReplyTone, value: string) {
    setDrafts((prev) => ({ ...prev, [tone]: value }));
  }

  const blocks: { label: string; tone: ReplyTone; text: string | null }[] = [
    { label: "Polite reply", tone: "polite", text: drafts.polite },
    { label: "Quick reply", tone: "quick", text: drafts.quick },
    { label: "Negotiation reply", tone: "negotiation", text: drafts.negotiation },
  ];

  return (
    <Card title="Reply Drafts">
      <div className="flex flex-col gap-4">
        {blocks.map((b) => (
          <ReplyBlock
            key={b.tone}
            label={b.label}
            tone={b.tone}
            text={b.text}
            inquiryId={inquiryId}
            onSaved={handleSaved}
          />
        ))}
      </div>
    </Card>
  );
}
