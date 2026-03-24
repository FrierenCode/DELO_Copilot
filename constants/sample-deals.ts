import type { DealStatus } from "@/types/deal";

export type SampleDeal = {
  id: string;
  brand_name: string;
  contact_channel: string;
  status: DealStatus;
  quote_target: number;
  next_action: string;
  created_at: string;
};

export function getSampleDeals(): SampleDeal[] {
  const ago = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  return [
    {
      id: "sample-1",
      brand_name: "글로시에이션",
      contact_channel: "인스타그램 DM",
      status: "Lead",
      quote_target: 200000,
      next_action: "견적 회신 대기",
      created_at: ago(3),
    },
    {
      id: "sample-2",
      brand_name: "그린팜",
      contact_channel: "이메일",
      status: "Negotiating",
      quote_target: 350000,
      next_action: "단가 협상 중",
      created_at: ago(7),
    },
    {
      id: "sample-3",
      brand_name: "링크플로우",
      contact_channel: "카카오톡",
      status: "Confirmed",
      quote_target: 500000,
      next_action: "계약서 검토",
      created_at: ago(14),
    },
  ];
}
