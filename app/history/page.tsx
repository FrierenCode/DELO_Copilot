"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";
import type { InquirySummary } from "@/types/parse-api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatKRW(amount: number | null) {
  if (amount === null) return "—";
  return amount.toLocaleString("ko-KR") + " ₩";
}

function truncate(text: string, max = 48) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function HistoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<InquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/inquiries")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setRows(json.data as InquirySummary[]);
        } else {
          setError(json.error?.message ?? "Failed to load history.");
        }
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">History</h1>
        <p className="mt-1 text-sm text-neutral-500">Your recent deal inquiries.</p>
      </div>

      {loading && <Loader label="Loading history…" />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-neutral-500">
            No inquiries yet. Go to{" "}
            <a href="/" className="underline hover:text-neutral-800">
              Home
            </a>{" "}
            and analyze a deal.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Platform</th>
                <th className="hidden px-4 py-3 sm:table-cell">Deliverables</th>
                <th className="px-4 py-3 text-right">Suggested price</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/deal/${row.id}`)}
                  className={`cursor-pointer border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {truncate(row.brand, 28)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{row.platform}</td>
                  <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">
                    {truncate(row.deliverables, 40)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {formatKRW(row.suggested_price)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-neutral-500 sm:table-cell">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
