import "server-only";

import type { ReplyTemplateInput } from "@/types/reply";

const MISSING_SENTINEL = "not specified";

function resolveBrand(brand_name: string): string {
  return !brand_name || brand_name === MISSING_SENTINEL ? "your team" : brand_name;
}

function formatKrw(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function missingFieldsLine(missing_fields: string[]): string {
  if (missing_fields.length === 0) return "";
  const labels = missing_fields.map((f) => f.replace(/_/g, " "));
  return `Before we proceed, could you please clarify the following: ${labels.join(", ")}?\n\n`;
}

function greeting(contact_name: string): string {
  if (!contact_name || contact_name === MISSING_SENTINEL) return "Hello,";
  return `Hello ${contact_name},`;
}

export function renderPoliteReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);
  const clarify = missingFieldsLine(input.missing_fields);
  const priceNote =
    input.compensation_type === "barter"
      ? "Regarding compensation, we currently work on a paid basis and would be happy to discuss a fee that reflects the scope."
      : `For this collaboration, our fee for the requested deliverables is ${formatKrw(input.quote_target)}.`;

  return [
    greeting(input.contact_name),
    "",
    `Thank you for reaching out to us on behalf of ${brand}. We appreciate your interest in working together on ${input.platform_requested}.`,
    "",
    `We've reviewed your inquiry regarding ${input.deliverables}.`,
    "",
    clarify,
    priceNote,
    "",
    "We'd love to move forward — please let us know your thoughts or any questions you may have.",
    "",
    "Best regards",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderQuickReply(input: ReplyTemplateInput): string {
  const brand = resolveBrand(input.brand_name);
  const clarify =
    input.missing_fields.length > 0
      ? `Still need: ${input.missing_fields.map((f) => f.replace(/_/g, " ")).join(", ")}.`
      : "";

  const priceNote =
    input.compensation_type === "barter"
      ? "Note: we work on a paid basis — open to discussing a fee."
      : `Our rate for this: ${formatKrw(input.quote_target)}.`;

  return [
    greeting(input.contact_name),
    "",
    `Thanks for the inquiry re: ${brand} × ${input.platform_requested} (${input.deliverables}).`,
    "",
    clarify,
    priceNote,
    "",
    "Let me know how you'd like to proceed.",
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
      ? "On compensation: we typically work on a paid basis, though we're open to discussing package structures that work for both sides."
      : `Our initial rate for this scope is ${formatKrw(input.quote_target)}, though we're open to a conversation if the deliverables or terms shift.`;

  return [
    greeting(input.contact_name),
    "",
    `Thanks for getting in touch about a potential collaboration with ${brand} on ${input.platform_requested}.`,
    "",
    `We've looked over the proposed scope (${input.deliverables}) and are interested in exploring this further.`,
    "",
    clarify,
    priceNote,
    "",
    "Happy to jump on a quick call or continue over message — whatever works best for you.",
    "",
    "Looking forward to it",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
