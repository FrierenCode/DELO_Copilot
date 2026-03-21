import type { ParsedInquiry } from "@/types/parse-api";

type InquiryCardProps = {
  data: ParsedInquiry;
  missingFields: string[];
  bare?: boolean;
};

type RowProps = {
  label: string;
  value: string;
  missing?: boolean;
};

function Row({ label, value, missing }: RowProps) {
  const isEmpty = value === "not specified" || value === "" || value == null;
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-bold" style={{ color: "var(--p-muted)" }}>{label}</span>
      {isEmpty ? (
        <span
          className="rounded px-2 py-0.5 text-[10px] font-black uppercase"
          style={{ backgroundColor: "var(--p-error-soft)", color: "var(--p-error)" }}
        >
          Missing
        </span>
      ) : (
        <span
          className="max-w-[55%] text-right text-sm font-black leading-snug"
          style={{ color: missing ? "var(--p-error)" : "var(--p-text)" }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export function InquiryCard({ data, missingFields, bare = false }: InquiryCardProps) {
  const missing = new Set(missingFields);

  const rows: [string, keyof ParsedInquiry][] = [
    ["브랜드", "brand_name"],
    ["담당자", "contact_name"],
    ["채널", "contact_channel"],
    ["플랫폼", "platform_requested"],
    ["콘텐츠", "deliverables"],
    ["마감일", "timeline"],
    ["보수 형태", "compensation_type"],
    ["예산", "budget_mentioned"],
    ["사용권", "usage_rights"],
    ["독점 조건", "exclusivity"],
    ["수정 횟수", "revisions"],
    ["결제 조건", "payment_terms"],
  ];

  const inner = (
    <>
      <div className="space-y-0.5">
        {rows.map(([label, key]) => (
          <Row key={key} label={label} value={data[key]} missing={missing.has(key)} />
        ))}
      </div>
      {missingFields.length > 0 && (
        <p className="mt-4 text-xs font-medium" style={{ color: "var(--p-error)" }}>
          {missingFields.length}개 항목 누락 — 답장 전 확인 권장
        </p>
      )}
    </>
  );

  if (bare) return <div>{inner}</div>;

  return (
    <div
      className="overflow-hidden rounded-2xl border-l-4"
      style={{
        backgroundColor: "var(--p-surface-2)",
        borderLeftColor: "var(--p-primary)",
        boxShadow: "var(--p-card-shadow)",
        border: "1px solid var(--p-card-border)",
        borderLeftWidth: "4px",
      }}
    >
      <div className="p-6">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-muted)" }}>
          문의 분석 결과
        </h3>
        {inner}
      </div>
    </div>
  );
}
