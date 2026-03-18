import type { ParsedInquiry } from "@/types/parse-api";

type Props = {
  data: ParsedInquiry;
  missingFields: string[];
};

const FIELD_LABELS: [string, keyof ParsedInquiry][] = [
  ["브랜드명", "brand_name"],
  ["담당자", "contact_name"],
  ["연락 채널", "contact_channel"],
  ["플랫폼", "platform_requested"],
  ["콘텐츠", "deliverables"],
  ["일정", "timeline"],
  ["보상 방식", "compensation_type"],
  ["예산", "budget_mentioned"],
  ["사용권", "usage_rights"],
  ["독점 여부", "exclusivity"],
  ["수정 횟수", "revisions"],
  ["결제 조건", "payment_terms"],
];

export function IntakeBrief({ data, missingFields }: Props) {
  const missingSet = new Set(missingFields);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#6366F1] inline-block" />
        파싱 결과
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {FIELD_LABELS.map(([label, key]) => {
          const isMissing = missingSet.has(key);
          return (
            <div
              key={key}
              className="p-4 bg-[#13131A] border border-[#1E1E2E] rounded-xl"
            >
              <p className="text-[10px] text-[#64748B] font-bold mb-1 uppercase tracking-tight">
                {label}
              </p>
              {isMissing ? (
                <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                  미확인
                </span>
              ) : (
                <p className="font-semibold text-sm text-[#F8FAFC]">{data[key]}</p>
              )}
            </div>
          );
        })}
      </div>
      {missingFields.length > 0 && (
        <p className="text-xs text-amber-500/70">
          {missingFields.length}개 항목이 명시되지 않았습니다.
        </p>
      )}
    </div>
  );
}
