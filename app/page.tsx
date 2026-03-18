import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { LandingCtaButton } from "@/components/landing/LandingCtaButton";

export const metadata: Metadata = {
  title: "DELO — 당신만의 에이전시",
  description:
    "브랜드 협찬 문의를 붙여넣으면 5분 만에 견적·체크리스트·답장 초안을 자동으로 만들어드립니다. 크리에이터를 위한 딜 관리 도구.",
  openGraph: {
    title: "DELO — 당신만의 에이전시",
    description: "협찬 문의 붙여넣기. 5분 만에 견적·답장·저장 완료.",
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
    icon: "💸",
    title: "견적을 감으로 부른다",
    desc: "비슷한 문의도 매번 다른 금액. 너무 적게 불렀다는 걸 나중에야 알게 됩니다.",
  },
  {
    icon: "📋",
    title: "계약 조건을 놓친다",
    desc: "사용권, 독점권, 수정 횟수, 지급 조건. 빠진 항목 하나가 나중에 분쟁이 됩니다.",
  },
  {
    icon: "📭",
    title: "후속 관리가 끊긴다",
    desc: "답장 이후 진행 상황이 DM, 메모, 캘린더에 흩어져 중요한 시점을 놓칩니다.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "Step 01",
    title: "문의 붙여넣기",
    desc: "이메일, DM, 카카오 —\n형식 상관없이 원문 그대로",
  },
  {
    step: "Step 02",
    title: "AI가 분석합니다",
    desc: "조건 구조화, 누락 항목 체크,\n적정 견적 자동 계산",
  },
  {
    step: "Step 03",
    title: "바로 답장 발송",
    desc: "3가지 톤의 협상 초안 중\n골라 복사하면 끝",
  },
];

const COMPARISON_ROWS = [
  {
    icon: "🔍",
    feature: "브랜드 문의 분석",
    agency: "에이전시는 수십 건의 정리...",
    delo: "DELO는 30초 안에 구조화",
  },
  {
    icon: "📊",
    feature: "적정 견적 산출",
    agency: "에이전시는 경험...",
    delo: "DELO는 데이터 기반 계산",
  },
  {
    icon: "💬",
    feature: "협상 커뮤니케이션",
    agency: "에이전시는 직접 협상...",
    delo: "DELO는 협상 답장 초안 생성",
  },
  {
    icon: "🚀",
    feature: "계약 진행 관리",
    agency: "에이전시는 일정 추적...",
    delo: "DELO는 파이프라인 관리",
  },
];

export default async function LandingPage() {
  const dealsCount = await getDealsCount();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC] antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#1E1E2E] bg-[#0A0A0F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">DELO</span>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
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
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16">
          <div className="max-w-4xl mx-auto">
            {dealsCount !== null && dealsCount > 0 && (
              <p className="inline-block mb-8 rounded-full bg-[#6366F1]/20 px-4 py-1.5 text-xs font-medium text-[#6366F1]">
                지금까지 {dealsCount.toLocaleString("ko-KR")}건의 딜이
                관리됐어요
              </p>
            )}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
              당신만의 에이전시,
              <br />
              DELO가 대신합니다
            </h1>
            <p className="text-lg md:text-xl text-[#94A3B8] leading-relaxed mb-12">
              브랜드 문의 분석부터 견적, 협상, 계약 관리까지.
              <br />
              에이전시가 하던 일을 이제 혼자서도 할 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LandingCtaButton
                href="/login"
                variant="primary"
                label="직접 써보기"
                event="landing_cta_clicked"
                eventProps={{ cta: "signup" }}
              />
              <LandingCtaButton
                href="/dashboard/intake?demo=true"
                variant="secondary"
                label="샘플로 바로 체험"
                event="landing_cta_clicked"
                eventProps={{ cta: "demo" }}
              />
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-[120px] bg-[#0A0A0F] px-6 border-t border-[#1E1E2E]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              에이전시 없이 혼자 운영하면
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROBLEM_CARDS.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="p-8 rounded-2xl border border-[#1E1E2E] bg-[#13131A] hover:border-[#6366F1]/50 transition-all"
                >
                  <div className="mb-6 text-2xl">{icon}</div>
                  <h3 className="text-xl font-bold mb-4">{title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-[120px] px-6 bg-[#0A0A0F]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">
              DELO는 이렇게 작동합니다
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
              {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                <Fragment key={step}>
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#6366F1]/20 text-[#6366F1] text-xs font-bold mb-6">
                      {step}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{title}</h3>
                    <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">
                      {desc}
                    </p>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:flex items-center text-[#1E1E2E]">
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

        {/* Comparison Section */}
        <section className="py-[120px] px-6 border-y border-[#1E1E2E]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">
              에이전시가 하는 일, DELO도 합니다
            </h2>
            <div className="space-y-4">
              {COMPARISON_ROWS.map(({ icon, feature, agency, delo }) => (
                <div
                  key={feature}
                  className="grid grid-cols-12 items-center p-6 rounded-2xl border border-[#1E1E2E] bg-[#13131A]"
                >
                  <div className="col-span-12 md:col-span-4 flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
                      {icon}
                    </div>
                    <span className="font-bold">{feature}</span>
                  </div>
                  <div className="col-span-6 md:col-span-4 text-sm text-[#94A3B8] border-r border-[#1E1E2E] pr-4">
                    {agency}
                  </div>
                  <div className="col-span-6 md:col-span-4 text-sm font-medium text-[#6366F1] pl-4">
                    {delo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-[120px] px-6 bg-[#13131A] text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              지금 첫 번째 문의를 분석해보세요
            </h2>
            <p className="text-[#94A3B8] text-lg mb-10">
              회원가입 후 무료로 시작할 수 있습니다.
            </p>
            <LandingCtaButton
              href="/login"
              variant="primary"
              label="무료로 시작하기 →"
              event="landing_cta_clicked"
              eventProps={{ cta: "signup_closing" }}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] py-12 px-6 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <span className="text-xl font-bold block mb-2">DELO</span>
            <p className="text-sm text-[#94A3B8]">크리에이터의 비즈니스 파트너.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
            <div className="flex gap-6 text-sm text-[#94A3B8] font-medium">
              <Link
                href="/terms"
                className="hover:text-[#F8FAFC] transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="hover:text-[#F8FAFC] transition-colors"
              >
                개인정보처리방침
              </Link>
            </div>
            <div className="text-sm text-[#94A3B8]/40">Copyright 2025.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
