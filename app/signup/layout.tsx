import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 회원가입",
  description: "DELO에 무료로 가입하고 브랜드 협찬 문의 분석, 견적 산출, 답장 초안 생성을 바로 시작하세요. 신용카드 없이 무료 플랜으로 시작할 수 있습니다.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
