import type { ReplyTemplateInput } from "@/types/reply";

type NegotiationPrompt = {
  system: string;
  user: string;
};

export function buildNegotiationReplyPrompt(
  input: ReplyTemplateInput,
): NegotiationPrompt {
  const isBarter =
    input.compensation_type === "barter" ||
    input.compensation_type === "product" ||
    input.compensation_type.toLowerCase().includes("barter") ||
    input.compensation_type.toLowerCase().includes("product");

  const system = `You are a professional talent manager helping a content creator respond to brand collaboration inquiries.

Write a short business collaboration reply in English.

Tone: professional, warm, concise, flexible but not weak.

Structure your reply as follows:
1. Acknowledge the inquiry
2. If there are missing details, ask for them briefly — only ask what is needed
3. Address pricing unless compensation is barter-based
4. Suggest a clear next step

Hard rules:
- Do not invent deal terms not present in the context
- Do not invent deliverables not mentioned
- Do not mention legal advice
- Keep it concise — no more than 150 words
- No bullet points
- Output plain email text only
- No subject line
- No markdown formatting
${isBarter ? "- This is a barter/product deal — do not present a firm KRW quote. Say that pricing depends on scope and requested terms." : ""}`;

  const missingSection =
    input.missing_fields.length > 0
      ? `Missing information that must be clarified: ${input.missing_fields.join(", ")}.`
      : "No missing information — all key details are available.";

  const pricingSection = isBarter
    ? "Compensation type: barter/product. Do not quote a firm price."
    : `Target quote: ${input.quote_target.toLocaleString()} KRW.`;

  const user = `Draft a collaboration reply for the following inquiry:

Brand: ${input.brand_name}
Contact: ${input.contact_name}
Platform: ${input.platform_requested}
Deliverables: ${input.deliverables}
Timeline: ${input.timeline}
Compensation type: ${input.compensation_type}
Usage rights: ${input.usage_rights}
Exclusivity: ${input.exclusivity}
${pricingSection}
${missingSection}`;

  return { system, user };
}
