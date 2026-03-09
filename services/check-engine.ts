import type { InquiryData } from "@/types/inquiry";

export type CheckPriority = "HIGH" | "MEDIUM" | "LOW";

export type CheckItem = {
  code: string;
  priority: CheckPriority;
  message: string;
};

const MISSING_VALUES = new Set(["not specified", "tbd", "", "unknown", "n/a"]);

function isMissing(value: string): boolean {
  return MISSING_VALUES.has(value.toLowerCase().trim());
}

export function generateChecks(parsedInquiry: InquiryData): CheckItem[] {
  const checks: CheckItem[] = [];

  if (isMissing(parsedInquiry.payment_terms)) {
    checks.push({
      code: "MISSING_PAYMENT_TERMS",
      priority: "HIGH",
      message: "Payment terms are not specified. Clarify net days and payment method before signing.",
    });
  }

  if (isMissing(parsedInquiry.usage_rights)) {
    checks.push({
      code: "MISSING_USAGE_RIGHTS",
      priority: "HIGH",
      message: "Usage rights are not specified. Define scope, duration, and channels explicitly.",
    });
  }

  if (isMissing(parsedInquiry.exclusivity)) {
    checks.push({
      code: "UNCLEAR_EXCLUSIVITY",
      priority: "MEDIUM",
      message: "Exclusivity terms are unclear. Confirm whether category or competitor exclusivity applies.",
    });
  }

  if (isMissing(parsedInquiry.revisions)) {
    checks.push({
      code: "MISSING_REVISIONS",
      priority: "MEDIUM",
      message: "Revision rounds are not specified. Set a cap to avoid unlimited revision requests.",
    });
  }

  if (isMissing(parsedInquiry.timeline)) {
    checks.push({
      code: "MISSING_TIMELINE",
      priority: "LOW",
      message: "Timeline is not specified. Agree on draft submission and publish deadlines.",
    });
  }

  return checks;
}
