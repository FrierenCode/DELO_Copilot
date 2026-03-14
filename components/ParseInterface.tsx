"use client";

import { useState } from "react";
import { InquiryInput } from "@/components/inquiry/InquiryInput";
import { ParseButton } from "@/components/inquiry/ParseButton";
import { InquiryCard } from "@/components/results/InquiryCard";
import { QuoteCard } from "@/components/results/QuoteCard";
import { ChecksCard } from "@/components/results/ChecksCard";
import { ReplyCard } from "@/components/results/ReplyCard";
import { Loader } from "@/components/ui/Loader";
import type { ParseApiResult } from "@/types/parse-api";

type SourceType = "email" | "dm" | "other";

export function ParseInterface() {
  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("other");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/inquiries/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: text, source_type: sourceType }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error?.message ?? "Parse failed.");
        return;
      }

      setResult(json.data as ParseApiResult);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <InquiryInput value={text} onChange={setText} disabled={loading} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Source type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              disabled={loading}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="email">Email</option>
              <option value="dm">DM</option>
              <option value="other">Other</option>
            </select>
          </div>

          <ParseButton
            onClick={handleParse}
            loading={loading}
            disabled={!text.trim()}
          />
        </div>
      </div>

      {loading && <Loader />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <InquiryCard data={result.parsed_json} missingFields={result.missing_fields} />
          <QuoteCard data={result.quote_breakdown} />
          <ChecksCard checks={result.checks} />
          <ReplyCard drafts={result.reply_drafts} inquiryId={result.inquiry_id} />
        </div>
      )}
    </div>
  );
}
