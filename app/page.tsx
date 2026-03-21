import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingCtaButton } from "@/components/landing/LandingCtaButton";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { LandingProductMockup } from "@/components/landing/LandingProductMockup";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "DELO | 크리에이터 딜 관리 플랫폼",
  description:
    "브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지 한 곳에서 처리하는 크리에이터 AI 딜 관리 플랫폼입니다. 에이전시 없이 혼자 운영하는 크리에이터를 위한 비즈니스 코파일럿.",
  keywords: [
    "크리에이터 딜 관리",
    "인플루언서 계약 관리",
    "브랜드 협찬 협상",
    "유튜버 광고 견적",
    "크리에이터 비즈니스",
    "브랜드 문의 분석",
    "DELO",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DELO | 크리에이터 딜 관리 플랫폼",
    description:
      "브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지. 에이전시 없이도 딜 운영 흐름을 빠르게 정리할 수 있습니다.",
    type: "website",
    url: "/",
  },
  twitter: {
    title: "DELO | 크리에이터 딜 관리 플랫폼",
    description:
      "브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지 한 곳에서. AI 크리에이터 딜 코파일럿.",
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
    title: "견적이 매번 감으로 정해집니다",
    quote: "\"이 정도 받아도 되는 건지... 그냥 보내자\"",
    desc: "비슷한 문의여도 금액 기준이 흔들리면 협상에서 계속 불리해집니다.",
  },
  {
    emoji: "📋",
    tag: "계약 리스크",
    title: "계약 조건을 자주 놓칩니다",
    quote: "\"수정 횟수 제한이 있었나? 유통 기간은?\"",
    desc: "사용권, 수정 횟수, 지급 일정 같은 핵심 항목 하나가 수익을 크게 바꿉니다.",
  },
  {
    emoji: "🗂️",
    tag: "운영 비효율",
    title: "후속 관리가 흩어집니다",
    quote: "\"어디까지 얘기했더라... DM인지 이메일인지\"",
    desc: "답변 이후 진행 상황이 DM, 메모, 캘린더로 분산되면 중요한 타이밍을 놓칩니다.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    badge: "붙여넣기만",
    title: "문의 내용을 붙여넣습니다",
    desc: "이메일, DM, 카카오톡 등 형식과 상관없이 원문 그대로 넣으면 됩니다.",
    example: "\"안녕하세요, 신제품 런칭 캠페인 관련해서 협업 제안드립니다. 콘텐츠 1개, 유통 90일...\"",
  },
  {
    step: "02",
    badge: "30초 이내",
    title: "AI가 구조화해서 분석합니다",
    desc: "조건을 정리하고 빠진 항목을 체크한 뒤, 적정 견적 범위를 계산합니다.",
    example: "콘텐츠 1개 · 유통 90일 · 수정 2회\n적정 범위 ₩800,000 ~ ₩1,200,000",
  },
  {
    step: "03",
    badge: "즉시 활용",
    title: "바로 응답을 준비합니다",
    desc: "상황별 초안과 체크리스트를 기반으로 바로 회신하거나 내부 검토를 진행할 수 있습니다.",
    example: "정중 · 협상 · 단호\n3가지 톤의 답장 초안 완성",
  },
] as const;

const COMPARISON_ROWS = [
  {
    emoji: "🔍",
    feature: "브랜드 문의 분석",
    agency: "내용을 직접 읽고 분류",
    delo: "핵심 조건·리스크 즉시 구조화",
  },
  {
    emoji: "💰",
    feature: "적정 견적 산정",
    agency: "경험과 감각에 의존",
    delo: "입력값 기반 범위 자동 제안",
  },
  {
    emoji: "✍️",
    feature: "응답 초안 작성",
    agency: "매번 처음부터 새로 작성",
    delo: "3가지 톤 초안 즉시 생성",
  },
  {
    emoji: "📊",
    feature: "계약 진행 관리",
    agency: "노션·메신저·캘린더 따로 확인",
    delo: "히스토리와 상태를 한 화면에",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DELO",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://delo.app",
  description:
    "브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지 한 곳에서 처리하는 크리에이터 AI 딜 관리 플랫폼입니다.",
  inLanguage: "ko",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
    description: "무료로 시작, 프리미엄 플랜 업그레이드 가능",
  },
  featureList: [
    "브랜드 문의 AI 분석",
    "적정 견적 범위 산정",
    "응답 초안 자동 생성",
    "딜 계약 진행 관리",
    "협상 AI 코파일럿",
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
          {/* Ambient glow — dark mode only */}
          <div className="dark-only-glow absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366F1]/10 blur-[140px] animate-float" />
            <div className="absolute right-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/6 blur-[100px]" />
            <div className="absolute bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-800/6 blur-[80px]" />
          </div>
          {/* Light mode subtle tint */}
          <div className="light-only-glow absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/60 blur-[140px]" />
          </div>

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
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
              혼자 운영하면 자주 생기는 문제
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PROBLEM_CARDS.map(({ emoji, tag, title, quote, desc }) => (
                <div
                  key={title}
                  className="card-hover relative rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8 transition-colors"
                >
                  {/* left accent bar */}
                  <div className="absolute left-0 top-8 h-12 w-1 rounded-r-full bg-gradient-to-b from-amber-400/70 to-orange-500/30" />
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-4xl">{emoji}</span>
                    <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                      {tag}
                    </span>
                  </div>
                  <p className="mb-4 text-sm italic text-[var(--landing-muted)] transition-colors">
                    {quote}
                  </p>
                  <h3 className="mb-3 text-xl font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--landing-muted)] transition-colors">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="bg-[var(--landing-bg)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-20 text-center text-3xl font-bold md:text-4xl">
              DELO는 이렇게 작동합니다
            </h2>
            <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
              {HOW_IT_WORKS.map(({ step, badge, title, desc, example }, index) => (
                <Fragment key={step}>
                  <div className="flex-1 rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 transition-colors">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--landing-accent)] to-indigo-500 text-sm font-bold text-white shadow-lg shadow-[var(--landing-accent)]/30">
                        {step}
                      </div>
                      <span className="rounded-full bg-[var(--landing-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--landing-accent)]">
                        {badge}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{title}</h3>
                    <p className="mb-5 text-sm leading-relaxed text-[var(--landing-muted)] transition-colors">
                      {desc}
                    </p>
                    <div className="rounded-xl border border-[var(--landing-accent)]/15 bg-[var(--landing-accent)]/5 px-4 py-3">
                      <p className="whitespace-pre-line text-xs leading-relaxed text-[var(--landing-muted)]">
                        {example}
                      </p>
                    </div>
                  </div>
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden h-px flex-1 border-t-2 border-dashed border-[var(--landing-accent)]/25 md:block" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison ── */}
        <section className="border-y border-[var(--landing-border)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-20 text-center text-3xl font-bold md:text-4xl">
              수작업 대신 DELO가 맡는 일
            </h2>
            {/* Column headers */}
            <div className="mb-3 hidden grid-cols-12 px-6 text-xs font-semibold uppercase tracking-widest text-[var(--landing-muted)] md:grid">
              <div className="col-span-4" />
              <div className="col-span-4 pr-4 text-center">기존 수작업</div>
              <div className="col-span-4 pl-4 text-center text-[var(--landing-accent)]">DELO</div>
            </div>
            <div className="space-y-4">
              {COMPARISON_ROWS.map(({ emoji, feature, agency, delo }) => (
                <div
                  key={feature}
                  className="grid grid-cols-12 items-center rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 transition-colors hover:border-[var(--landing-accent)]/30 hover:brightness-95"
                >
                  <div className="col-span-12 mb-4 flex items-center gap-3 md:col-span-4 md:mb-0">
                    <span className="text-2xl">{emoji}</span>
                    <span className="font-bold">{feature}</span>
                  </div>
                  <div className="col-span-6 border-r border-[var(--landing-border)] pr-4 text-sm text-[var(--landing-muted)] transition-colors md:col-span-4">
                    <span className="mr-1.5 font-bold text-rose-400/70">✗</span>
                    {agency}
                  </div>
                  <div className="col-span-6 pl-4 text-sm font-semibold text-[var(--landing-accent)] md:col-span-4">
                    <span className="mr-1.5">✓</span>
                    {delo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="bg-[var(--landing-surface)] px-6 py-[120px] text-center transition-colors">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 h-px bg-gradient-to-r from-transparent via-[var(--landing-accent)]/30 to-transparent" />
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              첫 번째 브랜드 문의부터 정리해보세요
            </h2>
            <p className="mb-10 text-lg text-[var(--landing-muted)] transition-colors">
              무료 계정으로 바로 시작하세요 — 카드 불필요
            </p>
            <LandingCtaButton
              href={user ? "/dashboard" : "/parse"}
              variant="primary"
              label="무료로 시작하기"
              event="landing_cta_clicked"
              eventProps={{ cta: "signup_closing" }}
            />
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)] px-6 py-12 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Link href="/" className="mb-1 flex items-center gap-2">
              <Image src="/fox-icon.svg" width={24} height={24} alt="DELO 로고" />
              <span className="text-xl font-bold">DELO</span>
            </Link>
            <p className="text-xs text-[var(--landing-muted)]">크리에이터 딜 운영을 위한 비즈니스 코파일럿</p>
          </div>
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12">
            <div className="flex gap-6 text-sm font-medium text-[var(--landing-muted)] transition-colors">
              <Link href="/terms" className="transition-colors hover:text-[var(--landing-text)]">
                이용약관
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-[var(--landing-text)]">
                개인정보처리방침
              </Link>
            </div>
            <div className="text-sm text-[var(--landing-footer)] transition-colors">
              Copyright 2025.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
