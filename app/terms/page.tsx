import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — Creator Deal Copilot",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">이용약관</h1>
      <div className="prose prose-neutral text-sm leading-relaxed text-neutral-700">
        <p className="mb-4">최종 업데이트: 2026년 3월</p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">1. 서비스 성격</h2>
        <p className="mb-4">
          Creator Deal Copilot은 크리에이터가 브랜드 협찬 문의를 분석하고 관리하는 데 도움을
          주는 운영 지원 도구입니다. 본 서비스가 제공하는 견적, 체크리스트, 답장 초안은{" "}
          <strong>운영 참고용 가이드이며, 법률·세무·회계 자문이 아닙니다.</strong>
        </p>
        <p className="mb-4">
          계약 체결 전 법적·세무적 사항에 대해서는 반드시 전문가의 조언을 구하시기 바랍니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">2. 이용 조건</h2>
        <p className="mb-4">
          서비스를 이용함으로써 본 약관에 동의하는 것으로 간주됩니다. 불법적 목적, 스팸 생성,
          타인의 정보 무단 사용 등은 금지됩니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">3. 플랜 및 결제</h2>
        <p className="mb-4">
          Free 플랜은 월 5회 파싱, 10건 Deal 저장이 제한됩니다. Pro 플랜은 무제한 이용이
          가능하며 Stripe를 통해 청구됩니다. 환불 정책은 결제 완료 후 7일 이내 미사용 건에
          한해 적용됩니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">4. 책임 제한</h2>
        <p className="mb-4">
          본 서비스는 "있는 그대로(as-is)" 제공됩니다. 서비스 이용으로 인한 수익 손실, 계약
          분쟁, 법적 불이익에 대해 Creator Deal Copilot은 책임을 지지 않습니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">5. 면책 고지</h2>
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-amber-800">
          이 서비스가 제공하는 모든 견적, 체크리스트, 확인 항목은 운영 참고용 가이드입니다.
          법률·세무·회계 자문이 아니며, 이를 근거로 한 법적·재정적 결정에 대한 책임은
          이용자 본인에게 있습니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">6. 문의</h2>
        <p>
          약관 관련 문의:{" "}
          <a href="mailto:support@creatordealcopilot.com" className="text-violet-600 underline">
            support@creatordealcopilot.com
          </a>
        </p>
      </div>
    </div>
  );
}
