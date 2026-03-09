import type { ReplyStrategy } from "@/types/reply";

type RoutingInput = {
  missingFields: string[];
  quoteTarget: number;
  hasBudgetMentioned: boolean;
  hasUsageRights: boolean;
  hasExclusivity: boolean;
};

export function chooseReplyStrategy(input: RoutingInput): ReplyStrategy {
  if (input.missingFields.length >= 3) return "template_only";
  return "mock_negotiation";
}
