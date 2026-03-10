const EXPECTED_FIELDS = [
  "brand_name",
  "contact_name",
  "contact_channel",
  "platform_requested",
  "deliverables",
  "timeline",
  "compensation_type",
  "budget_mentioned",
  "usage_rights",
  "exclusivity",
  "revisions",
  "payment_terms",
] as const;

const NULL_LIKE = new Set(["", "n/a", "none", "-", "null", "undefined", "unknown"]);
const MAX_FIELD_LENGTH = 500;

export function normalizeInquiryFields(
  input: Record<string, unknown>,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const field of EXPECTED_FIELDS) {
    const raw = input[field];

    if (raw === null || raw === undefined) {
      result[field] = "not specified";
      continue;
    }

    let value = typeof raw === "string" ? raw : String(raw);

    // Collapse repeated whitespace and trim
    value = value.replace(/\s+/g, " ").trim();

    if (NULL_LIKE.has(value.toLowerCase())) {
      result[field] = "not specified";
      continue;
    }

    // Truncate to safe max length
    if (value.length > MAX_FIELD_LENGTH) {
      value = value.slice(0, MAX_FIELD_LENGTH);
    }

    result[field] = value;
  }

  return result;
}
