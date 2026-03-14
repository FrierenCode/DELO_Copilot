import { Card } from "@/components/ui/Card";
import type { QuoteBreakdown } from "@/types/parse-api";

type QuoteCardProps = {
  data: QuoteBreakdown;
};

function formatKRW(amount: number) {
  return amount.toLocaleString("ko-KR") + " ₩";
}

export function QuoteCard({ data }: QuoteCardProps) {
  const hasBreakdown =
    data.base_fee !== undefined || data.floor !== undefined || data.premium !== undefined;

  return (
    <Card title="Suggested Quote">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-3xl font-bold text-neutral-900">{formatKRW(data.target)}</p>
          <p className="mt-0.5 text-xs text-neutral-500">Target rate</p>
        </div>

        {hasBreakdown && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-neutral-50 p-3">
            {data.base_fee !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Base fee</span>
                <span className="font-medium text-neutral-800">{formatKRW(data.base_fee)}</span>
              </div>
            )}
            {data.floor !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Floor</span>
                <span className="font-medium text-neutral-800">{formatKRW(data.floor)}</span>
              </div>
            )}
            {data.premium !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Premium</span>
                <span className="font-medium text-neutral-800">{formatKRW(data.premium)}</span>
              </div>
            )}
          </div>
        )}

        {data.explanation && (
          <p className="text-sm text-neutral-600">{data.explanation}</p>
        )}
      </div>
    </Card>
  );
}
