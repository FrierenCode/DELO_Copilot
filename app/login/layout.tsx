import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "DELO 계정으로 로그인하고 브랜드 협찬 딜 관리를 시작하세요. Google·Discord 소셜 로그인 또는 이메일로 빠르게 접속할 수 있습니다.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
