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
};

export type ReplyStrategy = "template_only" | "mock_negotiation";
