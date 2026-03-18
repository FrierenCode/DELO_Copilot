import Link from "next/link";

export function EmptyDealsState() {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-[#1E1E2E] bg-[#13131A] px-8 py-16 text-center">
      <p className="text-base font-medium text-slate-400">아직 저장된 딜이 없습니다.</p>
      <p className="mt-1 text-sm text-slate-500">첫 문의를 분석해보세요.</p>
      <Link
        href="/dashboard/intake"
        className="mt-5 inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-colors"
      >
        문의 분석하기
      </Link>
    </div>
  );
}
