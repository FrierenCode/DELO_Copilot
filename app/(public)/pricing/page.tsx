import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PLAN_POLICIES } from "@/lib/plan-policy";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { SiteFooter } from "@/components/SiteFooter";
import { PlanCard, type PlanFeature } from "@/components/pricing/plan-card";

export const metadata: Metadata = {
  title: "DELO 가격 | 무료로 시작, 스탠다드로 확장",
  description:
    "DELO 플랜 안내. 무료 플랜으로 브랜드 딜 관리를 시작하고, Standard 플랜으로 문의 분석 무제한·협상 AI·미응답 알림을 사용하세요. 월 12,900원, 언제든 취소 가능.",
  keywords: [
    "DELO 가격",
    "크리에이터 딜 관리 요금제",
    "브랜드 협찬 관리 플랜",
    "인플루언서 도구 가격",
    "DELO Standard 플랜",
  ],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "DELO 가격 | 무료로 시작, 스탠다드로 확장",
    description:
      "무료 플랜으로 브랜드 딜 관리를 시작하고, Standard 플랜(월 12,900원)으로 문의 분석 무제한·협상 AI·미응답 알림을 사용하세요.",
    type: "website",
    url: "/pricing",
  },
  twitter: {
    title: "DELO 가격 | 무료로 시작, 스탠다드로 확장",
    description:
      "DELO 플랜 비교. 무료 플랜 → Standard(월 12,900원). 기획사 월 30~60만원 대신 12,900원으로 딜 운영 전체를 자동화.",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://delo-app.com";

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${APP_URL}/pricing`,
  url: `${APP_URL}/pricing`,
  name: "DELO 가격",
  description: "DELO 플랜 및 가격 안내",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${APP_URL}/` },
      { "@type": "ListItem", position: 2, name: "가격", item: `${APP_URL}/pricing` },
    ],
  },
};

const FAQ_ITEMS = [
  {
    q: "언제든 취소할 수 있나요?",
    a: "네. Standard 플랜은 구독 기반이며 언제든 해지할 수 있습니다. 해지 후에도 현재 결제 기간이 끝날 때까지 Standard 기능을 사용할 수 있습니다.",
  },
  {
    q: "무료 플랜에 기간 제한이 있나요?",
    a: "아니요. 무료 플랜은 기간 제한 없이 영구적으로 사용할 수 있습니다. 월 문의 분석 횟수와 딜 저장 한도 내에서 계속 이용하실 수 있습니다.",
  },
  {
    q: "환불 정책이 어떻게 되나요?",
    a: "결제일로부터 7일 이내 미사용 시 전액 환불이 가능합니다. 환불 문의는 이용약관 페이지 내 연락처로 보내주세요.",
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const free = PLAN_POLICIES.free;

  const freeFeatures: PlanFeature[] = [
    { text: `문의 분석 월 ${free.parse_per_month}건`, included: true },
    { text: `딜 저장 ${free.deal_save_limit}건`, included: true },
    { text: "기본 체크리스트", included: true },
    { text: "답장 초안 (정중한 톤)", included: true },
    { text: "협상 AI", included: false },
    { text: "미응답 알림", included: false },
    { text: "도용 탐지", included: false },
  ];

  const standardFeatures: PlanFeature[] = [
    { text: "문의 분석 무제한", included: true },
    { text: "딜 저장 무제한", included: true },
    { text: "스마트 체크리스트 전체", included: true },
    { text: "답장 초안 3가지 톤 (정중·빠른확인·협상)", included: true },
    { text: "협상 AI 무제한", included: true },
    { text: "미응답 알림 (7일)", included: true },
    { text: "도용 탐지 기본", included: true },
  ];

  return (
    <div
      className="parse-page min-h-screen"
      style={{ backgroundColor: "var(--p-bg)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ backgroundColor: "var(--p-glow)" }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: "var(--p-nav-bg)",
          boxShadow: "var(--p-nav-shadow)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fox-icon.svg" width={26} height={26} alt="DELO" priority />
            <span
              className="text-lg font-black tracking-tighter"
              style={{ color: "var(--p-primary)" }}
            >
              DELO
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LandingThemeToggle />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95 text-white"
                style={{ background: "var(--p-btn-gradient)" }}
              >
                대시보드
              </Link>
            ) : (
              <Link
                href="/signup"
                className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95 text-white"
                style={{ background: "var(--p-btn-gradient)" }}
              >
                무료로 시작하기
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-4xl px-6 pb-24 pt-14">
        {/* Header */}
        <header className="mb-14 text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              backgroundColor: "var(--p-secondary-badge-bg)",
              borderColor: "var(--p-secondary-badge-bd)",
            }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "var(--p-secondary)" }}
            >
              ✦ PRICING
            </span>
          </div>
          <h1
            className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl"
            style={{ color: "var(--p-text)" }}
          >
            에이전시 대신 12,900원
          </h1>
          <p
            className="mx-auto max-w-xl text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--p-muted)" }}
          >
            기획사 월 30~60만원짜리 딜 관리를, 혼자서 월 12,900원에.
            <br className="hidden sm:block" />
            무료 플랜으로 지금 바로 시작할 수 있습니다.
          </p>
        </header>

        {/* Plan cards */}
        <div className="mb-20 grid gap-6 sm:grid-cols-2 sm:items-start">
          <PlanCard
            name="Free"
            price="₩0"
            priceNote="/ 영구 무료"
            description="브랜드 딜 관리를 처음 시작하는 크리에이터에게 적합합니다."
            features={freeFeatures}
            ctaLabel="무료로 시작하기"
            ctaVariant="free"
            isLoggedIn={isLoggedIn}
          />
          <PlanCard
            name="Standard"
            price="₩12,900"
            priceNote="/ 월"
            description="딜이 늘어날수록 빛나는 플랜. 무제한으로 사용하고 협상 AI로 단가를 높이세요."
            badge="가장 인기"
            features={standardFeatures}
            ctaLabel="시작하기"
            ctaVariant="checkout"
            isLoggedIn={isLoggedIn}
            isHighlighted
          />
        </div>

        {/* Feature comparison table (mobile-friendly) */}
        <section className="mb-20">
          <h2
            className="mb-8 text-center text-2xl font-black"
            style={{ color: "var(--p-text)" }}
          >
            플랜 상세 비교
          </h2>
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--p-border)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-3 px-6 py-4"
              style={{ backgroundColor: "var(--p-surface-2)" }}
            >
              <span className="text-sm font-bold" style={{ color: "var(--p-muted)" }}>
                기능
              </span>
              <span
                className="text-center text-sm font-bold"
                style={{ color: "var(--p-text)" }}
              >
                Free
              </span>
              <span
                className="text-center text-sm font-bold"
                style={{ color: "var(--p-primary)" }}
              >
                Standard
              </span>
            </div>

            {/* Rows */}
            {[
              { feature: "문의 분석", free: `월 ${free.parse_per_month}건`, standard: "무제한" },
              { feature: "딜 저장", free: `${free.deal_save_limit}건`, standard: "무제한" },
              { feature: "답장 초안 톤", free: "1가지 (정중)", standard: "3가지" },
              { feature: "체크리스트", free: "기본", standard: "전체" },
              { feature: "협상 AI", free: "—", standard: "무제한" },
              { feature: "미응답 알림", free: "—", standard: "7일 기준" },
              { feature: "도용 탐지", free: "—", standard: "기본 제공" },
            ].map(({ feature, free: freeVal, standard }, i, arr) => (
              <div
                key={feature}
                className="grid grid-cols-3 px-6 py-3.5"
                style={{
                  backgroundColor: "var(--p-surface)",
                  borderTop: `1px solid var(--p-border)`,
                  ...(i === arr.length - 1 ? {} : {}),
                }}
              >
                <span className="text-sm" style={{ color: "var(--p-muted)" }}>
                  {feature}
                </span>
                <span
                  className="text-center text-sm"
                  style={{ color: freeVal === "—" ? "var(--p-dim)" : "var(--p-text)" }}
                >
                  {freeVal}
                </span>
                <span
                  className="text-center text-sm font-semibold"
                  style={{ color: "var(--p-primary)" }}
                >
                  {standard}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2
            className="mb-8 text-center text-2xl font-black"
            style={{ color: "var(--p-text)" }}
          >
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: "var(--p-surface)",
                  borderColor: "var(--p-border)",
                }}
              >
                <p
                  className="mb-2 text-sm font-bold"
                  style={{ color: "var(--p-text)" }}
                >
                  {q}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--p-muted)" }}
                >
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p
            className="mb-6 text-lg font-bold"
            style={{ color: "var(--p-text)" }}
          >
            지금 바로 무료로 시작해보세요
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-full px-8 py-4 text-sm font-black text-white transition-all hover:brightness-110 active:scale-95"
            style={{
              background: "var(--p-btn-gradient)",
              boxShadow: "var(--p-btn-shadow)",
            }}
          >
            무료 계정 만들기
          </Link>
          <p
            className="mt-4 text-xs"
            style={{ color: "var(--p-muted)" }}
          >
            신용카드 불필요 · 언제든 취소 가능
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
