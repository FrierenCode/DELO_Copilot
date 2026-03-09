export type ReplyTone = "polite" | "negotiation" | "quick";

export type ReplyDrafts = {
  polite: string;
  negotiation: string;
  quick: string;
};

export type ReplyTemplateInput = {
  brand_name: string;
  platform_requested: string;
  deliverables: string;
  missing_fields: string[];
  quote_target: number;
  contact_name: string;
  compensation_type: string;
  timeline: string;
  usage_rights: string;
  exclusivity: string;
};

export type ReplyStrategy = "template_only" | "mock_negotiation";

export type ReplyGenerationResult = {
  strategy: ReplyStrategy;
  drafts: ReplyDrafts;
};
