export type ReplyTone = "polite" | "negotiation" | "quick";

export type ReplyDrafts = {
  polite: string;
  /** null when user's plan does not include this tone */
  quick: string | null;
  /** null when user's plan does not include this tone */
  negotiation: string | null;
};

export type ReplyTemplateInput = {
  brand_name: string;
  platform_requested: string;
  deliverables: string;
  missing_fields: string[];
  quote_floor: number;
  quote_target: number;
  quote_premium: number;
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
