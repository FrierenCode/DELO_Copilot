import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
  description: "DELO 서비스 이용에 관한 약관을 안내합니다.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
};

const SECTIONS = [
  { id: "t1", label: "1. 서비스 성격" },
  { id: "t2", label: "2. 이용 조건" },
  { id: "t3", label: "3. 플랜 및 결제" },
  { id: "t4", label: "4. 책임 제한" },
  { id: "t5", label: "5. 면책 고지" },
  { id: "t6", label: "6. 문의" },
];

export default function TermsPage() {
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
              <h1 className="text-3xl font-bold mb-2 text-white">이용약관</h1>
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

              <section id="t1">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  1. 서비스 성격
                </h2>
                <p>
                  Creator Deal Copilot은 크리에이터가 브랜드 협찬 문의를 분석하고 관리하는 데
                  도움을 주는 운영 지원 도구입니다. 본 서비스가 제공하는 견적, 체크리스트, 답장
                  초안은 <strong className="text-white">운영 참고용 가이드이며, 법률·세무·회계 자문이 아닙니다.</strong>
                </p>
                <p className="mt-3">
                  계약 체결 전 법적·세무적 사항에 대해서는 반드시 전문가의 조언을 구하시기 바랍니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="t2">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  2. 이용 조건
                </h2>
                <p>
                  서비스를 이용함으로써 본 약관에 동의하는 것으로 간주됩니다. 불법적 목적, 스팸
                  생성, 타인의 정보 무단 사용 등은 금지됩니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="t3">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  3. 플랜 및 결제
                </h2>
                <p>
                  Free 플랜은 월 5회 파싱, 10건 Deal 저장이 제한됩니다. Standard 플랜은 무제한 이용이
                  가능하며 <strong className="text-white">Polar</strong>를 통해 청구됩니다. 환불 정책은 결제 완료 후
                  7일 이내 미사용 건에 한해 적용됩니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="t4">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  4. 책임 제한
                </h2>
                <p>
                  본 서비스는 "있는 그대로(as-is)" 제공됩니다. 서비스 이용으로 인한 수익 손실,
                  계약 분쟁, 법적 불이익에 대해 Creator Deal Copilot은 책임을 지지 않습니다.
                </p>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="t5">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  5. 면책 고지
                </h2>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-300 text-sm">
                  이 서비스가 제공하는 모든 견적, 체크리스트, 확인 항목은 운영 참고용
                  가이드입니다. 법률·세무·회계 자문이 아니며, 이를 근거로 한 법적·재정적
                  결정에 대한 책임은 이용자 본인에게 있습니다.
                </div>
              </section>

              <hr className="border-[#1E1E2E]" />

              <section id="t6">
                <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle" />
                  6. 문의
                </h2>
                <p>
                  약관 관련 문의:{" "}
                  <a
                    href="mailto:support@creatordealcopilot.com"
                    className="text-indigo-400 hover:underline underline-offset-4"
                  >
                    support@creatordealcopilot.com
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
