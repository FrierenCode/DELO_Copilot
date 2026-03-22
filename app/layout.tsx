import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { RootNav } from "@/components/RootNav";
import { RootMain } from "@/components/RootMain";
import { CookieBanner } from "@/components/CookieBanner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://delo-app.com";

// Organization + WebSite 스키마: 사이트 전체에 적용되는 브랜드·구조 정보.
// @graph로 묶으면 Google이 두 엔티티 간 관계(publisher)를 명확히 파악할 수 있음.
// @id는 영구 식별자로, 다른 페이지 스키마에서 이 엔티티를 참조할 때 사용.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "DELO",
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/fox-icon.svg`,
        width: 48,
        height: 48,
      },
      description:
        "유튜버·인스타그램·틱톡 크리에이터를 위한 브랜드 협찬 딜 관리 플랫폼. 브랜드 문의 분석, 적정 견적 산출, 답장 초안 생성, 계약 진행 관리를 한 곳에서 제공합니다.",
      inLanguage: "ko",
      areaServed: "KR",
      sameAs: ["https://twitter.com/delo_app"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: "Korean",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      name: "DELO",
      url: APP_URL,
      inLanguage: "ko",
      description:
        "브랜드 협찬 문의 분석부터 견적 산출, 답장 초안, 계약 관리까지 한 곳에서 처리하는 크리에이터 AI 딜 관리 플랫폼",
      publisher: {
        "@id": `${APP_URL}/#organization`,
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "DELO | 크리에이터 딜 관리 플랫폼",
    template: "%s | DELO",
  },
  description:
    "브랜드 협찬 문의 분석부터 적정 견적 산출, 답장 초안 생성, 계약 진행 관리까지 한 곳에서 처리하는 크리에이터 AI 딜 관리 플랫폼입니다.",
  keywords: [
    "크리에이터 딜 관리",
    "인플루언서 계약 관리",
    "브랜드 협찬 협상",
    "유튜버 광고 견적 계산",
    "인스타그램 협찬 단가",
    "크리에이터 비즈니스 관리",
    "브랜드 문의 AI 분석",
    "협찬 계약 체크리스트",
    "DELO",
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DELO | Creator Deal Copilot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@delo_app",
    images: ["/opengraph-image"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : undefined,
  },
  // NaverBot: Naver 크롤러에게 전체 색인·링크 추적을 명시적으로 허용합니다.
  // robots.ts의 Yeti 규칙과 함께 사용하면 네이버 색인 신호가 명확해집니다.
  other: {
    NaverBot: "All",
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/*
         * paint 전에 동기적으로 실행 — useEffect보다 먼저 실행되어
         * 테마 flash(다크 → 라이트 깜빡임) 없이 저장된 테마를 복원합니다.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('landing-theme');if(t==='light')document.documentElement.classList.add('landing-light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PUBLIC_ENV__ = ${JSON.stringify(publicEnv)};`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {/*
         * RootNav hides itself on /dashboard/** routes (dashboard has its own sidebar).
         * RootMain removes the max-w-3xl constraint on /dashboard/** routes so the
         * dashboard layout can use the full viewport width.
         */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vyrdv3ew4m");
          `}
        </Script>
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
