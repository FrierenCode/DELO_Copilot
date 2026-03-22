import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "이용약관 | DELO",
  description: "DELO 서비스 이용에 관한 약관을 안내합니다.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
};

const SECTIONS = [
  { id: "t1",  label: "제1조 목적" },
  { id: "t2",  label: "제2조 정의" },
  { id: "t3",  label: "제3조 약관의 효력" },
  { id: "t4",  label: "제4조 이용 계약" },
  { id: "t5",  label: "제5조 계정 관리" },
  { id: "t6",  label: "제6조 금지 행위" },
  { id: "t7",  label: "제7조 요금제 및 결제" },
  { id: "t8",  label: "제8조 해지 및 환불" },
  { id: "t9",  label: "제9조 서비스 변경·중단·베타" },
  { id: "t10", label: "제10조 제3자 서비스" },
  { id: "t11", label: "제11조 지식재산권" },
  { id: "t12", label: "제12조 콘텐츠 라이선스" },
  { id: "t13", label: "제13조 저작권 침해 신고" },
  { id: "t14", label: "제14조 서비스 면책" },
  { id: "t15", label: "제15조 책임의 제한" },
  { id: "t16", label: "제16조 이용자의 손해배상" },
  { id: "t17", label: "제17조 피드백" },
  { id: "t18", label: "제18조 준거법 및 관할" },
  { id: "t19", label: "제19조 약관의 변경" },
  { id: "t20", label: "제20조 일반 조항" },
  { id: "t21", label: "제21조 문의" },
];

const A = "inline-block h-5 w-0.5 shrink-0 rounded-full bg-[#6366F1] align-middle";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100">
      <header className="fixed top-0 w-full z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fox-icon.svg" width={28} height={28} alt="DELO 로고" />
            <span className="text-xl font-bold tracking-tight text-white">DELO</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">
            서비스 돌아가기 ←
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="overflow-hidden rounded-xl border border-[#1E1E2E] bg-[#13131A]">
            <div className="h-px bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent" />
            <div className="p-8">

              <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-white">이용약관</h1>
                <p className="text-sm text-slate-400">시행일: 2026년 3월 22일 &nbsp;·&nbsp; 최종 업데이트: 2026년 3월 22일</p>
              </header>

              <nav className="mb-10 pb-6 border-b border-[#1E1E2E]">
                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {SECTIONS.map(({ id, label }) => (
                    <li key={id}>
                      <a href={`#${id}`} className="hover:underline underline-offset-4">{label}</a>
                    </li>
                  ))}
                </ul>
              </nav>

              <article className="space-y-10 text-slate-200/90" style={{ lineHeight: 1.85 }}>

                {/* 제1조 */}
                <section id="t1">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제1조 (목적)
                  </h2>
                  <p>
                    이 약관은 DELO 팀(이하 &ldquo;회사&rdquo;)이 운영하는{" "}
                    <strong className="text-white">DELO</strong>(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차,
                    회사와 이용자 간의 권리·의무·책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제2조 */}
                <section id="t2">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제2조 (정의)
                  </h2>
                  <p className="mb-3">이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li><strong className="text-white">&ldquo;서비스&rdquo;</strong>란 회사가 제공하는 웹 기반 AI 딜 관리 플랫폼 및 관련 기능 일체를 말합니다.</li>
                    <li><strong className="text-white">&ldquo;이용자&rdquo;</strong>란 이 약관에 동의하고 서비스를 이용하는 모든 자를 말합니다.</li>
                    <li><strong className="text-white">&ldquo;회원&rdquo;</strong>이란 계정을 생성하여 서비스를 이용하는 자를 말합니다.</li>
                    <li><strong className="text-white">&ldquo;비회원&rdquo;</strong>이란 회원 가입 없이 서비스의 일부 공개 기능을 이용하는 자를 말합니다.</li>
                    <li><strong className="text-white">&ldquo;계정&rdquo;</strong>이란 회원이 서비스에 접근하기 위해 설정한 이메일 주소 및 인증 정보의 조합을 말합니다.</li>
                    <li><strong className="text-white">&ldquo;콘텐츠&rdquo;</strong>란 이용자가 서비스에 입력하거나 서비스를 통해 생성·저장하는 텍스트, 데이터 등 일체를 말합니다.</li>
                    <li><strong className="text-white">&ldquo;베타 기능&rdquo;</strong>이란 정식 출시 전 시험적으로 제공되는 기능으로, 회사가 별도로 베타·실험적·미리보기 등으로 표시한 기능을 말합니다.</li>
                    <li><strong className="text-white">&ldquo;플랜&rdquo;</strong>이란 서비스 이용 범위에 따라 구분된 Free 플랜 및 Standard 플랜을 말합니다.</li>
                    <li><strong className="text-white">&ldquo;피드백&rdquo;</strong>이란 이용자가 서비스 개선을 위해 회사에 제공하는 아이디어, 제안, 의견 등을 말합니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제3조 */}
                <section id="t3">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제3조 (약관의 게시 및 효력)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>이 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
                    <li>이용자가 서비스에 가입하거나 이용을 계속함으로써 이 약관에 동의한 것으로 간주됩니다.</li>
                    <li>만 14세 미만의 미성년자는 서비스에 가입하거나 이용할 수 없습니다.</li>
                    <li>
                      회사의 개인정보 처리에 관한 사항은{" "}
                      <Link href="/privacy" className="text-indigo-400 hover:underline underline-offset-4">개인정보처리방침</Link>에
                      따르며, 이 약관과 함께 서비스 이용 계약의 일부를 구성합니다.
                    </li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제4조 */}
                <section id="t4">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제4조 (이용 계약의 성립)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>이용 계약은 이용자가 회원 가입 신청 시 이 약관에 동의 후 회사가 이를 승낙함으로써 성립합니다.</li>
                    <li>회사는 다음 각 호에 해당하는 경우 승낙을 거부하거나 사후에 이용 계약을 해지할 수 있습니다.
                      <ul className="mt-2 ml-4 space-y-1 list-disc list-inside marker:text-slate-500 text-sm">
                        <li>타인의 명의 또는 허위 정보를 이용한 신청</li>
                        <li>관련 법령 위반 또는 위반 우려가 있는 경우</li>
                        <li>서비스 운영을 방해하거나 방해할 우려가 있는 경우</li>
                        <li>기타 회사가 합리적으로 판단하여 이용을 제한할 필요가 있는 경우</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제5조 */}
                <section id="t5">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제5조 (계정 관리)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>회원은 자신의 계정 정보를 안전하게 관리할 책임이 있으며, 제3자에게 계정을 양도하거나 공유할 수 없습니다.</li>
                    <li>계정의 도용 또는 무단 사용을 인지한 경우 즉시 서비스 내 피드백 기능을 통해 회사에 통보해야 합니다.</li>
                    <li>회원의 관리 소홀로 인한 계정 도용에 대해 회사는 책임을 지지 않습니다.</li>
                    <li>1인 1계정 원칙을 적용하며, 중복 계정 생성은 금지됩니다.</li>
                    <li>
                      <strong className="text-white">회원 탈퇴:</strong> 회원은 서비스 내 설정 페이지에서 언제든지 탈퇴를 신청할 수 있습니다.
                      탈퇴 즉시 계정 및 관련 데이터(딜, 분석 결과, 크리에이터 프로필 등)가 삭제되며, 삭제된 데이터는 복구되지 않습니다.
                      단, 관련 법령(전자상거래법, 국세기본법 등)에 따라 보관 의무가 있는 결제 정보는 법정 보관 기간 동안 보관됩니다.
                    </li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제6조 */}
                <section id="t6">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제6조 (금지 행위)
                  </h2>
                  <p className="mb-3">이용자는 서비스를 이용함에 있어 다음 각 호의 행위를 하여서는 안 됩니다.</p>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>타인의 개인정보, 계정 정보를 도용하거나 허위 정보를 입력하는 행위</li>
                    <li>서비스의 운영을 방해하거나 서버에 과부하를 주는 행위(자동화 스크립트, 크롤링, DDoS 등 포함)</li>
                    <li>스팸, 피싱, 허위·오해를 유발하는 정보를 생성하거나 유포하는 행위</li>
                    <li>인종·민족·성별·종교·장애 등을 이유로 한 혐오 발언 또는 차별적 콘텐츠를 생성·유포하는 행위</li>
                    <li>타인의 개인정보를 무단으로 수집하거나 서비스를 통해 개인정보를 침해하는 행위</li>
                    <li>제3자의 저작권, 상표권, 특허권 등 지식재산권을 침해하는 콘텐츠를 게시하거나 전송하는 행위</li>
                    <li>회사의 사전 서면 동의 없이 서비스를 상업적으로 재판매하거나 API를 무단으로 사용하는 행위</li>
                    <li>서비스의 소스코드, 알고리즘, 데이터베이스 등을 역설계(리버스 엔지니어링)하거나 이를 시도하는 행위</li>
                    <li>바이러스, 악성코드 등 서비스의 정상적인 운영을 방해하는 소프트웨어를 배포하는 행위</li>
                    <li>관련 법령, 이 약관, 공공질서 및 미풍양속에 반하는 일체의 행위</li>
                  </ol>
                  <p className="mt-3 text-sm text-slate-400">
                    위반 시 사전 통지 없이 서비스 이용이 제한되거나 계정이 삭제될 수 있으며, 회사는 이로 인한 손해배상을 청구할 수 있습니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제7조 */}
                <section id="t7">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제7조 (요금제 및 결제)
                  </h2>
                  <ol className="space-y-3 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li><strong className="text-white">Free 플랜:</strong> 무료로 제공되며, 월 5회 문의 분석, 딜 10건 저장, 기본 견적 산출, 답장 초안 1가지 톤이 제공됩니다.</li>
                    <li><strong className="text-white">Standard 플랜:</strong> 월 12,900원(VAT 포함)이며, 무제한 문의 분석, 딜 무제한 저장, 답장 초안 3가지 톤, 스마트 체크리스트, 딜 파이프라인 관리, 실시간 알림이 제공됩니다.</li>
                    <li>결제는 <strong className="text-white">Polar</strong>(결제 대행사)를 통해 처리되며, 구독은 매월 자동으로 갱신됩니다.</li>
                    <li>요금제 및 가격은 사전 공지 후 변경될 수 있습니다. 가격 변경은 다음 구독 갱신 시점부터 적용됩니다.</li>
                    <li>결제 수단의 만료, 한도 초과 등 이용자의 귀책으로 인한 결제 실패 시 서비스 이용이 제한될 수 있습니다.</li>
                    <li>영수증은 Polar의 결제 시스템을 통해 발급됩니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제8조 */}
                <section id="t8">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제8조 (구독 해지 및 환불)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>회원은 언제든지 서비스 내 설정 페이지에서 구독을 해지할 수 있습니다. 해지는 현재 결제 기간 종료 시점에 효력이 발생하며, 이미 결제된 기간의 서비스는 계속 이용할 수 있습니다.</li>
                    <li>환불은 다음 조건을 모두 충족하는 경우에 한해 요청할 수 있습니다.
                      <ul className="mt-2 ml-4 space-y-1 list-disc list-inside marker:text-slate-500 text-sm">
                        <li>최초 결제일로부터 7일 이내</li>
                        <li>해당 결제 기간 내 Standard 플랜 전용 기능을 실질적으로 이용하지 않은 경우</li>
                      </ul>
                    </li>
                    <li>환불 요청은 서비스 내 피드백 기능을 통해 접수할 수 있습니다.</li>
                    <li>환불 처리는 요청 접수 후 영업일 기준 5~10일이 소요될 수 있으며, 원결제 수단으로 환급됩니다.</li>
                    <li>회사의 귀책 사유로 인한 서비스 장애(24시간 이상 지속)의 경우, 해당 기간에 비례한 요금 크레딧을 제공할 수 있습니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제9조 — 베타 서비스 포함 */}
                <section id="t9">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제9조 (서비스의 변경·중단 및 베타 기능)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>회사는 서비스를 지속적으로 개선하기 위해 기능을 추가, 변경 또는 삭제할 수 있습니다. 중요한 변경 사항은 사전에 공지합니다.</li>
                    <li>회사는 설비 점검, 천재지변, 경영상의 중대한 이유 등으로 서비스 전부 또는 일부를 제한하거나 중단할 수 있습니다.</li>
                    <li>서비스 종료 시 회사는 최소 30일 전에 서비스 내 공지 또는 회원 이메일을 통해 통보합니다.</li>
                    <li>회사의 귀책 없는 사유로 인한 서비스 중단에 대해 회사는 책임을 지지 않습니다.</li>
                    <li>
                      <strong className="text-white">베타 기능:</strong> 베타·실험적·미리보기로 표시된 기능은 정식 출시 전 시험적으로 제공되며,
                      언제든 사전 통지 없이 변경·중단될 수 있습니다. 베타 기능은 안정성, 정확성, 가용성을 보장하지 않으며,
                      이용자는 베타 기능 사용으로 인한 데이터 손실, 오류 등의 위험을 인지하고 이를 감수하는 데 동의합니다.
                      베타 기능으로 인한 손해에 대해 회사는 어떠한 책임도 지지 않습니다.
                    </li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제10조 — 제3자 서비스 (NEW) */}
                <section id="t10">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제10조 (제3자 서비스)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>
                      서비스는 다음을 포함한 제3자 서비스를 활용하여 제공됩니다.
                      <ul className="mt-2 ml-4 space-y-1 list-disc list-inside marker:text-slate-500 text-sm">
                        <li><strong className="text-white">Supabase</strong> — 데이터베이스 및 인증</li>
                        <li><strong className="text-white">Cloudflare</strong> — 서버리스 런타임 및 CDN</li>
                        <li><strong className="text-white">Polar</strong> — 결제 처리</li>
                        <li><strong className="text-white">Google (Gemini), OpenAI</strong> — AI 언어 모델</li>
                        <li><strong className="text-white">PostHog</strong> — 사용량 분석</li>
                      </ul>
                    </li>
                    <li>각 제3자 서비스는 자체적인 이용약관 및 개인정보처리방침을 가지며, 이용자는 해당 조건에도 구속됩니다. 회사는 제3자 서비스의 내용, 정책, 운영에 대한 책임을 지지 않습니다.</li>
                    <li>제3자 서비스의 장애, 데이터 처리 방식 변경, 서비스 종료로 인한 DELO 서비스 영향에 대해 회사는 책임을 지지 않습니다.</li>
                    <li>서비스 내 외부 링크는 참고 목적으로만 제공되며, 회사는 해당 외부 사이트의 내용 및 정확성에 대해 보증하지 않습니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제11조 */}
                <section id="t11">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제11조 (지식재산권)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>서비스의 디자인, 텍스트, 로고, 소프트웨어, AI 모델 구성 등 일체의 지식재산권은 회사에 귀속됩니다.</li>
                    <li>이용자는 회사의 명시적 서면 동의 없이 회사의 지식재산을 복제, 배포, 수정, 2차 저작물 생성 등에 이용할 수 없습니다.</li>
                    <li>서비스를 통해 생성된 AI 분석 결과물(견적 범위, 체크리스트, 답장 초안 등)은 이용자가 상업적 목적을 포함하여 자유롭게 활용할 수 있습니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제12조 */}
                <section id="t12">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제12조 (콘텐츠 라이선스)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>이용자가 서비스에 입력한 콘텐츠(브랜드 문의 원문 등)의 소유권은 이용자에게 귀속됩니다.</li>
                    <li>이용자는 서비스 제공에 필요한 범위에서 회사가 해당 콘텐츠를 다음과 같이 이용할 수 있도록 비독점적이고 전 세계적이며 양도 가능한 무상 라이선스를 부여합니다.
                      <ul className="mt-2 ml-4 space-y-1 list-disc list-inside marker:text-slate-500 text-sm">
                        <li>AI 분석 처리를 위한 저장 및 연산</li>
                        <li>서비스 보안 및 품질 개선을 위한 검토</li>
                        <li>익명화·집계 처리를 통한 서비스 개선 및 연구</li>
                      </ul>
                    </li>
                    <li>회사는 이용자의 콘텐츠를 이용자의 동의 없이 제3자에게 판매하거나 마케팅 목적으로 외부에 공개하지 않습니다.</li>
                    <li>이용자는 자신이 입력하는 콘텐츠가 제3자의 권리를 침해하지 않음을 보증합니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제13조 — 저작권 침해 신고 (NEW) */}
                <section id="t13">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제13조 (저작권 침해 신고)
                  </h2>
                  <p className="mb-3">
                    회사는 저작권법 등 지식재산권을 존중합니다. 서비스 내 콘텐츠가 귀하의 저작권을 침해한다고 판단하는 경우,
                    한국 저작권법 제103조에 따라 아래 정보를 포함한 신고를 서비스 내 피드백 기능으로 제출할 수 있습니다.
                  </p>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>침해를 주장하는 저작물의 특정 및 설명</li>
                    <li>침해가 발생한 서비스 내 콘텐츠의 위치(URL 또는 구체적 설명)</li>
                    <li>신고자의 성명, 연락처(이메일 주소)</li>
                    <li>해당 콘텐츠의 이용이 저작권자, 대리인, 법률에 의해 허용되지 않는다는 진술</li>
                    <li>신고 내용이 사실임을 확인하는 진술 및 서명(전자 서명 가능)</li>
                  </ol>
                  <p className="mt-3 text-sm text-slate-400">
                    허위 신고는 법적 책임을 초래할 수 있습니다. 회사는 반복적으로 저작권을 침해하는 이용자의 계정을 제한하거나 삭제할 수 있습니다.
                  </p>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제14조 */}
                <section id="t14">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제14조 (서비스 성격 및 보증 면책)
                  </h2>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-300 text-sm mb-4">
                    DELO가 제공하는 모든 견적 범위, 체크리스트, 답장 초안, 계약 조건 분석은
                    <strong> 운영 참고용 가이드</strong>이며, 법률·세무·회계 자문이 아닙니다.
                    이를 근거로 한 법적·재정적 결정에 대한 책임은 이용자 본인에게 있습니다.
                  </div>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>
                      서비스는 관련 법률이 허용하는 최대 범위에서 &ldquo;있는 그대로(as-is)&rdquo; 및 &ldquo;이용 가능한 상태로(as-available)&rdquo; 제공됩니다.
                      회사는 상품성, 특정 목적에의 적합성, 정확성, 완전성, 비침해성에 대한 묵시적 보증을 포함하여 어떠한 명시적·묵시적 보증도 하지 않습니다.
                    </li>
                    <li>AI가 생성한 결과물은 확률적 언어 모델에 기반하므로 부정확하거나 불완전할 수 있습니다. 중요한 계약 사항은 반드시 법률 전문가의 검토를 받으시기 바랍니다.</li>
                    <li>서비스를 통해 체결된 브랜드 협찬 계약에서 발생하는 분쟁, 손해, 법적 책임에 대해 회사는 어떠한 책임도 지지 않습니다.</li>
                    <li>회사는 서비스가 중단 없이 오류 없이 제공될 것임을 보증하지 않습니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제15조 */}
                <section id="t15">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제15조 (책임의 제한)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>관련 법률이 허용하는 최대 범위에서, 회사는 서비스 이용과 관련하여 발생한 간접 손해, 특별 손해, 결과적 손해, 징벌적 손해, 기대 이익 손실, 데이터 손실에 대해 회사의 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.</li>
                    <li>서비스 이용과 관련하여 회사의 책임이 인정되는 경우에도, 회사의 배상 책임은 해당 이용자가 최근 3개월간 납부한 이용 요금의 합계액을 초과하지 않습니다.</li>
                    <li>회사는 다음 각 호의 손해에 대해 책임을 지지 않습니다.
                      <ul className="mt-2 ml-4 space-y-1 list-disc list-inside marker:text-slate-500 text-sm">
                        <li>이용자의 귀책 사유로 인한 서비스 이용 장애</li>
                        <li>서비스를 통해 이루어진 계약, 거래, 협상의 결과</li>
                        <li>AI 생성 결과물의 정확성·완전성 부족으로 인한 손해</li>
                        <li>제3자 서비스(결제 대행, 클라우드 인프라, AI 모델 등)의 장애로 인한 손해</li>
                        <li>천재지변, 사이버 공격 등 불가항력적 사유로 인한 손해</li>
                        <li>베타 기능 이용으로 인한 손해</li>
                      </ul>
                    </li>
                    <li>일부 관할권에서는 묵시적 보증의 배제 또는 특정 유형의 손해에 대한 책임 제한을 허용하지 않을 수 있으며, 해당 경우 위 제한은 적용되지 않을 수 있습니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제16조 */}
                <section id="t16">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제16조 (이용자의 손해배상)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>이용자는 다음 각 호의 사유로 인하여 회사, 회사의 임직원, 대리인, 파트너에 대해 제3자가 청구하는 손해배상, 손실, 비용(합리적인 법적 비용 포함)을 면책시키고, 이로 인한 손해를 배상할 책임이 있습니다.
                      <ul className="mt-2 ml-4 space-y-1 list-disc list-inside marker:text-slate-500 text-sm">
                        <li>이 약관 또는 관련 법령의 위반</li>
                        <li>이용자가 서비스에 게시하거나 전송한 콘텐츠로 인한 제3자 권리 침해</li>
                        <li>서비스를 통한 이용자의 행위로 인한 제3자 피해</li>
                        <li>이용자가 제공한 정보의 허위·부정확으로 인한 분쟁</li>
                      </ul>
                    </li>
                    <li>회사는 제1항의 사유가 발생한 경우 이용자에게 즉시 통보하고, 이용자는 방어 절차에 협조할 의무가 있습니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제17조 */}
                <section id="t17">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제17조 (피드백)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>이용자가 서비스와 관련하여 회사에 제공하는 버그 제보, 기능 제안, 의견, 아이디어 등의 피드백은 이용자의 지식재산권 주장 없이 회사가 자유롭게 활용할 수 있습니다.</li>
                    <li>회사는 이용자의 피드백을 반영할 의무가 없으며, 피드백에 대한 별도의 보상을 제공하지 않습니다.</li>
                    <li>이용자는 자신이 제공하는 피드백이 제3자의 기밀 정보를 포함하지 않음을 보증합니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제18조 */}
                <section id="t18">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제18조 (준거법 및 관할)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>이 약관은 대한민국 법률에 따라 해석되고 적용됩니다.</li>
                    <li>서비스 이용과 관련하여 분쟁이 발생한 경우, 양 당사자는 성실하게 협의하여 해결하도록 노력합니다.</li>
                    <li>협의로 해결되지 않는 분쟁에 관한 소송은 민사소송법상의 관할 법원을 제1심 법원으로 합니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제19조 */}
                <section id="t19">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제19조 (약관의 변경)
                  </h2>
                  <ol className="space-y-2 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li>회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
                    <li>약관을 변경하는 경우, 회사는 변경 내용과 시행일을 명시하여 시행일로부터 최소 7일 전에 서비스 내 공지합니다. 다만, 이용자에게 불리한 변경의 경우 30일 전에 공지합니다.</li>
                    <li>이용자가 변경된 약관의 시행일 이후에도 서비스를 계속 이용하는 경우, 변경된 약관에 동의한 것으로 간주됩니다.</li>
                    <li>변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제20조 */}
                <section id="t20">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제20조 (일반 조항)
                  </h2>
                  <ol className="space-y-3 list-decimal list-inside marker:text-indigo-400 marker:text-sm">
                    <li><strong className="text-white">전체 합의:</strong> 이 약관 및 개인정보처리방침은 서비스 이용에 관한 당사자 간의 완전한 합의를 구성하며, 이전의 모든 구두·서면 합의를 대체합니다.</li>
                    <li><strong className="text-white">분리 가능성:</strong> 이 약관의 특정 조항이 관할 법원에 의해 무효 또는 집행 불가능으로 판단되더라도, 나머지 조항은 계속하여 완전한 효력을 유지합니다.</li>
                    <li><strong className="text-white">권리 포기 금지:</strong> 회사가 이 약관의 특정 조항을 집행하지 않거나 집행을 지연하더라도, 해당 권리를 포기한 것으로 해석되지 않습니다.</li>
                    <li><strong className="text-white">양도:</strong> 이용자는 회사의 사전 서면 동의 없이 이 약관상의 권리 또는 의무를 제3자에게 양도할 수 없습니다. 회사는 합병, 인수, 사업 양도 등의 경우 이용자의 동의 없이 권리 및 의무를 제3자에게 양도할 수 있습니다.</li>
                    <li><strong className="text-white">불가항력:</strong> 천재지변, 전쟁, 테러, 사이버 공격, 정부 규제, 인터넷 장애 등 합리적인 통제 범위를 벗어난 사유로 인해 의무를 이행하지 못하는 경우 어느 당사자도 책임을 지지 않습니다.</li>
                    <li><strong className="text-white">언어:</strong> 이 약관은 한국어로 작성되었으며, 한국어 버전이 다른 언어 번역본보다 우선합니다.</li>
                  </ol>
                </section>

                <hr className="border-[#1E1E2E]" />

                {/* 제21조 */}
                <section id="t21">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                    <span className={A} />제21조 (문의)
                  </h2>
                  <p>
                    약관 관련 문의 및 이의 제기는{" "}
                    <Link href="/dashboard" className="text-indigo-400 hover:underline underline-offset-4">
                      서비스 내 피드백 기능
                    </Link>
                    을 통해 접수해 주시기 바랍니다. 회사는 접수된 문의에 대해 영업일 기준 3일 이내에 답변하도록 노력합니다.
                  </p>
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
