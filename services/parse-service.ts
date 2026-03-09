import { inquirySchema } from "@/schemas/inquiry.schema";
import type { InquiryData, ParseInput, ParseResult } from "@/types/inquiry";

const MISSING_SENTINEL = "not specified";

const REQUIRED_FIELDS: (keyof InquiryData)[] = [
  "brand_name",
  "contact_name",
  "platform_requested",
  "deliverables",
  "timeline",
  "compensation_type",
  "budget_mentioned",
  "usage_rights",
  "exclusivity",
  "revisions",
  "payment_terms",
];

export async function parseService(input: ParseInput): Promise<ParseResult> {
  // TODO: replace with LLM extraction once AI integration is ready
  const extracted = extractFields(input.raw_text, input.source_type);
  const parsed_json = inquirySchema.parse(extracted);

  const missing_fields = REQUIRED_FIELDS.filter(
    (field) => parsed_json[field].toLowerCase().trim() === MISSING_SENTINEL,
  );

  return { parsed_json, missing_fields };
}

function extractFields(raw_text: string, source_type: ParseInput["source_type"]): Record<string, string> {
  const text = raw_text.toLowerCase();

  const contact_channel =
    source_type !== "other" ? source_type : detectContactChannel(text);

  return {
    brand_name: detectBrandName(raw_text),
    contact_name: detectContactName(raw_text),
    contact_channel,
    platform_requested: detectPlatform(text),
    deliverables: detectDeliverables(text),
    timeline: detectTimeline(raw_text),
    compensation_type: detectCompensation(text),
    budget_mentioned: detectBudget(raw_text),
    usage_rights: detectField(text, ["usage rights", "usage right", "secondary use"]),
    exclusivity: detectField(text, ["exclusiv", "competitor", "category exclusive"]),
    revisions: detectField(text, ["revision", "edit round", "feedback round"]),
    payment_terms: detectField(text, ["net ", "net30", "net 30", "payment within", "invoice"]),
  };
}

function detectPlatform(text: string): string {
  if (text.includes("instagram")) return "instagram";
  if (text.includes("youtube")) return "youtube";
  if (text.includes("tiktok")) return "tiktok";
  if (text.includes("twitter") || text.includes("x.com")) return "twitter";
  return MISSING_SENTINEL;
}

function detectCompensation(text: string): string {
  if (text.includes("fixed") || text.includes("flat fee")) return "fixed";
  if (text.includes("rev share") || text.includes("revenue share")) return "revenue_share";
  if (text.includes("barter") || text.includes("gifting")) return "barter";
  return "negotiable";
}

function detectTimeline(rawText: string): string {
  const match = rawText.match(/\b(\d+\s*(?:days?|weeks?|months?))\b/i);
  if (match) return match[1];
  return MISSING_SENTINEL;
}

function detectBrandName(rawText: string): string {
  const match = rawText.match(/(?:from|by|brand[:\s]+)\s*([A-Z][A-Za-z0-9\s&]+)/);
  if (match) return match[1].trim();
  return MISSING_SENTINEL;
}

function detectContactName(rawText: string): string {
  const match = rawText.match(/(?:hi[,\s]+|hello[,\s]+|my name is\s+|i(?:'m| am)\s+)([A-Z][a-z]+)/i);
  if (match) return match[1].trim();
  return MISSING_SENTINEL;
}

function detectContactChannel(text: string): string {
  if (text.includes("email") || text.includes("@")) return "email";
  if (text.includes("dm") || text.includes("direct message")) return "dm";
  return "other";
}

function detectDeliverables(text: string): string {
  const matches: string[] = [];
  const patterns = [
    /(\d+)\s*(?:instagram\s*)?(?:reel|reels)/,
    /(\d+)\s*(?:youtube\s*)?(?:video|videos)/,
    /(\d+)\s*(?:tiktok\s*)?(?:post|posts)/,
    /(\d+)\s*(?:story|stories)/,
  ];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) matches.push(m[0]);
  }
  return matches.length > 0 ? matches.join(", ") : MISSING_SENTINEL;
}

function detectBudget(rawText: string): string {
  const match = rawText.match(/(?:₩|KRW|USD|\$|budget[:\s]+)\s*([\d,]+(?:\.\d+)?[kmKM]?)/i);
  if (match) return match[0].trim();
  return MISSING_SENTINEL;
}

function detectField(text: string, keywords: string[]): string {
  for (const kw of keywords) {
    const idx = text.indexOf(kw);
    if (idx !== -1) {
      const snippet = text.slice(idx, idx + 60).split(/[\n.]/)[0].trim();
      return snippet;
    }
  }
  return MISSING_SENTINEL;
}
