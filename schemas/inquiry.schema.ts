import { z } from "zod";

export const inquirySchema = z.object({
  brand_name: z.string(),
  contact_name: z.string(),
  contact_channel: z.string(),
  platform_requested: z.string(),
  deliverables: z.string(),
  timeline: z.string(),
  compensation_type: z.string(),
  budget_mentioned: z.string(),
  usage_rights: z.string(),
  exclusivity: z.string(),
  revisions: z.string(),
  payment_terms: z.string(),
});

export type InquirySchema = z.infer<typeof inquirySchema>;
