import { Card } from "@/components/ui/Card";
import type { ParsedInquiry } from "@/types/parse-api";

type InquiryCardProps = {
  data: ParsedInquiry;
  missingFields: string[];
};

type RowProps = {
  label: string;
  value: string;
  missing?: boolean;
};

function Row({ label, value, missing }: RowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="w-36 shrink-0 text-xs font-medium text-neutral-500">{label}</span>
      <span className={`text-sm ${missing ? "text-amber-600" : "text-neutral-800"}`}>
        {value}
      </span>
    </div>
  );
}

export function InquiryCard({ data, missingFields }: InquiryCardProps) {
  const missing = new Set(missingFields);

  const rows: [string, keyof ParsedInquiry][] = [
    ["Brand", "brand_name"],
    ["Contact", "contact_name"],
    ["Channel", "contact_channel"],
    ["Platform", "platform_requested"],
    ["Deliverables", "deliverables"],
    ["Timeline", "timeline"],
    ["Compensation", "compensation_type"],
    ["Budget", "budget_mentioned"],
    ["Usage rights", "usage_rights"],
    ["Exclusivity", "exclusivity"],
    ["Revisions", "revisions"],
    ["Payment terms", "payment_terms"],
  ];

  return (
    <Card title="Parsed Inquiry">
      <div className="flex flex-col gap-3">
        {rows.map(([label, key]) => (
          <Row
            key={key}
            label={label}
            value={data[key]}
            missing={missing.has(key)}
          />
        ))}
      </div>
      {missingFields.length > 0 && (
        <p className="mt-4 text-xs text-amber-600">
          {missingFields.length} field{missingFields.length > 1 ? "s" : ""} not specified — shown in amber.
        </p>
      )}
    </Card>
  );
}
