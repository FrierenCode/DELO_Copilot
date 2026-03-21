import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { RootNav } from "@/components/RootNav";
import { RootMain } from "@/components/RootMain";
import { CookieBanner } from "@/components/CookieBanner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://delo.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "DELO | 크리에이터 딜 관리 플랫폼",
    template: "%s | DELO",
  },
  description:
    "브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지 한 곳에서 처리하는 크리에이터 AI 딜 관리 플랫폼입니다.",
  keywords: [
    "크리에이터 딜 관리",
    "인플루언서 계약",
    "브랜드 협찬 협상",
    "유튜버 광고 견적",
    "크리에이터 에이전시",
    "DELO",
    "딜 코파일럿",
  ],
  authors: [{ name: "DELO" }],
  creator: "DELO",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "DELO",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@delo_app",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : undefined,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };

  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PUBLIC_ENV__ = ${JSON.stringify(publicEnv)};`,
          }}
        />
        {/*
         * RootNav hides itself on /dashboard/** routes (dashboard has its own sidebar).
         * RootMain removes the max-w-3xl constraint on /dashboard/** routes so the
         * dashboard layout can use the full viewport width.
         */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KG22W3GSS1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KG22W3GSS1');
          `}
        </Script>
        <RootNav />
        <RootMain>{children}</RootMain>
        <CookieBanner />
      </body>
    </html>
  );
}
