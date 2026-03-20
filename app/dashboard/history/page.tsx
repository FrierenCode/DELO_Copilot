"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { InquirySummary } from "@/types/parse-api";

/* ─── helpers ─── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatKRW(amount: number | null) {
  if (amount === null) return "—";
  return "₩" + amount.toLocaleString("ko-KR");
}

function monogram(brand: string) {
  const words = brand.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return brand.slice(0, 2).toUpperCase();
}

/* ─── source chip config ─── */
type SourceType = "전체" | "이메일" | "인스타 DM" | "유튜브" | "카카오";

const SOURCE_CHIPS: { id: SourceType; match?: string[] }[] = [
  { id: "전체" },
  { id: "이메일", match: ["이메일", "email"] },
  { id: "인스타 DM", match: ["인스타", "instagram", "dm"] },
  { id: "유튜브", match: ["유튜브", "youtube"] },
  { id: "카카오", match: ["카카오", "kakao"] },
];

const SOURCE_TAG: Record<string, string> = {
  "이메일":    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "인스타 DM": "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  "유튜브":    "bg-red-500/10 text-red-400 border border-red-500/20",
  "카카오":    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
};
const DEFAULT_TAG = "bg-slate-500/10 text-slate-400 border border-slate-500/20";

function classifySource(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("이메일") || p.includes("email")) return "이메일";
  if (p.includes("인스타") || p.includes("instagram") || p.includes("dm")) return "인스타 DM";
  if (p.includes("유튜브") || p.includes("youtube")) return "유튜브";
  if (p.includes("카카오") || p.includes("kakao")) return "카카오";
  return platform;
}

function matchesFilter(platform: string, filter: SourceType): boolean {
  if (filter === "전체") return true;
  return classifySource(platform) === filter;
}

/* ─── skeleton ─── */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800" />
          <div className="h-4 w-28 rounded bg-slate-800" />
        </div>
        <div className="h-3 w-16 rounded bg-slate-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-slate-800" />
        <div className="h-5 w-24 rounded bg-slate-800" />
      </div>
      <div className="h-3 w-40 rounded bg-slate-800" />
      <div className="h-6 w-28 rounded bg-slate-800" />
    </div>
  );
}

/* ─── page ─── */
export default function HistoryPage() {
  const [rows, setRows] = useState<InquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceType>("전체");

  useEffect(() => {
    fetch("/api/inquiries")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setRows(json.data as InquirySummary[]);
        } else {
          setError(json.error?.message ?? "히스토리를 불러오지 못했습니다.");
        }
      })
      .catch(() => setError("네트워크 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => {
    const matchSearch = r.brand.toLowerCase().includes(search.toLowerCase());
    const matchSource = matchesFilter(r.platform, sourceFilter);
    return matchSearch && matchSource;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--d-h)]">문의 히스토리</h1>
        <p className="mt-1 text-sm text-[var(--d-m)]">분석했던 브랜드 문의 목록입니다.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="브랜드명 또는 플랫폼 검색..."
            className="w-full rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] py-3 pl-11 pr-4 text-sm text-[var(--d-b)] placeholder-[var(--d-f)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 lg:pb-0">
          {SOURCE_CHIPS.map(({ id }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSourceFilter(id)}
              className={[
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
                sourceFilter === id
                  ? "bg-gradient-to-r from-[#6366F1] to-indigo-500 text-white border-transparent shadow-md shadow-[#6366F1]/20"
                  : "border border-[var(--d-border)] text-[var(--d-m)] hover:text-[var(--d-h)]",
              ].join(" ")}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading: skeleton grid */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="animate-float mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#6366F1]/15 bg-[#6366F1]/10 mx-auto">
            <svg
              className="h-9 w-9 text-[#6366F1]/60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <p className="mb-2 text-lg font-semibold text-[var(--d-h)]">아직 분석한 문의가 없습니다.</p>
          <p className="mb-8 text-sm text-[var(--d-f)]">첫 문의를 분석해보세요.</p>
          <Link
            href="/dashboard/intake"
            className="btn-gradient rounded-full px-8 py-3 font-bold text-white"
          >
            문의 분석하기
          </Link>
        </div>
      )}

      {/* No results after filter */}
      {!loading && !error && rows.length > 0 && filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--d-f)]">
          검색 조건에 맞는 문의가 없습니다.
        </p>
      )}

      {/* Card grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((row) => {
            const source = classifySource(row.platform);
            const tagCls = SOURCE_TAG[source] ?? DEFAULT_TAG;
            const initials = monogram(row.brand);
            return (
              <div
                key={row.id}
                className="card-hover flex flex-col gap-4 rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-6"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      initials[0] >= "A" && initials[0] <= "F"
                        ? "border border-indigo-500/15 bg-indigo-500/20 text-indigo-400"
                        : initials[0] >= "G" && initials[0] <= "L"
                        ? "border border-pink-500/15 bg-pink-500/20 text-pink-400"
                        : initials[0] >= "M" && initials[0] <= "R"
                        ? "border border-emerald-500/15 bg-emerald-500/20 text-emerald-400"
                        : initials[0] >= "S" && initials[0] <= "Z"
                        ? "border border-amber-500/15 bg-amber-500/20 text-amber-400"
                        : "bg-purple-500/20 text-purple-400",
                    ].join(" ")}>
                      {initials}
                    </div>
                    <span className="font-bold text-[var(--d-h)]">{row.brand}</span>
                  </div>
                  <Link
                    href={`/deal/${row.id}`}
                    className="shrink-0 text-sm font-medium text-indigo-400 transition-colors hover:text-[#6366F1]"
                  >
                    상세 보기 →
                  </Link>
                </div>

                {/* Platform tag + date */}
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tagCls}`}>
                    {source}
                  </span>
                  <span className="text-xs text-[var(--d-f)]">{formatDate(row.created_at)}</span>
                </div>

                {/* Deliverables */}
                <p className="truncate text-sm text-[var(--d-m)]">
                  {row.deliverables || "—"}
                </p>

                {/* Suggested price */}
                <p className="text-xl font-black text-[var(--d-h)]">{formatKRW(row.suggested_price)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && rows.length > 0 && (
        <div className="mt-2 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled
            className="rounded-lg border border-[var(--d-border)] px-4 py-2 text-sm text-[var(--d-f)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← 이전
          </button>
          <span className="text-sm font-medium text-[var(--d-m)]">1 / 1 페이지</span>
          <button
            type="button"
            disabled
            className="rounded-lg border border-[var(--d-border)] px-4 py-2 text-sm text-[var(--d-f)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}
