import Link from "next/link";

export function EmptyDealsState() {
  return (
    <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--d-border)] bg-[var(--d-surface2)] px-8 py-16 text-center">
      {/* Animated icon */}
      <div className="animate-float mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-indigo-500/10 border border-[#6366F1]/20 shadow-lg shadow-[#6366F1]/10">
        <svg className="h-8 w-8 text-[#6366F1]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-base font-bold text-[var(--d-b)]">아직 저장된 딜이 없습니다</p>
      <p className="mt-1.5 text-sm text-[var(--d-f)]">첫 협찬 문의를 붙여넣고 AI로 분석해보세요</p>
      <Link
        href="/dashboard/intake"
        className="btn-gradient mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6366F1]/25"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        문의 분석하기
      </Link>
    </div>
  );
}
