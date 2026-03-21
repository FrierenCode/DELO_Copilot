import type { ParseInput } from "@/types/inquiry";

export const PARSE_PROMPT_VERSION = "parse_v1";

type ParsePrompt = {
  system: string;
  user: string;
};

export function buildParseInquiryPrompt(params: ParseInput): ParsePrompt {
  const sourceHint =
    params.source_type === "email"
      ? "This message is an email. It may include a signature, company name, and formal language."
      : params.source_type === "dm"
        ? "This message is a direct message (DM). It may be short, informal, and lack full details."
        : "This message is from an unspecified channel. It may be mixed in format.";

  const system = `You are a deal extraction assistant for a content creator management tool.

Your job is to extract structured information from brand collaboration inquiry messages.

${sourceHint}

Output rules:
- Output JSON only
- No markdown, no code fences, no explanation
- Do not invent information not present in the message
- Use "not specified" for any field that is unclear or absent
- All field values must be strings
- 모든 필드 값은 반드시 한국어로 작성하세요.
  예시:
  - deliverables: '인스타그램 피드 포스팅 1회, 스토리 3회'
  - timeline: '다음 달 중'
  - compensation_type: '협의 가능'
  - exclusivity: '계약 기간 중 경쟁사 콘텐츠 제한'
  숫자, 고유명사, 브랜드명은 원문 유지.

Extract exactly these fields:
- brand_name: the name of the brand or company sending the inquiry
- contact_name: the name of the person writing the message
- contact_channel: the communication channel (use the source type as a hint)
- platform_requested: the social media platform requested (e.g. instagram, youtube, tiktok, twitter)
- deliverables: the content deliverables requested (e.g. "2 reels, 1 story")
- timeline: the deadline or timeframe mentioned (e.g. "2 weeks", "end of March")
- compensation_type: how they plan to compensate (e.g. fixed, revenue_share, barter, negotiable)
- budget_mentioned: any specific budget or rate mentioned (e.g. "500 USD", "not specified")
- usage_rights: any mention of content usage rights or secondary use
- exclusivity: any mention of exclusivity or competitor restrictions
- revisions: any mention of revision rounds or edit feedback
- payment_terms: any mention of payment schedule or invoice terms

Return a single JSON object with exactly these 12 keys.`;

  const user = `Extract deal information from this message:

---
${params.raw_text}
---`;

  return { system, user };
}
