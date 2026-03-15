import type { QuoteBreakdown } from "@/types/parse-api";

type Props = {
  data: QuoteBreakdown;
};

function formatKRW(amount: number) {
  return amount.toLocaleString("ko-KR") + " ₩";
}

export function IntakeQuote({ data }: Props) {
  // Only render line items that the backend actually returned (hide absent add-ons)
  const lineItems: { label: string; value: number }[] = [];
  if (data.base_fee !== undefined) lineItems.push({ label: "기본 제작비", value: data.base_fee });
  if (data.floor !== undefined) lineItems.push({ label: "Floor 단가", value: data.floor });
  if (data.premium !== undefined) lineItems.push({ label: "Premium 단가", value: data.premium });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        견적 구조
      </h2>

      {/* Primary target price */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-neutral-900">
          {formatKRW(data.target)}
        </span>
        <span className="text-xs text-neutral-500">권장 단가</span>
      </div>

      {/* Itemised breakdown — only shown when backend provides add-on fields */}
      {lineItems.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-lg bg-neutral-50 p-3">
          {lineItems.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-neutral-600">{label}</span>
              <span className="font-medium text-neutral-800">{formatKRW(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Explanation text from backend */}
      {data.explanation && (
        <p className="text-sm leading-relaxed text-neutral-600">{data.explanation}</p>
      )}

      <p className="mt-3 text-xs text-neutral-400">
        이 견적은 운영 참고용 가이드이며, 법률·세무·회계 자문이 아닙니다.
      </p>
    </div>
  );
}
