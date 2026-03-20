import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 — DELO",
};

const SECTIONS = [
  { id: "p1", label: "1. 수집 정보" },
  { id: "p2", label: "2. 이용 목적" },
  { id: "p3", label: "3. 제3자 공유" },
  { id: "p4", label: "4. 데이터 보존" },
  { id: "p5", label: "5. 문의" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100">
      {/* Fixed top nav */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fox-icon.svg" width={28} height={28} alt="DELO 로고" />
            <span className="text-xl font-bold tracking-tight text-white">DELO</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            서비스 돌아가기 ←
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="overflow-hidden rounded-xl border border-[#1E1E2E] bg-[#13131A]">
            <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent" />
            <div className="p-8">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">개인정보처리방침</h1>
              <p className="text-sm text-slate-400">최종 업데이트: 2026년 3월</p>
            </header>

            {/* Table of contents */}
            <nav className="mb-10 pb-6 border-b border-[#1E1E2E]">
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {SECTIONS.map(({ id, label }) => (
                  <li key={id}>
                    <a href={`#${id}`} className="hover:underline underline-offset-4">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Article */}
            <article className="space-y-10 text-slate-200/90" style={{ lineHeight: 1.8 }}>

              <section id="p1">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  1. 수집하는 정보
                </h2>
                <p>
                  Creator Deal Copilot은 서비스 제공을 위해 이메일 주소, 크리에이터 프로필
                  정보(팔로워 규모, 주요 플랫폼, 활동 분야 등), 브랜드 문의 내용, 서비스 이용
                  기록을 수집합니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="p2">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  2. 정보의 이용 목적
                </h2>
                <p>
                  수집한 정보는 견적 산출, 계약 체크리스트 생성, 답장 초안 제공 등 핵심 서비스
                  운영에만 사용됩니다. LLM 프로바이더(OpenAI, Google AI)로 처리되는 문의 내용은
                  분석 후 저장되지 않으며, 개인 식별 정보는 전송하지 않습니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="p3">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  3. 제3자 공유
                </h2>
                <p>
                  법적 의무 이행, 결제 처리(Polar), 분석(PostHog), 오류 모니터링(Sentry) 목적
                  외에는 개인정보를 제3자와 공유하지 않습니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="p4">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  4. 데이터 보존
                </h2>
                <p>
                  계정 삭제 요청 시 30일 이내에 개인 데이터를 삭제합니다. 결제 기록은 세무·법적
                  의무에 따라 일정 기간 보존될 수 있습니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="p5">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  5. 문의
                </h2>
                <p>
                  개인정보 관련 문의:{" "}
                  <a
                    href="mailto:privacy@creatordealcopilot.com"
                    className="text-indigo-400 hover:underline underline-offset-4"
                  >
                    privacy@creatordealcopilot.com
                  </a>
                </p>
              </section>

            </article>
            </div>{/* closes p-8 */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] py-10 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2025 DELO Copilot. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-semibold uppercase tracking-widest">
            <Link href="/terms" className="text-slate-500 hover:text-indigo-400 transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-indigo-400 transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
