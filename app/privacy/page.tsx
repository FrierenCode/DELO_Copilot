import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "개인정보처리방침 | DELO",
  description: "DELO 서비스의 개인정보 수집·이용·보호 방침을 안내합니다.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
};

const SECTIONS = [
  { id: "p1",  label: "1. 수집 항목" },
  { id: "p2",  label: "2. 수집 목적" },
  { id: "p3",  label: "3. 보유 기간" },
  { id: "p4",  label: "4. 처리 위탁" },
  { id: "p5",  label: "5. 국외 이전" },
  { id: "p6",  label: "6. 파기 절차" },
  { id: "p7",  label: "7. 쿠키" },
  { id: "p8",  label: "8. 이용자 권리" },
  { id: "p9",  label: "9. 아동" },
  { id: "p10", label: "10. 보안 조치" },
  { id: "p11", label: "11. 방침 변경" },
  { id: "p12", label: "12. 문의" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
      <span className="inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1]" />
      {children}
    </h2>
  );
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#1E1E2E]">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-[#0D0D14]" : "bg-[#13131A]"}>
              {cells.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 text-slate-400 border-r border-[#1E1E2E] last:border-r-0 ${j === 0 ? "font-semibold text-slate-300 whitespace-nowrap" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
                <p className="text-sm text-slate-400">시행일: 2026년 3월 1일 &nbsp;·&nbsp; 최종 업데이트: 2026년 3월 22일</p>
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  DELO(이하 "회사")는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에
                  관한 법률」 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 보호하기 위해
                  다음과 같이 개인정보처리방침을 수립·공개합니다.
                </p>
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

                {/* 1 */}
                <section id="p1">
                  <SectionHeading>1. 수집하는 개인정보 항목</SectionHeading>
                  <p className="mb-4 text-sm text-slate-400">회사는 서비스 제공에 필요한 최소한의 개인정보만 수집합니다.</p>
                  <Table rows={[
                    ["수집 시점", "수집 항목"],
                    ["회원 가입 시", "이메일 주소, 소셜 로그인 프로필(OAuth 제공자명, 고유 ID)"],
                    ["크리에이터 프로필 등록 시", "팔로워 규모 구간, 평균 조회수 구간, 주요 플랫폼, 활동 분야, 활동 지역, 통화 단위, 최저 단가"],
                    ["브랜드 문의 분석 시", "입력한 문의 텍스트(SHA-256 해시 후 저장, 원문은 캐시 목적으로 일시 보관 후 파기)"],
                    ["결제 시", "결제 수단 정보(Polar가 직접 수집·보관, 회사는 구독 상태·기간만 저장)"],
                    ["서비스 이용 중 자동 수집", "접속 IP, 브라우저 종류·버전, 방문 일시, 서비스 이용 기록, 오류 로그"],
                  ]} />
                  <p className="mt-4 text-sm text-slate-400">
                    회원 탈퇴 후에는 법령에 따른 보존 의무가 있는 정보를 제외하고 지체 없이 파기합니다.
                    비회원(미로그인 상태)이 분석 기능을 이용할 경우 입력 텍스트의 해시값만 임시 저장되며,
                    이용자를 식별하는 정보는 수집하지 않습니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 2 */}
                <section id="p2">
                  <SectionHeading>2. 개인정보 수집 및 이용 목적</SectionHeading>
                  <Table rows={[
                    ["목적", "처리하는 정보"],
                    ["회원 인증 및 계정 관리", "이메일 주소, OAuth 식별자"],
                    ["AI 문의 분석·견적 산출·답장 초안 제공", "문의 텍스트 해시, 크리에이터 프로필"],
                    ["딜 파이프라인 저장·추적", "딜 정보, 계정 식별자"],
                    ["요금제 관리 및 결제 처리", "구독 상태, Polar 고객 ID"],
                    ["서비스 개선 및 통계 분석", "서비스 이용 기록, 이벤트 로그(비식별화)"],
                    ["오류 감지 및 보안 유지", "오류 로그, 접속 IP"],
                    ["법적 의무 이행 및 분쟁 해결", "거래 기록, 계정 정보"],
                  ]} />
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 3 */}
                <section id="p3">
                  <SectionHeading>3. 개인정보 보유 및 이용 기간</SectionHeading>
                  <p className="mb-4 text-sm text-slate-400">
                    회사는 수집 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
                    단, 관련 법령에 따라 일정 기간 보존해야 하는 경우 아래와 같이 보관합니다.
                  </p>
                  <Table rows={[
                    ["근거 법령", "보존 항목", "보존 기간"],
                    ["전자상거래법", "계약·청약 철회 기록", "5년"],
                    ["전자상거래법", "대금 결제·재화 공급 기록", "5년"],
                    ["전자상거래법", "소비자 불만·분쟁 처리 기록", "3년"],
                    ["통신비밀보호법", "서비스 이용 로그", "3개월"],
                    ["국세기본법", "세금계산서·영수증", "5년"],
                  ]} />
                  <p className="mt-4 text-sm text-slate-400">
                    브랜드 문의 원문은 AI 처리 완료 즉시 파기되며, 해시값은 중복 분석 방지를 위해
                    계정 삭제 시까지 보관됩니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 4 */}
                <section id="p4">
                  <SectionHeading>4. 개인정보 처리 위탁</SectionHeading>
                  <p className="mb-4 text-sm text-slate-400">
                    회사는 서비스 운영을 위해 아래 수탁자에게 개인정보 처리 업무를 위탁합니다.
                    수탁자가 위탁 범위를 벗어나 개인정보를 이용하는 것을 금지하며, 관련 사항을
                    계약서에 명시합니다.
                  </p>
                  <Table rows={[
                    ["수탁자", "위탁 업무", "보유 기간"],
                    ["Supabase Inc.", "데이터베이스·인증 인프라 운영", "서비스 계약 기간"],
                    ["Cloudflare Inc.", "서버·CDN·보안 운영", "서비스 계약 기간"],
                    ["Polar Inc.", "결제 처리 및 구독 관리", "전자상거래법 규정 기간"],
                    ["OpenAI, LLC", "AI 문의 분석(문의 해시 전송, 원문 미전송)", "처리 직후 파기"],
                    ["Google LLC", "AI 문의 분석(문의 해시 전송, 원문 미전송)", "처리 직후 파기"],
                    ["PostHog Inc.", "서비스 이용 통계 분석(비식별)", "서비스 계약 기간"],
                    ["Sentry (Functional Software, Inc.)", "오류 로그 모니터링", "서비스 계약 기간"],
                  ]} />
                  <p className="mt-4 text-sm text-slate-400">
                    AI 처리 수탁자(OpenAI, Google)에게는 문의 원문이 아닌 해시 처리된 텍스트가
                    전송됩니다. 이름·연락처 등 직접 식별 정보는 어떠한 AI 처리 수탁자에도
                    전송하지 않습니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 5 */}
                <section id="p5">
                  <SectionHeading>5. 개인정보의 국외 이전</SectionHeading>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    위 수탁자 중 일부(Supabase, Cloudflare, OpenAI, Google, PostHog, Polar, Sentry)는
                    미국에 서버를 운영합니다. 이용자의 개인정보는 해당 수탁자의 데이터 처리 과정에서
                    미국으로 이전될 수 있습니다. 회사는 개인정보 보호법 제28조의8에 따라 표준
                    계약 조항 또는 동등한 보호 수준을 갖춘 계약을 통해 이전 시 안전성을 확보합니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 6 */}
                <section id="p6">
                  <SectionHeading>6. 개인정보 파기 절차 및 방법</SectionHeading>
                  <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                    <p>
                      <span className="font-semibold text-slate-200">파기 절차:</span>{" "}
                      보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 별도 데이터베이스로
                      이동 후 내부 방침 및 관련 법령에 따라 일정 기간 보관한 뒤 파기합니다.
                    </p>
                    <p>
                      <span className="font-semibold text-slate-200">전자적 파일:</span>{" "}
                      데이터베이스에서 영구 삭제하며 복원이 불가능한 방법으로 처리합니다.
                    </p>
                    <p>
                      <span className="font-semibold text-slate-200">회원 탈퇴 시:</span>{" "}
                      대시보드 내 계정 삭제 기능을 통해 즉시 탈퇴할 수 있으며, 법령 보존 의무 항목을
                      제외한 모든 개인정보는 30일 이내에 파기됩니다.
                    </p>
                  </div>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 7 */}
                <section id="p7">
                  <SectionHeading>7. 쿠키 및 자동 수집 정보</SectionHeading>
                  <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                    <p>
                      회사는 서비스 운영을 위해 쿠키(Cookie) 및 유사 기술을 사용합니다.
                      쿠키는 브라우저에 저장되는 소량의 텍스트 파일로, 이용자의 로그인 상태 유지와
                      서비스 환경 설정에 사용됩니다.
                    </p>
                    <Table rows={[
                      ["쿠키 유형", "목적", "보존 기간"],
                      ["필수(세션)", "로그인 상태 유지·인증", "세션 종료 시 삭제"],
                      ["기능", "테마·언어 설정 저장", "1년"],
                      ["분석(PostHog)", "서비스 이용 행태 통계(비식별)", "1년"],
                    ]} />
                    <p>
                      브라우저 설정에서 쿠키 수락을 거부할 수 있으나, 이 경우 일부 서비스
                      기능(로그인 유지 등)이 제한될 수 있습니다. 분석 쿠키는 서비스 첫 방문 시
                      표시되는 쿠키 배너를 통해 선택적으로 거부할 수 있습니다.
                    </p>
                  </div>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 8 */}
                <section id="p8">
                  <SectionHeading>8. 이용자의 권리 및 행사 방법</SectionHeading>
                  <p className="mb-4 text-sm text-slate-400">
                    이용자는 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-400">
                    {[
                      ["열람권", "보유 중인 본인 개인정보 열람을 요청할 수 있습니다."],
                      ["정정권", "부정확하거나 불완전한 정보의 정정을 요청할 수 있습니다."],
                      ["삭제권(잊힐 권리)", "처리 목적이 달성되었거나 동의를 철회한 경우 삭제를 요청할 수 있습니다."],
                      ["처리 제한권", "열람·정정·삭제 이의를 제기한 기간 동안 처리 제한을 요청할 수 있습니다."],
                      ["이의 제기권", "자동화된 처리(AI 분석)에 대해 이의를 제기하고 사람에 의한 재검토를 요청할 수 있습니다."],
                      ["철회권", "동의에 기반한 처리에 대해 언제든지 동의를 철회할 수 있습니다."],
                    ].map(([title, desc]) => (
                      <li key={title} className="flex gap-3">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-900/40 text-[10px] font-black text-indigo-400">✓</span>
                        <span><span className="font-semibold text-slate-200">{title} —</span> {desc}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-slate-400">
                    권리 행사는 대시보드 내 계정 설정 또는 아래 개인정보 보호 담당자에게 서면·이메일로
                    요청할 수 있습니다. 요청 접수 후 법정 기간(10일) 이내에 조치 결과를 안내합니다.
                    법령에 따른 의무 보존 기간 중인 정보는 삭제 요청이 제한될 수 있습니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 9 */}
                <section id="p9">
                  <SectionHeading>9. 아동의 개인정보 보호</SectionHeading>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    DELO는 만 14세 미만 아동을 대상으로 서비스를 제공하지 않으며, 만 14세 미만
                    아동의 개인정보를 의도적으로 수집하지 않습니다. 만 14세 미만 이용자가
                    서비스를 이용하고 있음을 발견한 경우, 해당 계정의 데이터를 지체 없이 삭제합니다.
                    이에 해당하는 사실을 인지하셨다면 아래 문의처로 알려주시기 바랍니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 10 */}
                <section id="p10">
                  <SectionHeading>10. 개인정보 보호를 위한 기술적·관리적 조치</SectionHeading>
                  <ul className="space-y-2 text-sm text-slate-400">
                    {[
                      ["전송 구간 암호화", "모든 데이터는 TLS 1.2 이상으로 암호화 전송됩니다."],
                      ["저장 암호화", "비밀번호는 bcrypt로 단방향 암호화하여 저장하며, 원문은 보관하지 않습니다."],
                      ["접근 권한 최소화", "개인정보에 접근할 수 있는 내부 인원을 최소화하고, 접근 이력을 기록합니다."],
                      ["Row-Level Security", "Supabase RLS 정책을 통해 이용자가 자신의 데이터에만 접근할 수 있도록 제한합니다."],
                      ["정기 보안 점검", "취약점 점검 및 의존성 업데이트를 정기적으로 수행합니다."],
                    ].map(([title, desc]) => (
                      <li key={title} className="flex gap-3">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-900/40 text-[10px] font-black text-indigo-400">✓</span>
                        <span><span className="font-semibold text-slate-200">{title} —</span> {desc}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 11 */}
                <section id="p11">
                  <SectionHeading>11. 개인정보처리방침의 변경</SectionHeading>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    법령·서비스 변경 등의 이유로 본 방침이 변경될 경우, 시행 7일 전에 서비스 내
                    공지사항 또는 이메일을 통해 안내합니다. 이용자의 권리에 중대한 영향을 미치는
                    변경의 경우에는 30일 전에 고지합니다. 개정 방침은 공지된 시행일로부터 효력이
                    발생하며, 변경 이전의 개인정보는 변경 전 방침에 따라 처리됩니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 12 */}
                <section id="p12">
                  <SectionHeading>12. 개인정보 보호 담당자 및 문의</SectionHeading>
                  <p className="mb-4 text-sm text-slate-400 leading-relaxed">
                    개인정보 처리에 관한 문의, 불만, 권리 행사 요청은 아래 담당자에게 연락하시기
                    바랍니다. 접수 후 10일 이내에 답변 드리겠습니다.
                  </p>
                  <Table rows={[
                    ["개인정보 보호 담당자", "DELO 개인정보보호팀"],
                    ["이메일", "privacy@delo-app.com"],
                    ["처리 기간", "접수 후 10일 이내"],
                  ]} />
                  <p className="mt-6 text-sm text-slate-400 leading-relaxed">
                    이용자는 개인정보 침해로 인한 구제를 받기 위하여 아래 기관에 분쟁 해결이나
                    상담을 신청할 수 있습니다.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-400">
                    <li>
                      <span className="font-semibold text-slate-300">개인정보 침해신고센터</span>{" "}
                      — privacy.kisa.or.kr / ☎ 118
                    </li>
                    <li>
                      <span className="font-semibold text-slate-300">개인정보 분쟁조정위원회</span>{" "}
                      — www.kopico.go.kr / ☎ 1833-6972
                    </li>
                    <li>
                      <span className="font-semibold text-slate-300">대검찰청 사이버수사과</span>{" "}
                      — spo.go.kr / ☎ 1301
                    </li>
                    <li>
                      <span className="font-semibold text-slate-300">경찰청 사이버범죄 신고시스템</span>{" "}
                      — ecrm.cyber.go.kr / ☎ 182
                    </li>
                  </ul>
                </section>

              </article>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
