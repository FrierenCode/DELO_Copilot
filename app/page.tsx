import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingCtaButton } from "@/components/landing/LandingCtaButton";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
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
    icon: "01",
    title: "견적이 매번 감으로 정해집니다",
    desc: "비슷한 문의여도 금액 기준이 흔들리면 협상에서 계속 불리해집니다.",
  },
  {
    icon: "02",
    title: "계약 조건을 자주 놓칩니다",
    desc: "사용권, 수정 횟수, 지급 일정 같은 핵심 항목 하나가 수익을 크게 바꿉니다.",
  },
  {
    icon: "03",
    title: "후속 관리가 흩어집니다",
    desc: "답변 이후 진행 상황이 DM, 메모, 캘린더로 분산되면 중요한 타이밍을 놓칩니다.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "문의 내용을 붙여넣습니다",
    desc: "이메일, DM, 카카오톡 등 형식과 상관없이 원문 그대로 넣으면 됩니다.",
  },
  {
    step: "02",
    title: "AI가 구조화해서 분석합니다",
    desc: "조건을 정리하고 빠진 항목을 체크한 뒤, 적정 견적 범위를 계산합니다.",
  },
  {
    step: "03",
    title: "바로 응답을 준비합니다",
    desc: "상황별 초안과 체크리스트를 기반으로 바로 회신하거나 내부 검토를 진행할 수 있습니다.",
  },
] as const;

const COMPARISON_ROWS = [
  {
    icon: "A",
    feature: "브랜드 문의 분석",
    agency: "문의 내용을 사람이 직접 분류하고 정리",
    delo: "DELO가 핵심 조건과 리스크를 즉시 구조화",
  },
  {
    icon: "B",
    feature: "적정 견적 산정",
    agency: "과거 경험과 감각에 의존",
    delo: "데이터와 입력값을 바탕으로 범위 제안",
  },
  {
    icon: "C",
    feature: "응답 초안 작성",
    agency: "매번 새로 문구를 작성",
    delo: "상황별 톤의 초안을 바로 생성",
  },
  {
    icon: "D",
    feature: "계약 진행 관리",
    agency: "노션, 메신저, 캘린더를 따로 확인",
    delo: "히스토리와 상태를 한 화면에서 관리",
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
                href="/login"
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
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
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

          <div className="mx-auto max-w-4xl">
            {dealsCount !== null && dealsCount > 0 && (
              <p className="mb-8 inline-block rounded-full bg-[var(--landing-accent-soft)] px-4 py-1.5 text-xs font-medium text-[var(--landing-accent)]">
                지금까지 {dealsCount.toLocaleString("ko-KR")}건의 딜을 관리했어요
              </p>
            )}

            {/* Trust badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--landing-accent)]/25 bg-[var(--landing-accent-soft)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--landing-accent)]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--landing-accent)]" />
              크리에이터를 위한 AI 딜 관리 플랫폼
            </div>

            <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              크리에이터 딜 운영,
              <br />
              <span className="text-gradient">DELO가</span> 정리합니다
            </h1>
            <p className="mb-12 text-lg leading-relaxed text-[var(--landing-muted)] transition-colors md:text-xl">
              브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지.
              <br />
              에이전시 없이도 운영 흐름을 빠르게 정리할 수 있습니다.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <LandingCtaButton
                href="/login"
                variant="primary"
                label="직접 써보기"
                event="landing_cta_clicked"
                eventProps={{ cta: "signup" }}
              />
              <LandingCtaButton
                href="/parse"
                variant="secondary"
                label="어떻게 작동하나요?"
                event="landing_cta_clicked"
                eventProps={{ cta: "demo" }}
              />
            </div>

            {/* Social proof */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--landing-muted)]">
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
        </section>

        {/* ── Problem cards ── */}
        <section className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
              혼자 운영하면 자주 생기는 문제
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PROBLEM_CARDS.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="card-hover rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8 transition-colors"
                >
                  <div className="mb-6 h-px rounded-full bg-gradient-to-r from-[var(--landing-accent)]/60 via-[var(--landing-accent)]/20 to-transparent" />
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--landing-accent)]/20 bg-[var(--landing-accent-soft)] text-xl font-black text-[var(--landing-accent)]">
                    {icon}
                  </div>
                  <h3 className="mb-4 text-xl font-bold">{title}</h3>
                  <p className="leading-relaxed text-[var(--landing-muted)] transition-colors">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-[var(--landing-bg)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-20 text-center text-3xl font-bold md:text-4xl">
              DELO는 이렇게 작동합니다
            </h2>
            <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
              {HOW_IT_WORKS.map(({ step, title, desc }, index) => (
                <Fragment key={step}>
                  <div className="flex-1 rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 transition-colors">
                    <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--landing-accent)] to-indigo-500 text-sm font-bold text-white shadow-lg shadow-[var(--landing-accent)]/30">
                      {step}
                    </div>
                    <h3 className="mb-4 text-2xl font-bold">{title}</h3>
                    <p className="whitespace-pre-line leading-relaxed text-[var(--landing-muted)] transition-colors">
                      {desc}
                    </p>
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
            <div className="space-y-4">
              {COMPARISON_ROWS.map(({ icon, feature, agency, delo }) => (
                <div
                  key={feature}
                  className="grid grid-cols-12 items-center rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 transition-colors hover:border-[var(--landing-accent)]/30 hover:brightness-95"
                >
                  <div className="col-span-12 mb-4 flex items-center gap-4 md:col-span-4 md:mb-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--landing-icon-bg)] text-sm font-semibold transition-colors">
                      {icon}
                    </div>
                    <span className="font-bold">{feature}</span>
                  </div>
                  <div className="col-span-6 border-r border-[var(--landing-border)] pr-4 text-sm text-[var(--landing-muted)] transition-colors md:col-span-4">
                    {agency}
                  </div>
                  <div className="col-span-6 pl-4 text-sm font-semibold text-[var(--landing-accent)] md:col-span-4">
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
              회원가입 없이 바로 흐름을 확인할 수 있습니다.
            </p>
            <LandingCtaButton
              href="/login"
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
