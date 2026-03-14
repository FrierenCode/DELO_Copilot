"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InquiryCard } from "@/components/results/InquiryCard";
import { QuoteCard } from "@/components/results/QuoteCard";
import { ChecksCard } from "@/components/results/ChecksCard";
import { ReplyCard } from "@/components/results/ReplyCard";
import { Loader } from "@/components/ui/Loader";
import type { ParseApiResult } from "@/types/parse-api";

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ParseApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/inquiries/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setData(json.data as ParseApiResult);
        } else {
          setError(json.error?.message ?? "Failed to load deal.");
        }
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← Back
        </button>
        {data && (
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {data.parsed_json.brand_name}
          </h1>
        )}
      </div>

      {loading && <Loader label="Loading deal…" />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          <InquiryCard data={data.parsed_json} missingFields={data.missing_fields} />
          <QuoteCard data={data.quote_breakdown} />
          <ChecksCard checks={data.checks} />
          <ReplyCard drafts={data.reply_drafts} inquiryId={data.inquiry_id} />
        </div>
      )}
    </div>
  );
}
