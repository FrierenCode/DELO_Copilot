import "server-only";

import type { ReplyTemplateInput } from "@/types/reply";

const MISSING_SENTINEL = "not specified";

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

function resolveBrand(brand_name: string): string {
  return !brand_name || brand_name === MISSING_SENTINEL ? "귀사" : brand_name;
}

function formatKrw(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function resolveContactLine(brand: string, contact_name: string): string {
  const name =
    contact_name && contact_name !== MISSING_SENTINEL
      ? `${contact_name} `
      : "";
  return `안녕하세요, ${brand} ${name}담당자님.`;
}

/**
 * 관계 우선형 (Free + Pro) — 심리: 호감·상호성·발-들여놓기·자이가르닉 효과
 *
 * 첫 답변에서 금액을 꺼내지 않는다.
 * 브랜드가 "이 크리에이터와 일하고 싶다"는 호감을 먼저 갖게 만들고,
 * 오픈 루프 질문으로 끝내 브랜드가 답변하고 싶게 유도한다.
 * 금액은 브랜드가 캠페인 방향을 공유한 이후 자연스럽게 꺼낼 수 있다.
 */
export function renderPoliteReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);

  const hasDeliverables =
    input.deliverables && input.deliverables !== MISSING_SENTINEL;
  const hasPlatform =
    input.platform_requested && input.platform_requested !== MISSING_SENTINEL;
  const hasTimeline =
    input.timeline && input.timeline !== MISSING_SENTINEL;

  // 제안 내용을 읽었다는 신호 — 브랜드 입장에서 성의 있게 느껴지는 포인트
  const readReceiptLine =
    hasDeliverables && hasPlatform
      ? `${brand}의 ${input.platform_requested} 채널 캠페인과 ${input.deliverables} 제작 건을 살펴보았습니다.`
      : hasPlatform
        ? `${brand}의 ${input.platform_requested} 채널 협업 제안을 살펴보았습니다.`
        : `${brand}의 협업 제안을 꼼꼼히 살펴보았습니다.`;

  // 누락 정보 → "이해하고 싶어서" 프레임으로 요청 (심문이 아닌 관심)
  const hasMissing = input.missing_fields.length > 0;
  const clarifyLine = hasMissing
    ? `좋은 협업을 만들기 위해 ${input.missing_fields
        .map((f) => FIELD_LABELS[f] ?? f.replace(/_/g, " "))
        .join(", ")} 부분을 조금 더 파악하고 싶습니다.`
    : "";

  // 일정이 있으면 자연스럽게 언급해 타임라인 인지를 보여줌
  const timelineAck =
    hasTimeline ? `${input.timeline} 일정도 확인했습니다. ` : "";

  // 오픈 루프 질문 — 브랜드가 답하고 싶도록 유도 (자이가르닉 효과)
  const openLoop = hasMissing
    ? "캠페인 방향과 함께 위 내용을 공유해 주시면, 저희 채널과의 핏을 확인한 뒤 구체적인 협업 조건을 빠르게 안내드리겠습니다."
    : "이번 캠페인을 통해 기대하시는 방향이나 목표가 있으시면 편하게 공유해 주세요. 방향을 맞춰보고 최적의 구성을 제안드리겠습니다.";

  return [
    resolveContactLine(brand, input.contact_name),
    "",
    `협업 문의 주셔서 감사합니다. ${readReceiptLine}`,
    "",
    `${timelineAck}${clarifyLine ? clarifyLine + " " : ""}콘텐츠 방향성과 캠페인 목표가 잘 맞는 만큼, 세부 조건을 확인하고 싶습니다.`,
    "",
    openLoop,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * 단도직입형 (Pro) — 심리: 앵커링·명확성·전문성
 *
 * 브랜드가 먼저 예산/단가를 물어봤거나 빠른 답을 원하는 경우.
 * 금액을 "참고 단가"로 가볍게 올려두되, 협의 가능성을 열어두어
 * 부담 없이 대화가 이어지도록 한다.
 */
export function renderQuickReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);

  const isBarter =
    input.compensation_type === "barter" ||
    input.compensation_type === "product" ||
    input.compensation_type.toLowerCase().includes("barter") ||
    input.compensation_type.toLowerCase().includes("product");

  const hasMissing = input.missing_fields.length > 0;
  const missingNote = hasMissing
    ? ` ${input.missing_fields
        .map((f) => FIELD_LABELS[f] ?? f.replace(/_/g, " "))
        .join(", ")} 확인 후 최종 확정이 가능합니다.`
    : "";

  const priceLine = isBarter
    ? "협찬 방식의 경우 구성안을 공유해 주시면 범위에 맞게 조건을 안내드리겠습니다."
    : `참고로 유사 범위 기준 단가는 ${formatKrw(input.quote_target)} 선이며, 납품 구성에 따라 조율 가능합니다.`;

  const platformLine =
    input.platform_requested && input.platform_requested !== MISSING_SENTINEL
      ? `${input.platform_requested} 협업 문의 감사합니다.`
      : "협업 문의 감사합니다.";

  return [
    resolveContactLine(brand, input.contact_name),
    "",
    `${platformLine} 제안 내용 확인했습니다.${missingNote}`,
    "",
    priceLine,
    "",
    "진행하신다면 브리프 또는 계약 조건안을 공유해 주세요. 바로 검토하겠습니다.",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * 전략 협상형 (Pro — LLM 실패 시 fallback)
 * 심리: 가치 앵커링→가격 앵커링→조건부 유연성→희소성 암시→CTA
 *
 * 단가를 먼저 꺼내더라도 "왜 이 금액인지"의 맥락(납품 범위, 독점, 사용권)을
 * 함께 제시하여 브랜드가 납득할 수 있도록 한다.
 * 이 탭은 크리에이터가 협상 레버리지를 최대화하고 싶을 때 쓰는 전략 버전.
 */
export function renderNegotiationFallbackReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);

  const isBarter =
    input.compensation_type === "barter" ||
    input.compensation_type === "product" ||
    input.compensation_type.toLowerCase().includes("barter") ||
    input.compensation_type.toLowerCase().includes("product");

  const hasDeliverables =
    input.deliverables && input.deliverables !== MISSING_SENTINEL;
  const hasPlatform =
    input.platform_requested && input.platform_requested !== MISSING_SENTINEL;
  const hasExclusivity =
    input.exclusivity && input.exclusivity !== MISSING_SENTINEL;
  const hasUsageRights =
    input.usage_rights && input.usage_rights !== MISSING_SENTINEL;
  const hasMissing = input.missing_fields.length > 0;

  const contextLine =
    hasDeliverables && hasPlatform
      ? `${input.platform_requested} 채널 ${input.deliverables} 건을 구체적으로 검토하였습니다.`
      : hasPlatform
        ? `${input.platform_requested} 채널 협업 건을 구체적으로 검토하였습니다.`
        : "제안 주신 협업 조건을 면밀히 검토하였습니다.";

  // 누락 정보는 가격 제시 이후 흐름을 끊지 않게 짧게
  const clarifyInsert = hasMissing
    ? ` 다만 ${input.missing_fields
        .map((f) => FIELD_LABELS[f] ?? f.replace(/_/g, " "))
        .join(", ")} 항목은 최종 확정 전 추가 확인이 필요합니다.`
    : "";

  const pricingBlock = isBarter
    ? [
        "저희는 기본적으로 유료 협업 구조로 운영하고 있습니다.",
        "협찬 방식의 경우 콘텐츠 범위·노출 빈도·독점 여부를 종합하여 양측에 합리적인 패키지를 제안드리고 있으니, 구성안과 예산 가이드라인을 공유해 주시면 구체적인 조건을 안내드리겠습니다.",
      ].join(" ")
    : [
        `해당 범위 기준 협업 단가는 ${formatKrw(input.quote_target)}입니다.${clarifyInsert}`,
        `납품 구성 조정에 따라 ${formatKrw(input.quote_floor)}~${formatKrw(input.quote_premium)} 범위에서 협의 가능합니다.`,
        hasExclusivity
          ? `독점 조항(${input.exclusivity})이 포함될 경우 해당 기간의 기회비용이 단가에 반영되며, 독점 범위 조율로 단가 협의가 가능합니다.`
          : "",
        hasUsageRights
          ? `광고 소재 재활용 및 2차 배포 범위에 따라 라이선스 비용이 별도 산정됩니다.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

  return [
    resolveContactLine(brand, input.contact_name),
    "",
    `협업 제안 주셔서 감사합니다. ${contextLine}`,
    "",
    pricingBlock,
    "",
    "저희는 단순 콘텐츠 납품보다 브랜드와 크리에이터 양측에 실질적인 성과를 만드는 파트너십을 지향합니다.",
    "캠페인 브리프나 예산 범위를 공유해 주시면 적극적으로 협의하겠습니다. 통화나 메신저 등 편하신 방식으로 먼저 연락 주세요.",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
