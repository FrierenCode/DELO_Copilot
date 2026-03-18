import type { QuoteBreakdown } from "@/types/parse-api";

type Props = {
  data: QuoteBreakdown;
};

function formatKRW(amount: number) {
  return "₩" + amount.toLocaleString("ko-KR");
}

export function IntakeQuote({ data }: Props) {
  const hasFloor = data.floor !== undefined;
  const hasPremium = data.premium !== undefined;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#F8FAFC]">예상 견적</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Floor */}
        {hasFloor && (
          <div className="p-5 rounded-xl bg-[#13131A] border border-[#1E1E2E] flex flex-col justify-between hover:border-[#27272A] transition-colors">
            <div>
              <span className="px-2 py-0.5 bg-[#1E1E2E] text-[10px] rounded-full text-[#94A3B8] mb-4 inline-block font-bold">
                FLOOR
              </span>
              <p className="text-2xl font-bold text-[#F8FAFC]">{formatKRW(data.floor!)}</p>
            </div>
            <p className="text-[11px] text-[#64748B] mt-3">최소 수락 가능 금액</p>
          </div>
        )}

        {/* Target (featured) */}
        <div className={[
          "p-5 rounded-xl flex flex-col justify-between relative",
          "bg-[#6366F1]/5 border-2 border-[#6366F1]",
          !hasFloor && !hasPremium ? "md:col-span-3" : "",
        ].join(" ")}>
          <div className="absolute top-0 right-0 bg-[#6366F1] text-[8px] font-bold text-white uppercase px-2 py-1 rounded-bl-lg">
            RECOMMENDED
          </div>
          <div>
            <span className="px-2 py-0.5 bg-[#6366F1]/20 text-[10px] rounded-full text-[#6366F1] mb-4 inline-block font-bold">
              TARGET
            </span>
            <p className="text-2xl font-bold text-[#F8FAFC]">{formatKRW(data.target)}</p>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-3 font-medium">시장 평균 및 가치 고려</p>
        </div>

        {/* Premium */}
        {hasPremium && (
          <div className="p-5 rounded-xl bg-[#13131A] border border-[#1E1E2E] flex flex-col justify-between hover:border-[#27272A] transition-colors">
            <div>
              <span className="px-2 py-0.5 bg-yellow-500/10 text-[10px] rounded-full text-yellow-500 mb-4 inline-block font-bold">
                PREMIUM
              </span>
              <p className="text-2xl font-bold text-[#F8FAFC]">{formatKRW(data.premium!)}</p>
            </div>
            <p className="text-[11px] text-[#64748B] mt-3">독점권/원본 포함 시</p>
          </div>
        )}
      </div>

      {data.explanation && (
        <p className="text-sm leading-relaxed text-[#94A3B8]">{data.explanation}</p>
      )}

      <p className="text-xs text-[#334155]">
        이 견적은 운영 참고용 가이드이며, 법률·세무·회계 자문이 아닙니다.
      </p>
    </div>
  );
}
