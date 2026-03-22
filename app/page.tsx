import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingCtaButton } from "@/components/landing/LandingCtaButton";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { LandingProductMockup } from "@/components/landing/LandingProductMockup";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { SiteFooter } from "@/components/SiteFooter";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  // 홈페이지는 브랜드명 앞, 서비스 설명 뒤 — 검색·직접 유입 모두 고려
  title: "DELO | 유튜버·인스타그램 크리에이터 브랜드 딜 관리",
  // 네이버 권고 80자 이내: 타겟(유튜버·인스타) → 핵심 기능 → 한 곳에서 순서
  description:
    "유튜버·인스타그램 크리에이터를 위한 AI 딜 관리 플랫폼. 브랜드 협찬 문의 분석, 견적 산출, 답장 초안, 계약 추적을 한 곳에서.",
  keywords: [
    "크리에이터 브랜드 딜 관리",
    "인플루언서 협찬 계약 관리",
    "브랜드 협찬 협상 도구",
    "유튜버 광고 단가 계산",
    "인스타그램 협찬 견적",
    "크리에이터 비즈니스 관리",
    "브랜드 문의 분석",
    "협찬 계약 체크리스트",
    "크리에이터 딜 추적",
    "DELO",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DELO | 유튜버·인스타그램 크리에이터 브랜드 딜 관리",
    description:
      "브랜드 협찬 문의 분석·견적·답장 초안·계약 관리를 한 곳에서. 에이전시 없이 혼자 운영하는 크리에이터를 위한 AI 딜 관리 플랫폼입니다.",
    type: "website",
    url: "/",
  },
  twitter: {
    title: "DELO | 유튜버·인스타그램 크리에이터 브랜드 딜 관리",
    description:
      "브랜드 협찬 문의를 AI가 분석하고 적정 견적과 답장 초안을 제안합니다. 계약 진행 상태까지 한 곳에서 관리. 무료로 시작하세요.",
  },
};

async function getDealsCount(): Promise<number | null> {
  try {
    const db = createAdminClient();
    const { count } = await db
      .from("deals")
      .select("id", { count: "exact", head: true });
    return count ?? null;
  } catch {
    return null;
  }
}

const PROBLEM_CARDS = [
  {
    emoji: "💸",
    tag: "수익 손실",
    barFrom: "from-amber-400",
    barTo: "to-orange-400",
    tagBg: "bg-amber-400/10",
    tagText: "text-amber-400",
    iconBg: "bg-amber-400/10",
    impactText: "text-amber-400/90",
    title: "견적이 매번 감으로 정해집니다",
    quote: "\"이 정도 받아도 되는 건지... 일단 보내자\"",
    desc: "같은 채널 규모라도 그날의 상황과 문의 내용에 따라 제시 금액이 달라집니다. 단가 기준이 없으면 브랜드가 먼저 협상 앵커를 설정하고, 그 범위 안에서 협상이 진행됩니다.",
    impact: "비슷한 조건에서 20–40% 낮은 단가를 수락하는 일이 반복됩니다.",
  },
  {
    emoji: "📋",
    tag: "계약 리스크",
    barFrom: "from-rose-400",
    barTo: "to-red-400",
    tagBg: "bg-rose-400/10",
    tagText: "text-rose-400",
    iconBg: "bg-rose-400/10",
    impactText: "text-rose-400/90",
    title: "계약 조건을 나중에서야 알게 됩니다",
    quote: "\"수정 횟수 제한이 있었나? 유통 기간이 무기한이었어?\"",
    desc: "콘텐츠 사용 범위, 수정 횟수, 대금 지급 일정은 한 항목만 빠져도 분쟁의 원인이 됩니다. 문의 단계에서 확인하지 않으면 계약서 서명 이후에야 알게 됩니다.",
    impact: "누락된 조항 하나가 추가 작업 요청 또는 수익 반환 상황으로 이어집니다.",
  },
  {
    emoji: "🗂️",
    tag: "운영 비효율",
    barFrom: "from-sky-400",
    barTo: "to-blue-400",
    tagBg: "bg-sky-400/10",
    tagText: "text-sky-400",
    iconBg: "bg-sky-400/10",
    impactText: "text-sky-400/90",
    title: "후속 관리가 여러 곳에 흩어집니다",
    quote: "\"어디까지 얘기했더라... DM인지 이메일인지, 메모는 어디 있지\"",
    desc: "조건 논의는 DM, 납품 일정은 캘린더, 진행 상태는 노션 메모 — 채널이 분산되면 마감이나 미결 항목을 놓치기 쉽습니다. 동시에 3건만 진행해도 관리 한계에 닿습니다.",
    impact: "추적이 안 되는 딜은 흐지부지 종료되거나 계약 이후 분쟁이 생깁니다.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    badge: "붙여넣기만",
    outcomeBg: "bg-violet-400/10",
    outcomeText: "text-violet-400",
    outcome: "문의 조건 파악 준비 완료",
    title: "문의 내용을 그대로 붙여넣습니다",
    desc: "이메일·DM·카카오톡 어떤 채널이든 상관없습니다. 특별한 형식이나 템플릿 없이, 받은 문의 원문을 복사해 붙여넣으면 됩니다.",
    example: "\"안녕하세요, 신제품 런칭 캠페인 협업을 제안드립니다.\n유튜브 영상 1편, 유통 90일, 보상 협의 예정입니다.\"",
  },
  {
    step: "02",
    badge: "30초 이내",
    outcomeBg: "bg-indigo-400/10",
    outcomeText: "text-indigo-400",
    outcome: "견적 범위·미확인 항목 즉시 정리",
    title: "AI가 조건을 정리하고 견적을 제안합니다",
    desc: "브랜드명·요청 산출물·일정·보상 조건·콘텐츠 사용 범위를 자동으로 구조화합니다. 누락되거나 불명확한 항목은 별도로 표시해 협상 전에 확인할 수 있게 합니다.",
    example: "콘텐츠 1편 · 유통 90일 · 수정 2회\n적정 범위 ₩800,000 – ₩1,200,000\n⚠ 대금 지급 일정 미확인",
  },
  {
    step: "03",
    badge: "즉시 활용",
    outcomeBg: "bg-blue-400/10",
    outcomeText: "text-blue-400",
    outcome: "딜 저장 후 진행 상태 추적",
    title: "답장 초안을 골라 바로 보냅니다",
    desc: "분석 결과와 크리에이터 프로필을 바탕으로 3가지 톤의 답장 초안이 즉시 생성됩니다. 수정하거나 복사해 바로 사용할 수 있고, 딜로 저장해 이후 진행 상태를 추적합니다.",
    example: "정중한 수락 · 빠른 확인 요청 · 협상 제안\n3가지 톤 중 상황에 맞는 초안 선택",
  },
];

const COMPARISON_ROWS = [
  {
    emoji: "🔍",
    feature: "브랜드 문의 분석",
    agency: "직접 읽고 중요 항목 추려내기",
    delo: "핵심 조건·누락 항목 30초 내 구조화",
  },
  {
    emoji: "💰",
    feature: "적정 견적 산정",
    agency: "비슷한 케이스 기억에 의존",
    delo: "채널 규모·산출물 기반 범위 자동 제안",
  },
  {
    emoji: "✍️",
    feature: "응답 초안 작성",
    agency: "매번 처음부터 문장 작성",
    delo: "상황별 3가지 톤 초안 즉시 생성",
  },
  {
    emoji: "📊",
    feature: "계약 진행 관리",
    agency: "노션·메신저·캘린더 따로 확인",
    delo: "딜 상태·히스토리를 한 화면에서",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      // 서비스 정의: AI 검색이 가장 먼저 인용하는 핵심 질문
      "@type": "Question",
      name: "DELO는 어떤 서비스인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DELO는 유튜버·인스타그램·틱톡 크리에이터가 브랜드 협찬 문의를 AI로 분석하고, 적정 견적을 산출하며, 계약 진행 상태를 관리할 수 있는 딜 관리 플랫폼입니다. 에이전시 없이 혼자 브랜드 딜을 운영하는 크리에이터를 위해 설계되었으며, 문의 분석부터 답장 초안 생성, 계약 히스토리 추적까지 한 화면에서 처리할 수 있습니다.",
      },
    },
    {
      // 기능 설명: 가장 많이 검색되는 주요 기능 질문
      "@type": "Question",
      name: "브랜드 협찬 문의 분석이란 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "브랜드 협찬 문의 분석은 이메일·인스타그램 DM·카카오톡 등으로 받은 협찬 제안 텍스트를 AI가 읽고, 브랜드명·담당자·요청 산출물(유튜브 영상, 인스타 릴스 등)·일정·보상 조건·콘텐츠 사용 범위 같은 핵심 항목을 자동으로 구조화하는 기능입니다. 누락되거나 불명확한 조건도 함께 체크해 협상 전 확인해야 할 항목을 알려줍니다.",
      },
    },
    {
      // 견적 로직: 크리에이터가 가장 궁금해하는 부분
      "@type": "Question",
      name: "견적은 어떤 기준으로 계산되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DELO는 크리에이터가 설정한 구독자 수 구간, 평균 조회수, 콘텐츠 니치, 주요 활동 플랫폼, 설정한 최소 단가(Floor Rate)를 기준으로 삼고, 분석된 문의의 요청 산출물 종류와 수량을 반영해 Floor(최솟값)·Target(적정값)·Premium(최댓값) 세 단계 견적을 제시합니다. AI 자동 산출 결과이므로 실제 협상의 참고 자료로 활용하고, 최종 견적은 크리에이터가 직접 판단하는 것을 권장합니다.",
      },
    },
    {
      // 플랫폼 범위: 실사용자 진입 장벽 관련 질문
      "@type": "Question",
      name: "어떤 채널로 받은 문의를 분석할 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "이메일, 인스타그램 DM, 유튜브 커뮤니티, 카카오톡 등 텍스트로 전달된 문의라면 채널에 관계없이 분석할 수 있습니다. 문의 내용을 그대로 복사해 붙여넣으면 되며, 특정 형식이나 템플릿이 필요하지 않습니다.",
      },
    },
    {
      // 가격·플랜: 전환 의도 검색어에 직접 대응
      "@type": "Question",
      name: "무료로 사용할 수 있나요? 유료 플랜과 차이는 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네, 무료(Free) 플랜으로 시작할 수 있습니다. 무료 플랜은 월 5회 문의 분석, 딜 10건 저장, 기본 견적 산출, 정중한 톤의 답장 초안 1가지를 제공합니다. Standard 플랜(월 12,900원)은 무제한 문의 분석, 딜 무제한 저장, 3가지 톤(정중·빠른 확인·협상 제안) 답장 초안, 스마트 계약 체크리스트, 딜 파이프라인 관리, 마감 임박 및 미결 항목 실시간 알림을 추가로 제공합니다.",
      },
    },
    {
      // 접근성: 가입 전 체험 관련 — 전환율에 직접 영향
      "@type": "Question",
      name: "회원가입 없이도 사용할 수 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네. DELO의 문의 분석 기능은 delo-app.com/parse에서 회원가입 없이 무료로 체험할 수 있습니다. 다만 분석 결과 저장, 딜 히스토리 관리, 딜 파이프라인 추적, 답장 초안 수정 저장 등 개인화 기능은 계정 생성 후 이용 가능합니다.",
      },
    },
    {
      // 답장 초안: 핵심 기능 상세 설명
      "@type": "Question",
      name: "답장 초안 기능은 어떻게 작동하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "분석된 문의 내용과 크리에이터 프로필(구독자 규모, 니치, 플랫폼 등)을 바탕으로 상황에 맞는 답장 초안을 자동 생성합니다. 무료 플랜은 정중한 답장 1가지를 제공하며, Standard 플랜은 정중한 답장·빠른 확인 요청·협상 제안 등 3가지 톤을 제공합니다. 생성된 초안은 직접 수정하고 저장할 수 있으며, 복사해서 바로 사용하거나 참고 자료로 활용할 수 있습니다.",
      },
    },
    {
      // 딜 파이프라인: Standard 플랜 핵심 기능 설명
      "@type": "Question",
      name: "딜 파이프라인 관리란 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "분석한 문의를 딜로 저장하고 Lead(문의 접수)→Replied(회신 완료)→Negotiating(협상 중)→Confirmed(확정)→Delivered(납품 완료)→Paid(정산 완료) 단계로 진행 상태를 추적하는 기능입니다. 마감 임박 딜과 미결 체크리스트 항목을 알림으로 확인할 수 있습니다(Standard 플랜). 여러 브랜드 딜을 동시에 진행할 때 상태를 한눈에 파악하고 관리 누락을 줄이는 데 도움을 줍니다.",
      },
    },
    {
      // 데이터 보안: 신뢰도 구축 — GEO에서 중요하게 다루는 항목
      "@type": "Question",
      name: "입력한 문의 내용은 어떻게 관리되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "로그인 사용자의 분석 결과는 계정에 암호화되어 저장되며 본인만 조회할 수 있습니다. 비로그인 상태에서 분석한 문의는 서버에 개인 식별 정보와 연결되어 저장되지 않습니다. LLM 분석 과정에서는 입력 텍스트의 해시값을 활용한 캐시 처리로 동일 문의의 불필요한 재처리를 방지하며, 원문은 로그에 기록되지 않습니다.",
      },
    },
  ],
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://delo-app.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${APP_URL}/#software`,
  name: "DELO",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: APP_URL,
  datePublished: "2025-01-01",
  dateModified: "2026-03-22",
  screenshot: {
    "@type": "ImageObject",
    url: `${APP_URL}/opengraph-image`,
    width: 1200,
    height: 630,
  },
  description:
    "유튜버·인스타그램·틱톡 크리에이터를 위한 브랜드 협찬 딜 관리 플랫폼. 문의 분석, 견적 산출, 답장 초안 생성, 계약 진행 관리를 한 곳에서 처리합니다.",
  inLanguage: "ko",
  publisher: {
    "@id": `${APP_URL}/#organization`,
  },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "12900",
    priceCurrency: "KRW",
    offerCount: "2",
    offers: [
      {
        "@type": "Offer",
        name: "Free 플랜",
        price: "0",
        priceCurrency: "KRW",
        availability: "https://schema.org/OnlineOnly",
        url: `${APP_URL}/signup`,
        description: "월 5회 문의 분석, 딜 10개 저장, 기본 견적 산출, 답장 초안 1가지 제공",
      },
      {
        "@type": "Offer",
        name: "Standard 플랜",
        price: "12900",
        priceCurrency: "KRW",
        availability: "https://schema.org/OnlineOnly",
        url: `${APP_URL}/signup`,
        description:
          "무제한 문의 분석, 딜 무제한 저장, 답장 초안 3가지 톤, 스마트 체크리스트, 딜 파이프라인 관리, 실시간 알림 제공",
      },
    ],
  },
  featureList: [
    "브랜드 협찬 문의 AI 분석",
    "구독자·조회수 기반 적정 견적 범위 산출",
    "3가지 톤 답장 초안 자동 생성",
    "계약 체크리스트 자동 추출",
    "딜 파이프라인 상태 관리",
    "마감 임박 및 미결 항목 알림",
  ],
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dealsCount = await getDealsCount();

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)] antialiased transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Nav — theme-aware backdrop */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--landing-border)] bg-[color:var(--landing-nav-bg)] backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fox-icon.svg" width={30} height={30} alt="DELO 로고" priority />
            <span className="text-xl font-black tracking-tight">DELO</span>
          </Link>
          <div className="flex items-center gap-6">
            <LandingThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--landing-accent-soft)] text-sm font-bold text-[var(--landing-accent)]">
                  {(user.email ?? "??").slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-[var(--landing-muted)]">{user.email}</span>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-accent)]"
              >
                로그인
              </Link>
            )}
            {user ? (
              <LandingCtaButton
                href="/dashboard"
                variant="primary"
                label="대시보드"
                event="landing_cta_clicked"
                eventProps={{ cta: "dashboard_nav" }}
              />
            ) : (
              <LandingCtaButton
                href="/parse"
                variant="primary"
                label="무료로 시작하기"
                event="landing_cta_clicked"
                eventProps={{ cta: "signup_nav" }}
              />
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
          {/* ── Dark mode aurora ── */}
          <div className="dark-only-glow pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {/* 중앙 코어 */}
            <div className="absolute left-1/2 top-1/2 h-[560px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366F1]/45 blur-[60px] animate-float" />
            {/* 우상단 바이올렛 */}
            <div className="absolute -right-10 top-[-60px] h-[480px] w-[480px] rounded-full bg-violet-500/35 blur-[55px] animate-drift" />
            {/* 좌하단 퍼플 */}
            <div className="absolute -left-10 bottom-[-40px] h-[420px] w-[420px] rounded-full bg-purple-600/30 blur-[55px] animate-drift" style={{ animationDelay: "6s" }} />
            {/* 우하단 인디고 */}
            <div className="absolute right-1/3 bottom-10 h-[320px] w-[320px] rounded-full bg-indigo-400/20 blur-[45px]" />
          </div>
          {/* ── Light mode glow ── */}
          <div className="light-only-glow pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[560px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/35 blur-[60px] animate-float" />
            <div className="absolute -right-10 top-[-60px] h-[480px] w-[480px] rounded-full bg-violet-400/25 blur-[55px] animate-drift" />
          </div>
          {/* Bottom vignette */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--landing-bg)] to-transparent" />

          <div className="mx-auto w-full max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
              {/* Left: text content */}
              <div className="text-center md:text-left">
                {dealsCount !== null && dealsCount > 0 && (
                  <p className="mb-6 inline-block rounded-full bg-[var(--landing-accent-soft)] px-4 py-1.5 text-xs font-medium text-[var(--landing-accent)]">
                    지금까지 {dealsCount.toLocaleString("ko-KR")}건의 딜을 관리했어요
                  </p>
                )}

                {/* Trust badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--landing-accent)]/25 bg-[var(--landing-accent-soft)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--landing-accent)]">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--landing-accent)]" />
                  크리에이터를 위한 AI 딜 관리 플랫폼
                </div>

                <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                  크리에이터 딜 운영,
                  <br />
                  <span className="text-gradient">DELO가</span> 정리합니다
                </h1>
                <p className="mb-4 text-sm font-medium text-[var(--landing-muted)] transition-colors">
                  월 2~5건 협찬 문의를 직접 처리하는 크리에이터를 위한 도구입니다
                </p>
                <p className="mb-10 text-lg leading-relaxed text-[var(--landing-muted)] transition-colors">
                  브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지.
                  <br className="hidden md:block" />
                  에이전시 없이도 운영 흐름을 빠르게 정리할 수 있습니다.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
                  <LandingCtaButton
                    href={user ? "/dashboard" : "/parse"}
                    variant="primary"
                    label="직접 써보기"
                    event="landing_cta_clicked"
                    eventProps={{ cta: "signup" }}
                  />
                  <LandingCtaButton
                    href="/how-it-works"
                    variant="secondary"
                    label="어떻게 작동하나요?"
                    event="landing_cta_clicked"
                    eventProps={{ cta: "how_it_works" }}
                  />
                </div>

                {/* Social proof */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--landing-muted)] md:justify-start">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[var(--landing-accent)]">✓</span> 무료로 시작
                  </span>
                  <span className="h-4 w-px bg-[var(--landing-border)]" />
                  <span className="flex items-center gap-1.5">
                    <span className="text-[var(--landing-accent)]">✓</span> 신용카드 불필요
                  </span>
                  <span className="h-4 w-px bg-[var(--landing-border)]" />
                  <span className="flex items-center gap-1.5">
                    <span className="text-[var(--landing-accent)]">✓</span> 30초 내 분석 완료
                  </span>
                </div>
              </div>

              {/* Right: product mockup (desktop only) */}
              <div className="hidden md:block">
                <LandingProductMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem cards ── */}
        <section className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="mb-5 text-center">
                <span className="inline-block rounded-full bg-rose-400/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-400">
                  에이전시 없이 혼자 운영하는 현실
                </span>
              </div>
              <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
                혼자 운영하면 자주 생기는 문제
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <p className="mb-16 text-center text-sm leading-relaxed text-[var(--landing-muted)] transition-colors">
                월 2–5건 협찬을 직접 처리하는 크리에이터들이 공통적으로 겪는 3가지 패턴입니다.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PROBLEM_CARDS.map(({ emoji, tag, barFrom, barTo, tagBg, tagText, iconBg, impactText, title, quote, desc, impact }, index) => (
                <ScrollReveal key={title} index={index} total={PROBLEM_CARDS.length} stagger={140}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.13)] hover:border-[var(--landing-accent)]/20">
                    {/* Top accent bar — brightens on hover */}
                    <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${barFrom} ${barTo} opacity-50 transition-opacity duration-300 group-hover:opacity-100`} />

                    <div className="flex flex-1 flex-col p-7 pt-8">
                      {/* Header */}
                      <div className="mb-6 flex items-start justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
                          {emoji}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tagBg} ${tagText}`}>
                          {tag}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-4 text-[1.05rem] font-bold leading-snug">{title}</h3>

                      {/* Quote */}
                      <blockquote className="mb-4 rounded-lg bg-[var(--landing-bg)] px-4 py-3 text-sm italic leading-relaxed text-[var(--landing-muted)] transition-colors">
                        {quote}
                      </blockquote>

                      {/* Description */}
                      <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--landing-muted)] transition-colors">
                        {desc}
                      </p>

                      {/* Impact line */}
                      <div className="border-t border-[var(--landing-border)] pt-4 transition-colors">
                        <p className={`text-xs font-medium leading-relaxed ${impactText}`}>
                          → {impact}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Section connector */}
            <ScrollReveal delay={500} variant="fade-in">
              <div className="mt-14 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--landing-border)]" />
                <Link
                  href="#how-it-works"
                  className="flex items-center gap-2 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] px-5 py-2.5 text-xs font-medium text-[var(--landing-muted)] transition-all duration-200 hover:border-[var(--landing-accent)]/40 hover:text-[var(--landing-accent)]"
                >
                  DELO가 이 3가지를 어떻게 해결하는지 보기
                  <span className="text-[var(--landing-accent)]">↓</span>
                </Link>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--landing-border)]" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="bg-[var(--landing-bg)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="mb-5 text-center">
                <span className="inline-block rounded-full bg-[var(--landing-accent-soft)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--landing-accent)]">
                  3단계로 끝납니다
                </span>
              </div>
              <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
                DELO는 이렇게 작동합니다
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <p className="mb-4 text-center text-sm leading-relaxed text-[var(--landing-muted)] transition-colors">
                문의 접수부터 답장 초안까지, 별도 설정 없이 바로 시작합니다.
              </p>
              <div className="mb-20 text-center">
                <Link
                  href="/how-it-works"
                  className="text-sm font-medium text-[var(--landing-accent)] transition-colors hover:underline"
                >
                  전체 작동 방식 자세히 보기 →
                </Link>
              </div>
            </ScrollReveal>
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-start">
              {HOW_IT_WORKS.map(({ step, badge, outcomeBg, outcomeText, outcome, title, desc, example }, index) => (
                <Fragment key={step}>
                  <ScrollReveal
                    className="flex-1 w-full"
                    index={index}
                    total={HOW_IT_WORKS.length}
                    stagger={170}
                    variant={index === 0 ? "slide-left" : index === 2 ? "slide-right" : "fade-up"}
                  >
                    <div className="group flex h-full flex-col rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-[var(--landing-accent)]/25">
                      {/* Step header */}
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--landing-accent)] to-indigo-500 text-sm font-bold text-white shadow-lg shadow-[var(--landing-accent)]/30 transition-transform duration-300 group-hover:scale-110">
                          {step}
                        </div>
                        <span className="rounded-full bg-[var(--landing-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--landing-accent)]">
                          {badge}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="mb-3 text-[1.05rem] font-bold leading-snug">{title}</h3>
                      <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--landing-muted)] transition-colors">
                        {desc}
                      </p>

                      {/* Example preview */}
                      <div className="mb-5 rounded-xl border border-[var(--landing-accent)]/15 bg-[var(--landing-accent)]/5 px-4 py-3 transition-colors">
                        <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--landing-muted)]">
                          {example}
                        </p>
                      </div>

                      {/* Outcome chip */}
                      <div className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${outcomeBg} ${outcomeText}`}>
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                        {outcome}
                      </div>
                    </div>
                  </ScrollReveal>

                  {index < HOW_IT_WORKS.length - 1 && (
                    <ScrollReveal className="hidden md:block flex-shrink-0 w-16 self-center" delay={index * 170 + 140} variant="fade-in">
                      <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-[var(--landing-accent)]/15">
                        <div
                          className="animate-flow-right absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--landing-accent)] to-transparent"
                          style={{ animationDelay: `${index * 0.5}s` }}
                        />
                      </div>
                    </ScrollReveal>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison ── */}
        <section className="border-y border-[var(--landing-border)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal>
              <div className="mb-5 text-center">
                <span className="inline-block rounded-full bg-rose-400/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-400">
                  수작업과 비교
                </span>
              </div>
              <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
                수작업 대신 DELO가 맡는 일
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <p className="mb-4 text-center text-sm leading-relaxed text-[var(--landing-muted)] transition-colors">
                반복되는 수작업을 줄이고, 판단이 필요한 부분에만 집중할 수 있습니다.
              </p>
              <div className="mb-16 text-center">
                <Link
                  href="/parse"
                  className="text-sm font-medium text-[var(--landing-accent)] transition-colors hover:underline"
                >
                  브랜드 협찬 문의 AI 분석 직접 해보기 →
                </Link>
              </div>
            </ScrollReveal>

            {/* Column headers */}
            <ScrollReveal delay={120} variant="fade-in">
              <div className="mb-3 hidden grid-cols-12 px-5 md:grid">
                <div className="col-span-4" />
                <div className="col-span-4 pr-6">
                  <div className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-400/5 py-2 text-xs font-semibold text-rose-400/80">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400/15 text-[9px]">✕</span>
                    기존 수작업
                  </div>
                </div>
                <div className="col-span-4 pl-6">
                  <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--landing-accent)]/25 bg-[var(--landing-accent-soft)] py-2 text-xs font-semibold text-[var(--landing-accent)]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--landing-accent)]/20 text-[9px]">✓</span>
                    DELO
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {COMPARISON_ROWS.map(({ emoji, feature, agency, delo }, index) => (
                <ScrollReveal key={feature} index={index} total={COMPARISON_ROWS.length} stagger={90}>
                  <div className="group grid grid-cols-12 items-center rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5 transition-all duration-200 hover:border-[var(--landing-accent)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                    {/* Feature */}
                    <div className="col-span-12 mb-4 flex items-center gap-3 md:col-span-4 md:mb-0">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--landing-icon-bg)] text-base">
                        {emoji}
                      </div>
                      <span className="text-sm font-bold">{feature}</span>
                    </div>
                    {/* Before */}
                    <div className="col-span-6 border-r border-[var(--landing-border)] pr-6 md:col-span-4">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-rose-400/15 text-[9px] font-bold text-rose-400">✕</span>
                        <span className="text-sm leading-snug text-[var(--landing-muted)] transition-colors">{agency}</span>
                      </div>
                    </div>
                    {/* After */}
                    <div className="col-span-6 pl-6 md:col-span-4">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-[9px] font-bold text-emerald-400">✓</span>
                        <span className="text-sm font-semibold leading-snug text-[var(--landing-accent)]">{delo}</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="relative overflow-hidden bg-[var(--landing-surface)] px-6 py-[120px] text-center transition-colors">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--landing-accent)]/8 blur-[80px]" />
          </div>

          <div className="mx-auto max-w-3xl">
            <ScrollReveal variant="fade-in">
              <div className="mb-10 h-px bg-gradient-to-r from-transparent via-[var(--landing-accent)]/35 to-transparent" />
            </ScrollReveal>

            <ScrollReveal variant="scale-up" delay={80}>
              <div className="mb-6 inline-block rounded-full bg-[var(--landing-accent-soft)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--landing-accent)]">
                무료로 시작
              </div>
              <h2 className="mb-5 text-3xl font-bold leading-tight md:text-5xl">
                첫 번째 브랜드 문의부터<br className="hidden md:block" /> 정리해보세요
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={180}>
              <p className="mb-3 text-base leading-relaxed text-[var(--landing-muted)] transition-colors md:text-lg">
                문의 원문을 붙여넣으면 30초 안에 조건 정리, 견적 범위, 답장 초안이 준비됩니다.
              </p>
              <p className="mb-10 text-sm text-[var(--landing-muted)]/70 transition-colors">
                회원가입 없이 바로 체험 가능 — 신용카드 불필요
              </p>
            </ScrollReveal>

            <ScrollReveal delay={280}>
              <LandingCtaButton
                href={user ? "/dashboard" : "/parse"}
                variant="primary"
                label="무료로 시작하기"
                event="landing_cta_clicked"
                eventProps={{ cta: "signup_closing" }}
              />
            </ScrollReveal>

            <ScrollReveal delay={380}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-[var(--landing-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> 회원가입 없이 체험 가능
                </span>
                <span className="h-3 w-px bg-[var(--landing-border)]" />
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> 신용카드 불필요
                </span>
                <span className="h-3 w-px bg-[var(--landing-border)]" />
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> 30초 내 분석 완료
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <SiteFooter />

    </div>
  );
}
