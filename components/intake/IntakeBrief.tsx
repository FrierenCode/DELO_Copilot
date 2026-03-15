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
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        구조화된 브리프
      </h2>
      <div className="flex flex-col gap-3">
        {FIELD_LABELS.map(([label, key]) => {
          const isMissing = missingSet.has(key);
          return (
            <div key={key} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <span className="w-28 shrink-0 text-xs font-medium text-neutral-500">
                {label}
              </span>
              {isMissing ? (
                <span className="inline-flex w-fit items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  미확인
                </span>
              ) : (
                <span className="text-sm text-neutral-800">{data[key]}</span>
              )}
            </div>
          );
        })}
      </div>
      {missingFields.length > 0 && (
        <p className="mt-4 text-xs text-amber-600">
          {missingFields.length}개 항목이 명시되지 않았습니다.
        </p>
      )}
    </div>
  );
}
