import "server-only";

import type { InquiryData } from "@/types/inquiry";

export type CheckPriority = "HIGH" | "MEDIUM" | "LOW";

export type CheckItem = {
  check_code: string;
  priority: CheckPriority;
  message: string;
  resolved: boolean;
};

const MISSING_VALUES = new Set(["not specified", "tbd", "", "unknown", "n/a"]);

function isMissing(value: string): boolean {
  return MISSING_VALUES.has(value.toLowerCase().trim());
}

export function generateChecks(parsedInquiry: InquiryData): CheckItem[] {
  const checks: CheckItem[] = [];

  if (isMissing(parsedInquiry.payment_terms)) {
    checks.push({
      check_code: "MISSING_PAYMENT_TERMS",
      priority: "HIGH",
      message: "결제 조건이 명시되지 않았습니다. 계약 전 지급 일정(예: 납품 후 N일 이내)과 결제 방식을 반드시 확인하세요.",
      resolved: false,
    });
  }

  if (isMissing(parsedInquiry.usage_rights)) {
    checks.push({
      check_code: "MISSING_USAGE_RIGHTS",
      priority: "HIGH",
      message: "콘텐츠 사용권이 명시되지 않았습니다. 사용 범위(SNS 재게시, 광고 활용 등), 기간, 허용 채널을 계약서에 명확히 기재해야 합니다.",
      resolved: false,
    });
  }

  if (isMissing(parsedInquiry.exclusivity)) {
    checks.push({
      check_code: "UNCLEAR_EXCLUSIVITY",
      priority: "MEDIUM",
      message: "독점 조항이 불명확합니다. 동일 카테고리 내 경쟁 브랜드 협업이 제한되는지, 독점 기간은 얼마인지 확인하세요.",
      resolved: false,
    });
  }

  if (isMissing(parsedInquiry.revisions)) {
    checks.push({
      check_code: "MISSING_REVISIONS",
      priority: "MEDIUM",
      message: "수정 가능 횟수가 명시되지 않았습니다. 무제한 수정 요청을 방지하기 위해 수정 횟수 상한(예: 2회)을 계약서에 포함하세요.",
      resolved: false,
    });
  }

  if (isMissing(parsedInquiry.timeline)) {
    checks.push({
      check_code: "MISSING_TIMELINE",
      priority: "LOW",
      message: "진행 일정이 명시되지 않았습니다. 초안 제출일과 최종 게시 마감일을 상호 합의하여 일정 분쟁을 예방하세요.",
      resolved: false,
    });
  }

  return checks;
}
