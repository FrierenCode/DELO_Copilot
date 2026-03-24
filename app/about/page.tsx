import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "DELO 소개 | 크리에이터를 위한 AI 딜 관리 플랫폼",
  description:
    "DELO는 브랜드 협찬 문의 분석부터 견적·답장·계약 관리까지 크리에이터의 딜 운영 전체를 돕는 AI 플랫폼입니다.",
  keywords: [
    "DELO 소개",
    "크리에이터 딜 관리 플랫폼",
    "브랜드 협찬 AI 도구",
    "인플루언서 협업 관리",
    "크리에이터 비즈니스 도구",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "DELO 소개 | 크리에이터를 위한 AI 딜 관리 플랫폼",
    description:
      "DELO는 브랜드 협찬 문의 분석부터 견적·답장·계약 관리까지 크리에이터의 딜 운영 전체를 돕는 AI 플랫폼입니다.",
    type: "website",
    url: "/about",
  },
  twitter: {
    title: "DELO 소개 | 크리에이터를 위한 AI 딜 관리 플랫폼",
    description:
      "브랜드 협찬 문의 분석·견적·답장·계약 관리를 한 곳에서. 크리에이터 AI 딜 관리 플랫폼 DELO를 소개합니다.",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://delo-app.com";

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${APP_URL}/about`,
  url: `${APP_URL}/about`,
  name: "DELO 소개",
  description:
    "DELO는 브랜드 협찬 문의 분석부터 견적·답장·계약 관리까지 크리에이터의 딜 운영 전체를 돕는 AI 플랫폼입니다.",
  about: {
    "@id": `${APP_URL}/#organization`,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: `${APP_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "소개",
        item: `${APP_URL}/about`,
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <div className="parse-page min-h-screen" style={{ backgroundColor: "var(--p-bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ backgroundColor: "var(--p-glow)" }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ backgroundColor: "var(--p-nav-bg)", boxShadow: "var(--p-nav-shadow)" }}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fox-icon.svg" width={26} height={26} alt="DELO" priority />
            <span className="text-lg font-black tracking-tighter" style={{ color: "var(--p-primary)" }}>
              DELO
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <LandingThemeToggle />
            <Link
              href="/signup"
              className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95"
              style={{ background: "var(--p-btn-gradient)", color: "white" }}
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              backgroundColor: "var(--p-secondary-badge-bg)",
              borderColor: "var(--p-secondary-badge-bd)",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-secondary)" }}>
              ✦ ABOUT
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter md:text-4xl" style={{ color: "var(--p-text)" }}>
            DELO 소개
          </h1>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--p-muted)" }}>
            크리에이터가 브랜드 딜을 직접, 체계적으로 운영할 수 있도록 만든 AI 도구입니다.
          </p>
        </header>

        <div className="space-y-6">
          {/* Problem */}
          <section
            className="rounded-2xl border p-8"
            style={{
              backgroundColor: "var(--p-surface)",
              borderColor: "var(--p-border)",
            }}
          >
            <h2 className="mb-4 text-xl font-black tracking-tight" style={{ color: "var(--p-text)" }}>
              만든 이유
            </h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
              <p>
                브랜드 협찬 문의를 받은 크리에이터가 가장 먼저 마주하는 질문은 비슷합니다.
                <span className="font-semibold" style={{ color: "var(--p-text)" }}>
                  {" "}얼마를 받아야 할까? 어떻게 답해야 할까? 계약 조건에서 빠진 게 없을까?
                </span>
              </p>
              <p>
                대형 채널은 MCN이나 에이전시가 이 과정을 대신해 주지만, 대부분의 크리에이터는
                혼자 판단해야 합니다. 경험이 없으면 적정 단가보다 낮게 수락하거나, 불리한 조건을
                놓치거나, 답장을 미루다 기회를 잃기도 합니다.
              </p>
              <p>
                DELO는 이 판단을 도와주기 위해 만들었습니다. AI가 문의 조건을 구조화하고,
                구독자·조회수 기반으로 견적 범위를 제안하며, 답장 초안까지 준비해 줍니다.
              </p>
            </div>
          </section>

          {/* What we do */}
          <section
            className="rounded-2xl border p-8"
            style={{
              backgroundColor: "var(--p-surface)",
              borderColor: "var(--p-border)",
            }}
          >
            <h2 className="mb-4 text-xl font-black tracking-tight" style={{ color: "var(--p-text)" }}>
              DELO가 하는 일
            </h2>
            <ul className="space-y-3">
              {[
                {
                  label: "문의 분석",
                  desc: "이메일·DM·카카오톡 등 형식과 무관하게 협찬 문의의 핵심 조건을 구조화합니다.",
                },
                {
                  label: "견적 산출",
                  desc: "구독자 수·평균 조회수·산출물 유형을 기준으로 시장 기반 적정 견적 범위를 제안합니다.",
                },
                {
                  label: "답장 초안",
                  desc: "정중한 수락, 빠른 확인, 협상 요청 등 상황에 맞는 3가지 톤의 초안을 자동으로 생성합니다.",
                },
                {
                  label: "계약 관리",
                  desc: "딜 진행 상태를 단계별로 추적하고, 누락 조건·마감 임박 항목을 실시간으로 알립니다.",
                },
              ].map(({ label, desc }) => (
                <li key={label} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                    style={{
                      backgroundColor: "var(--p-primary-soft)",
                      color: "var(--p-primary)",
                    }}
                  >
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
                    <span className="font-semibold" style={{ color: "var(--p-text)" }}>{label}</span>
                    {" — "}
                    {desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Team */}
          <section
            className="rounded-2xl border p-8"
            style={{
              backgroundColor: "var(--p-surface)",
              borderColor: "var(--p-border)",
            }}
          >
            <h2 className="mb-4 text-xl font-black tracking-tight" style={{ color: "var(--p-text)" }}>
              팀
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
              DELO는{" "}
              <span className="font-semibold" style={{ color: "var(--p-text)" }}>DELO 팀</span>
              이 개발·운영하고 있습니다. 크리에이터 이코노미에서 브랜드 딜 운영을 더 쉽게 만드는 것을
              목표로, 실제 크리에이터의 피드백을 반영해 제품을 지속적으로 개선하고 있습니다.
            </p>
          </section>

          {/* Contact / Feedback */}
          <section
            className="rounded-2xl border p-8"
            style={{
              backgroundColor: "var(--p-surface)",
              borderColor: "var(--p-border)",
            }}
          >
            <h2 className="mb-4 text-xl font-black tracking-tight" style={{ color: "var(--p-text)" }}>
              피드백 및 문의
            </h2>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
              버그 제보, 기능 제안, 서비스 관련 문의는 대시보드 내 피드백 기능을 통해 전달해 주세요.
              크리에이터의 실제 경험이 DELO를 더 좋게 만드는 가장 빠른 방법입니다.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition-all hover:brightness-110 active:scale-95"
              style={{ background: "var(--p-btn-gradient)", color: "white" }}
            >
              피드백 보내기 →
            </Link>
          </section>

          {/* Legal links */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs" style={{ color: "var(--p-muted)" }}>
            <Link href="/terms" className="transition-colors hover:text-[var(--p-primary)]">이용약관</Link>
            <Link href="/privacy" className="transition-colors hover:text-[var(--p-primary)]">개인정보처리방침</Link>
            <Link href="/how-it-works" className="transition-colors hover:text-[var(--p-primary)]">작동 방식</Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
