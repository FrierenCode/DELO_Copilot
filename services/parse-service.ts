import { inquirySchema } from "@/schemas/inquiry.schema";
import type { InquiryData } from "@/types/inquiry";

export async function parseService(raw_text: string): Promise<InquiryData> {
  const parsed = inquirySchema.parse({
    brand_name: "Unknown Brand",
    contact_name: "Unknown Contact",
    contact_channel: "email",
    platform_requested: "instagram",
    deliverables: "1 post",
    timeline: "TBD",
    compensation_type: "negotiable",
    budget_mentioned: "not specified",
    usage_rights: "not specified",
    exclusivity: "not specified",
    revisions: "not specified",
    payment_terms: "not specified",
  });

  if (raw_text.trim().length === 0) {
    return parsed;
  }

  return {
    ...parsed,
    contact_channel: "email",
  };
}
