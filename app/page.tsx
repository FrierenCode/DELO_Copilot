import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LandingCtaButton } from "@/components/landing/LandingCtaButton";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "DELO | Creator Deal Copilot",
  description:
    "브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지 한 곳에서 처리하는 크리에이터 딜 운영 도구입니다.",
  openGraph: {
    title: "DELO | Creator Deal Copilot",
    description:
      "브랜드 문의 분석부터 견적, 응답 초안, 계약 관리까지 한 곳에서 처리하는 크리에이터 딜 운영 도구입니다.",
    type: "website",
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
    step: "Step 01",
    title: "문의 내용을 붙여넣습니다",
    desc: "이메일, DM, 카카오톡 등 형식과 상관없이 원문 그대로 넣으면 됩니다.",
  },
  {
    step: "Step 02",
    title: "AI가 구조화해서 분석합니다",
    desc: "조건을 정리하고 빠진 항목을 체크한 뒤, 적정 견적 범위를 계산합니다.",
  },
  {
    step: "Step 03",
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

export default async function LandingPage() {
  const dealsCount = await getDealsCount();

  return (
    <div className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)] antialiased transition-colors">
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--landing-border)] bg-[color:var(--landing-nav-bg)] backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            DELO
          </Link>
          <div className="flex items-center gap-6">
            <LandingThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-text)]"
            >
              로그인
            </Link>
            <LandingCtaButton
              href="/login"
              variant="primary"
              label="무료로 시작하기"
              event="landing_cta_clicked"
              eventProps={{ cta: "signup_nav" }}
            />
          </div>
        </div>
      </nav>

      <main>
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
          <div className="mx-auto max-w-4xl">
            {dealsCount !== null && dealsCount > 0 && (
              <p className="mb-8 inline-block rounded-full bg-[var(--landing-accent-soft)] px-4 py-1.5 text-xs font-medium text-[var(--landing-accent)]">
                지금까지 {dealsCount.toLocaleString("ko-KR")}건의 딜을 관리했어요
              </p>
            )}
            <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              크리에이터 딜 운영,
              <br />
              DELO가 정리합니다
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
          </div>
        </section>

        <section className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
              혼자 운영하면 자주 생기는 문제
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PROBLEM_CARDS.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8 transition-all hover:border-[var(--landing-accent)]/50"
                >
                  <div className="mb-6 text-sm font-semibold text-[var(--landing-accent)]">
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

        <section className="bg-[var(--landing-bg)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-20 text-center text-3xl font-bold md:text-4xl">
              DELO는 이렇게 작동합니다
            </h2>
            <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
              {HOW_IT_WORKS.map(({ step, title, desc }, index) => (
                <Fragment key={step}>
                  <div className="flex-1">
                    <div className="mb-6 inline-block rounded-full bg-[var(--landing-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--landing-accent)]">
                      {step}
                    </div>
                    <h3 className="mb-4 text-2xl font-bold">{title}</h3>
                    <p className="whitespace-pre-line leading-relaxed text-[var(--landing-muted)] transition-colors">
                      {desc}
                    </p>
                  </div>
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden items-center text-[var(--landing-border)] transition-colors md:flex">
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--landing-border)] px-6 py-[120px] transition-colors">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-20 text-center text-3xl font-bold md:text-4xl">
              수작업 대신 DELO가 맡는 일
            </h2>
            <div className="space-y-4">
              {COMPARISON_ROWS.map(({ icon, feature, agency, delo }) => (
                <div
                  key={feature}
                  className="grid grid-cols-12 items-center rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 transition-colors"
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
                  <div className="col-span-6 pl-4 text-sm font-medium text-[var(--landing-accent)] md:col-span-4">
                    {delo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--landing-surface)] px-6 py-[120px] text-center transition-colors">
          <div className="mx-auto max-w-4xl">
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

      <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)] px-6 py-12 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Link href="/" className="mb-2 block text-xl font-bold">
              DELO
            </Link>
            <p className="text-sm text-[var(--landing-muted)] transition-colors">
              크리에이터 딜 운영을 위한 비즈니스 코파일럿
            </p>
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
