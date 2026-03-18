"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";
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

const SOURCE_STYLE: Record<string, { chip: string; mono: string }> = {
  "이메일":   { chip: "bg-blue-500/10 text-blue-500 border-blue-500/20",  mono: "bg-blue-500/10 text-blue-500" },
  "인스타 DM":{ chip: "bg-pink-500/10 text-pink-500 border-pink-500/20",  mono: "bg-pink-500/10 text-pink-500" },
  "유튜브":   { chip: "bg-red-500/10 text-red-500 border-red-500/20",     mono: "bg-red-500/10 text-red-500" },
  "카카오":   { chip: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", mono: "bg-yellow-500/10 text-yellow-500" },
};
const DEFAULT_STYLE = { chip: "bg-slate-500/10 text-slate-400 border-slate-500/20", mono: "bg-slate-500/10 text-slate-400" };

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
  const source = classifySource(platform);
  return source === filter;
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
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">문의 히스토리</h1>
        <p className="mt-1 text-sm text-slate-400">분석했던 브랜드 문의 목록입니다.</p>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
            className="w-full bg-[#13131A] border border-[#1E1E2E] rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Source filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {SOURCE_CHIPS.map(({ id }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSourceFilter(id)}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                sourceFilter === id
                  ? "bg-indigo-500 text-white"
                  : "bg-[#13131A] text-slate-400 border border-[#1E1E2E] hover:border-slate-600",
              ].join(" ")}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <Loader label="히스토리 불러오는 중…" />}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty state (no data at all) */}
      {!loading && !error && rows.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center p-12 bg-[#13131A]/40 rounded-3xl border-2 border-dashed border-[#1E1E2E]">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
            <span className="text-4xl">📭</span>
          </div>
          <p className="text-slate-400 font-medium">아직 분석한 문의가 없습니다.</p>
          <Link
            href="/dashboard/intake"
            className="mt-4 text-indigo-400 font-bold text-sm hover:underline underline-offset-4"
          >
            첫 문의 분석하기 →
          </Link>
        </div>
      )}

      {/* No results after filter */}
      {!loading && !error && rows.length > 0 && filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          검색 조건에 맞는 문의가 없습니다.
        </p>
      )}

      {/* Card grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((row) => {
            const source = classifySource(row.platform);
            const style = SOURCE_STYLE[source] ?? DEFAULT_STYLE;
            const initials = monogram(row.brand);
            return (
              <div
                key={row.id}
                className="bg-[#13131A] border border-[#1E1E2E] p-4 rounded-xl flex flex-col gap-4 hover:border-indigo-500/50 transition-all group"
              >
                {/* Top row */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {/* Monogram */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${style.mono}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {row.brand}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded border font-medium ${style.chip}`}
                        >
                          {source}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(row.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/deal/${row.id}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
                  >
                    상세 보기 →
                  </Link>
                </div>

                {/* Bottom row */}
                <div className="flex justify-between items-end border-t border-[#1E1E2E] pt-3">
                  <div className="text-xs text-slate-400 truncate max-w-[55%]">
                    {row.deliverables || "—"}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">제안가</div>
                    <div className="font-bold text-slate-100">
                      {formatKRW(row.suggested_price)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Static pagination (display only) */}
      {!loading && !error && rows.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-6 py-6 border-t border-[#1E1E2E]">
          <button
            type="button"
            disabled
            className="flex items-center px-4 py-2 rounded-full border border-[#1E1E2E] text-slate-500 hover:text-white hover:bg-[#13131A] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            <span className="text-sm font-medium">이전</span>
          </button>
          <span className="text-sm font-medium text-slate-400">1 / 1 페이지</span>
          <button
            type="button"
            disabled
            className="flex items-center px-4 py-2 rounded-full border border-[#1E1E2E] text-slate-500 hover:text-white hover:bg-[#13131A] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">다음</span>
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
