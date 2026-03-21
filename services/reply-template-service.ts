import "server-only";

import type { ReplyTemplateInput } from "@/types/reply";

const MISSING_SENTINEL = "not specified";

function resolveBrand(brand_name: string): string {
  return !brand_name || brand_name === MISSING_SENTINEL ? "귀사" : brand_name;
}

function formatKrw(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function missingFieldsLine(missing_fields: string[]): string {
  if (missing_fields.length === 0) return "";
  const FIELD_LABELS: Record<string, string> = {
    brand_name: "브랜드명",
    contact_name: "담당자명",
    contact_channel: "연락 채널",
    platform_requested: "요청 플랫폼",
    deliverables: "콘텐츠 납품 항목",
    timeline: "진행 일정",
    compensation_type: "보상 방식",
    budget_mentioned: "예산",
    usage_rights: "콘텐츠 사용권",
    exclusivity: "독점 조항",
    revisions: "수정 횟수",
    payment_terms: "결제 조건",
  };
  const labels = missing_fields.map((f) => FIELD_LABELS[f] ?? f.replace(/_/g, " "));
  return `진행 전 아래 항목을 추가로 확인하고 싶습니다:\n${labels.map((l) => `- ${l}`).join("\n")}\n\n`;
}

function creatorSignature(contact_name: string): string {
  if (!contact_name || contact_name === MISSING_SENTINEL) return "드림";
  return `${contact_name} 드림`;
}

export function renderPoliteReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);
  const clarify = missingFieldsLine(input.missing_fields);
  const priceNote =
    input.compensation_type === "barter"
      ? "협찬 방식의 경우, 저희는 유료 기반으로 협업을 진행하고 있으며 범위에 맞는 단가로 논의드릴 수 있습니다."
      : `요청해 주신 콘텐츠 기준 협찬 단가는 ${formatKrw(input.quote_target)}입니다.`;

  return [
    `안녕하세요, ${brand} 담당자님.`,
    "",
    "협찬 문의 주셔서 감사합니다.",
    "말씀해 주신 내용 검토했습니다.",
    "",
    clarify,
    priceNote,
    "",
    "긍정적으로 검토해 주시면 감사하겠습니다.",
    "",
    creatorSignature(input.contact_name),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderQuickReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);
  const clarify =
    input.missing_fields.length > 0
      ? `추가 확인 필요: ${input.missing_fields.map((f) => f.replace(/_/g, " ")).join(", ")}.`
      : "";

  const priceNote =
    input.compensation_type === "barter"
      ? "유료 기반으로 진행하고 있으니 단가 논의 가능합니다."
      : `협찬 단가: ${formatKrw(input.quote_target)}.`;

  return [
    `안녕하세요, ${brand} 담당자님.`,
    "",
    `${input.platform_requested} 협업 문의 감사합니다 (${input.deliverables}).`,
    "",
    clarify,
    priceNote,
    "",
    "진행 방향 말씀 부탁드립니다.",
  ]
    .filter((line) => line !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderNegotiationFallbackReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);
  const clarify = missingFieldsLine(input.missing_fields);
  const priceNote =
    input.compensation_type === "barter"
      ? "보상 방식과 관련하여, 저희는 유료 기반으로 진행하고 있으나 양측에 맞는 패키지 구조로 논의 가능합니다."
      : `해당 범위 기준 초기 제안 단가는 ${formatKrw(input.quote_target)}이며, 납품 항목이나 조건 변경 시 협의 가능합니다.`;

  return [
    `안녕하세요, ${brand} 담당자님.`,
    "",
    `${input.platform_requested} 협업 제안 주셔서 감사합니다.`,
    "",
    `제안해 주신 범위(${input.deliverables})를 검토했으며, 긍정적으로 검토 중입니다.`,
    "",
    clarify,
    priceNote,
    "",
    "통화나 메시지로 편하신 방식으로 계속 논의해 주시면 좋겠습니다.",
    "",
    creatorSignature(input.contact_name),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
