import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DELO가 어떻게 작동하나요?",
  description:
    "브랜드 문의를 붙여넣으면 AI가 30초 안에 조건 분석, 견적 산정, 답장 초안까지 한 번에 준비합니다.",
};

const STEPS = [
  {
    number: "01",
    accent: "#a3a6ff",
    accentSoft: "rgba(163,166,255,0.1)",
    title: "브랜드 문의를 붙여넣습니다",
    desc: "이메일, DM, 카카오톡 등 형식과 상관없이 원문 그대로 넣으면 됩니다. 샘플 문의를 선택해 바로 체험해볼 수도 있습니다.",
    mockup: (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {["뷰티 브랜드 DM", "IT 제품 이메일", "패션 협찬 제안"].map((label) => (
            <span
              key={label}
              className="rounded-full px-3 py-1 text-[11px] font-medium"
              style={{ backgroundColor: "#25252d", color: "#acaab1" }}
            >
              {label}
            </span>
          ))}
        </div>
        <div
          className="rounded-xl p-4 text-xs leading-relaxed"
          style={{ backgroundColor: "#19191f", color: "#acaab1" }}
        >
          <span style={{ color: "#acaab1" }}>
            "안녕하세요! 저희는 친환경 뷰티 브랜드 그린글로우입니다.
            인스타그램 피드 포스팅 1회와 스토리 3회 협찬을 제안드립니다..."
          </span>
          <span
            className="ml-1 inline-block h-3.5 w-0.5 animate-pulse rounded-full align-middle"
            style={{ backgroundColor: "#a3a6ff" }}
          />
        </div>
        <div className="flex justify-end">
          <div
            className="rounded-full px-5 py-2 text-xs font-black"
            style={{ background: "linear-gradient(to right, #a3a6ff, #a88cfb)", color: "white" }}
          >
            문의 분석하기 →
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    accent: "#9bffce",
    accentSoft: "rgba(155,255,206,0.1)",
    title: "AI가 조건을 구조화해서 분석합니다",
    desc: "브랜드명, 플랫폼, 콘텐츠 유형, 마감일, 예산, 사용권 등 핵심 항목을 자동으로 추출합니다. 누락된 정보도 즉시 표시됩니다.",
    mockup: (
      <div className="space-y-2">
        {[
          { label: "브랜드", value: "그린글로우", ok: true },
          { label: "플랫폼", value: "인스타그램", ok: true },
          { label: "예산", value: "MISSING", ok: false },
          { label: "사용권", value: "MISSING", ok: false },
          { label: "마감일", value: "다음 달 중", ok: true },
        ].map(({ label, value, ok }) => (
          <div key={label} className="flex items-center justify-between py-1.5">
            <span className="text-xs font-bold" style={{ color: "#acaab1" }}>{label}</span>
            {ok ? (
              <span className="text-xs font-black" style={{ color: "#f9f5fd" }}>{value}</span>
            ) : (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-black uppercase"
                style={{ backgroundColor: "rgba(255,110,132,0.12)", color: "#ff6e84" }}
              >
                {value}
              </span>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    accent: "#9bffce",
    accentSoft: "rgba(155,255,206,0.1)",
    title: "적정 견적 범위와 체크리스트를 확인합니다",
    desc: "팔로워 구간, 플랫폼, 콘텐츠 유형을 바탕으로 견적 범위를 계산합니다. 계약 리스크 항목도 우선순위별로 정리됩니다.",
    mockup: (
      <div className="space-y-3">
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "rgba(155,255,206,0.07)", borderColor: "rgba(155,255,206,0.2)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#acaab1" }}>
            AI 적정 견적 범위
          </p>
          <p className="mt-1 text-2xl font-black tracking-tighter" style={{ color: "#9bffce" }}>
            45 ~ 80만원
          </p>
        </div>
        <div className="space-y-2">
          {[
            { dot: "#ff6e84", text: "예산 미기재 — 협상 전 확인 필요" },
            { dot: "#a88cfb", text: "콘텐츠 사용권 명시 없음" },
            { dot: "#48474d", text: "독점 조항 여부 확인 권장" },
          ].map(({ dot, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
              <p className="text-xs" style={{ color: "#f9f5fd" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "04",
    accent: "#a88cfb",
    accentSoft: "rgba(168,140,251,0.1)",
    title: "답장 초안을 바로 보내거나 딜을 저장합니다",
    desc: "3가지 톤(정중한·간단·협상)의 초안 중 골라서 편집하거나 그대로 복사할 수 있습니다. 딜로 저장하면 진행 상태를 계속 관리할 수 있습니다.",
    mockup: (
      <div className="space-y-2.5">
        {[
          { tone: "정중한 답장", preview: "안녕하세요. 제안 주셔서 감사합니다. 긍정적으로 검토했습니다. 다만 예산과 사용권..." },
          { tone: "간단 답장", preview: "제안 감사합니다. 구체적인 가이드와 예산을 먼저 공유해 주시면..." },
        ].map(({ tone, preview }) => (
          <div key={tone} className="rounded-xl p-3" style={{ backgroundColor: "#131319" }}>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "#a88cfb" }}>{tone}</p>
            <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "#acaab1" }}>{preview}</p>
          </div>
        ))}
        <div
          className="rounded-xl px-4 py-2.5 text-center text-xs font-black"
          style={{ background: "linear-gradient(to right, #a3a6ff, #a88cfb)", color: "white" }}
        >
          딜로 저장하고 진행 관리 →
        </div>
      </div>
    ),
  },
] as const;

const FEATURES = [
  { icon: "⚡", title: "30초 분석", desc: "원문 붙여넣기만으로 핵심 조건 전체를 즉시 구조화합니다" },
  { icon: "💰", title: "데이터 기반 견적", desc: "팔로워·플랫폼·콘텐츠 유형 조합으로 적정 범위를 계산합니다" },
  { icon: "✅", title: "계약 리스크 체크", desc: "사용권, 독점 조항, 결제 조건 등 놓치기 쉬운 항목을 자동 확인합니다" },
  { icon: "✍️", title: "즉시 쓸 수 있는 초안", desc: "3가지 톤의 답장을 바로 수정하거나 복사해서 보낼 수 있습니다" },
  { icon: "📁", title: "딜 진행 관리", desc: "Lead → 협의 → 계약 → 정산 흐름을 한 화면에서 추적합니다" },
  { icon: "🔔", title: "알림 & 후속 관리", desc: "응답 지연, 마감 임박 등 중요한 타이밍을 놓치지 않습니다" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0e0e13" }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ backgroundColor: "rgba(163,166,255,0.04)" }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(14,14,19,0.8)",
          boxShadow: "0 0 40px rgba(163,166,255,0.06)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fox-icon.svg" width={26} height={26} alt="DELO" />
            <span className="text-lg font-black tracking-tighter" style={{ color: "#a3a6ff" }}>
              DELO
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium transition-all hover:brightness-125"
              style={{ color: "#acaab1" }}
            >
              ← 홈으로
            </Link>
            <Link
              href="/parse"
              className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(to right, #a3a6ff, #a88cfb)", color: "white" }}
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-16">
        {/* Header */}
        <header className="mb-20 text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{ backgroundColor: "rgba(79,49,156,0.3)", borderColor: "rgba(168,140,251,0.2)" }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#a88cfb" }}>
              작동 방식
            </span>
          </div>
          <h1
            className="mb-5 text-4xl font-black tracking-tighter md:text-6xl"
            style={{ color: "#f9f5fd" }}
          >
            4단계로 끝납니다
          </h1>
          <p className="mx-auto max-w-xl text-lg font-medium leading-relaxed" style={{ color: "#acaab1" }}>
            문의 원문을 붙여넣으면 AI가 30초 안에 조건 분석, 견적 산정,
            <br className="hidden md:block" />
            답장 초안까지 한 번에 준비합니다.
          </p>
        </header>

        {/* Steps */}
        <div className="mb-24 space-y-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="grid items-center gap-8 overflow-hidden rounded-2xl md:grid-cols-2"
              style={{ backgroundColor: "#131319" }}
            >
              {/* Text side — alternates left/right */}
              <div className={`p-8 md:p-10 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black"
                  style={{ backgroundColor: step.accentSoft, color: step.accent }}
                >
                  {step.number}
                </div>
                <h2
                  className="mb-3 text-2xl font-black tracking-tight md:text-3xl"
                  style={{ color: "#f9f5fd" }}
                >
                  {step.title}
                </h2>
                <p className="leading-relaxed" style={{ color: "#acaab1" }}>
                  {step.desc}
                </p>
              </div>

              {/* Mockup side */}
              <div
                className={`border-t p-6 md:border-l md:border-t-0 md:p-8 ${i % 2 === 1 ? "md:order-1 md:border-l-0 md:border-r" : ""}`}
                style={{ borderColor: "rgba(72,71,77,0.4)", backgroundColor: "#0e0e13" }}
              >
                <div
                  className="rounded-xl border-l-4 p-5"
                  style={{
                    backgroundColor: "#131319",
                    borderLeftColor: step.accent,
                  }}
                >
                  {step.mockup}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <section className="mb-24">
          <h2
            className="mb-3 text-center text-3xl font-black tracking-tight md:text-4xl"
            style={{ color: "#f9f5fd" }}
          >
            한 화면에서 모두 해결합니다
          </h2>
          <p className="mb-12 text-center" style={{ color: "#acaab1" }}>
            에이전시 없이도 딜 운영에 필요한 모든 것이 DELO 안에 있습니다
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all hover:brightness-110"
                style={{ backgroundColor: "#19191f" }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: "rgba(163,166,255,0.1)" }}
                >
                  {icon}
                </div>
                <p className="mb-1.5 font-black" style={{ color: "#f9f5fd" }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#acaab1" }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#131319" }}>
          <div
            className="mb-2 inline-block h-px w-24 rounded-full"
            style={{ background: "linear-gradient(to right, transparent, #a3a6ff, transparent)" }}
          />
          <h2 className="mb-3 text-3xl font-black tracking-tight md:text-4xl" style={{ color: "#f9f5fd" }}>
            첫 번째 문의부터 정리해보세요
          </h2>
          <p className="mb-8 font-medium" style={{ color: "#acaab1" }}>
            무료 계정으로 바로 시작 — 카드 불필요
          </p>
          <Link
            href="/parse"
            className="inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-black tracking-tight text-white transition-all hover:brightness-110 active:scale-95"
            style={{
              background: "linear-gradient(to right, #a3a6ff, #a88cfb)",
              boxShadow: "0 8px 32px rgba(163,166,255,0.2)",
            }}
          >
            직접 써보기 →
          </Link>
          <p className="mt-4 text-xs" style={{ color: "#48474d" }}>
            신용카드 불필요 · 가입 후 월 5회 무료
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "#1e1e2e" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fox-icon.svg" width={20} height={20} alt="DELO" />
            <span className="font-black" style={{ color: "#a3a6ff" }}>DELO</span>
          </Link>
          <p className="text-xs" style={{ color: "#48474d" }}>© 2025 DELO</p>
        </div>
      </footer>
    </div>
  );
}
