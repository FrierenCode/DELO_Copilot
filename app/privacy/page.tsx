import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — Creator Deal Copilot",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">
        개인정보처리방침
      </h1>
      <div className="prose prose-neutral text-sm leading-relaxed text-neutral-700">
        <p className="mb-4">최종 업데이트: 2026년 3월</p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">1. 수집하는 정보</h2>
        <p className="mb-4">
          Creator Deal Copilot은 서비스 제공을 위해 이메일 주소, 크리에이터 프로필 정보(팔로워 규모,
          주요 플랫폼, 활동 분야 등), 브랜드 문의 내용, 서비스 이용 기록을 수집합니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">2. 정보의 이용</h2>
        <p className="mb-4">
          수집한 정보는 견적 산출, 계약 체크리스트 생성, 답장 초안 제공 등 핵심 서비스 운영에만
          사용됩니다. LLM 프로바이더(OpenAI, Google AI)로 처리되는 문의 내용은 분석 후 저장되지
          않으며, 개인 식별 정보는 전송하지 않습니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">3. 제3자 공유</h2>
        <p className="mb-4">
          법적 의무 이행, 결제 처리(Polar), 분석(PostHog), 오류 모니터링(Sentry) 목적 외에는
          개인정보를 제3자와 공유하지 않습니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">4. 데이터 보존</h2>
        <p className="mb-4">
          계정 삭제 요청 시 30일 이내에 개인 데이터를 삭제합니다. 결제 기록은 세무·법적 의무에 따라
          일정 기간 보존될 수 있습니다.
        </p>

        <h2 className="mb-2 mt-6 text-base font-semibold text-neutral-900">5. 문의</h2>
        <p>
          개인정보 관련 문의:{" "}
          <a href="mailto:privacy@creatordealcopilot.com" className="text-violet-600 underline">
            privacy@creatordealcopilot.com
          </a>
        </p>
      </div>
    </div>
  );
}
