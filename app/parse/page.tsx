import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ParseInterface } from "@/components/ParseInterface";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";

export const metadata: Metadata = {
  // 주요 키워드(브랜드 협찬 문의 분석)를 앞에, 부수 기능(견적 계산)과 브랜드를 뒤에 배치
  title: "브랜드 협찬 문의 분석 · 견적 계산기 | DELO",
  // 네이버 스니펫 ~75자 기준: 핵심 기능(분석·견적) → 입력 채널 → 무료 체험 순서
  description:
    "브랜드 협찬 문의를 붙여넣으면 AI가 조건을 구조화하고 적정 견적을 제안합니다. 이메일·인스타 DM·카카오톡 채널 무관. 회원가입 없이 무료로 체험할 수 있습니다.",
  keywords: [
    // 의도별 키워드 구성: 분석(정보 탐색) → 견적(구매 의도) → 플랫폼별 롱테일
    "브랜드 협찬 문의 분석",
    "협찬 문의 분석기",
    "크리에이터 견적 계산기",
    "유튜버 협찬 단가 계산",
    "인스타그램 협찬 견적",
    "인플루언서 광고 단가",
    "협찬 제안서 검토",
    "AI 협찬 분석",
    "브랜드 협업 견적",
    "크리에이터 광고 단가",
    "협찬 계약 조건 분석",
    "DELO 분석기",
  ],
  alternates: {
    canonical: "/parse",
  },
  openGraph: {
    title: "브랜드 협찬 문의 분석 · 견적 계산기 | DELO",
    // OG description: 소셜 공유 시 노출, 클릭 유도 문구 포함
    description:
      "이메일·DM·카카오톡 협찬 문의를 붙여넣으면 AI가 담당자·산출물·일정·누락 조건을 정리하고 구독자 규모에 맞는 견적 범위를 제안합니다. 로그인 없이 무료로 사용할 수 있습니다.",
    type: "website",
    url: "/parse",
  },
  twitter: {
    title: "브랜드 협찬 문의 분석 · 견적 계산기 | DELO",
    description:
      "협찬 문의를 붙여넣으면 AI가 핵심 조건을 구조화하고 적정 견적 범위를 제안합니다. 이메일·인스타 DM·카카오톡 등 채널 무관. 무료 체험 가능.",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://delo-app.com";

const parseBreadcrumbJsonLd = {
  "@context": "https://schema.org",
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
      name: "브랜드 문의 분석기",
      item: `${APP_URL}/parse`,
    },
  ],
};

export default async function ParsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="parse-page min-h-screen" style={{ backgroundColor: "var(--p-bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(parseBreadcrumbJsonLd) }}
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
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95"
                style={{ background: "var(--p-btn-gradient)", color: "white" }}
              >
                대시보드 →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-all hover:brightness-125"
                  style={{ color: "var(--p-muted)" }}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "var(--p-btn-gradient)", color: "white" }}
                >
                  무료로 시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-12">
        {/* Header */}
        <header className="mb-10 text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              backgroundColor: "var(--p-secondary-badge-bg)",
              borderColor: "var(--p-secondary-badge-bd)",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-secondary)" }}>
              ✦ AI 분석
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter md:text-4xl" style={{ color: "var(--p-text)" }}>
            브랜드 문의 분석기
          </h1>
        </header>

        <ParseInterface isLoggedIn={!!user} />
      </main>

      <footer className="border-t px-6 py-8" style={{ borderColor: "var(--p-border, rgba(255,255,255,0.06))" }}>
        <div className="mx-auto flex max-w-3xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fox-icon.svg" width={18} height={18} alt="DELO" />
            <span className="text-sm font-black" style={{ color: "var(--p-primary)" }}>DELO</span>
          </Link>
          <div className="flex gap-5 text-xs" style={{ color: "var(--p-muted)" }}>
            <Link href="/how-it-works" className="transition-colors hover:text-[var(--p-primary)]">
              작동 방식
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--p-primary)]">
              이용약관
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[var(--p-primary)]">
              개인정보처리방침
            </Link>
          </div>
          <p className="text-xs" style={{ color: "var(--p-muted)" }}>© 2026 DELO</p>
        </div>
      </footer>
    </div>
  );
}
