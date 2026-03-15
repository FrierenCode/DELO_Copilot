import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { LandingCtaButton } from "@/components/landing/LandingCtaButton";

export const metadata: Metadata = {
  title: "Creator Deal Copilot — 협찬 문의 5분 완성",
  description:
    "브랜드 협찬 문의를 붙여넣으면 5분 만에 견적·체크리스트·답장 초안을 자동으로 만들어드립니다. 크리에이터를 위한 딜 관리 도구.",
  openGraph: {
    title: "Creator Deal Copilot",
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

export default async function LandingPage() {
  const dealsCount = await getDealsCount();

  return (
    <div className="flex flex-col items-center gap-16 py-16 text-center sm:py-24">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6">
        {dealsCount !== null && dealsCount > 0 && (
          <p className="rounded-full bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700">
            지금까지 {dealsCount.toLocaleString("ko-KR")}건의 딜이 관리됐어요
          </p>
        )}

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          협찬 문의 붙여넣기.{" "}
          <br className="hidden sm:block" />
          <span className="text-violet-600">5분 만에 견적·답장·저장 완료.</span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-neutral-500">
          브랜드 이메일이나 DM을 붙여넣기만 하면 견적 구조, 계약 체크리스트,
          답장 초안이 자동으로 생성됩니다. 더 이상 수동으로 계산하지 마세요.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <LandingCtaButton
            href="/login"
            variant="primary"
            label="무료로 시작하기"
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
          <LandingCtaButton
            href="/parse"
            variant="secondary"
            label="직접 붙여넣기"
            event="landing_cta_clicked"
            eventProps={{ cta: "parse" }}
          />
        </div>
      </section>

      {/* Feature list */}
      <section className="w-full max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "📋",
              title: "자동 견적 산출",
              desc: "팔로워, 플랫폼, 납기를 반영한 권장 단가를 즉시 계산합니다.",
            },
            {
              icon: "✅",
              title: "계약 체크리스트",
              desc: "빠뜨리기 쉬운 독점 조건, 저작권, 결제 조건을 자동으로 플래그합니다.",
            },
            {
              icon: "✉️",
              title: "AI 답장 초안",
              desc: "협상형·정중형 등 상황에 맞는 답장 초안을 바로 복사할 수 있습니다.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left shadow-sm"
            >
              <p className="mb-2 text-2xl">{icon}</p>
              <p className="mb-1 text-sm font-semibold text-neutral-900">{title}</p>
              <p className="text-xs leading-relaxed text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal footer */}
      <p className="text-xs text-neutral-400">
        이 서비스는 운영 참고용 가이드이며, 법률·세무·회계 자문이 아닙니다.{" "}
        <Link href="/terms" className="underline hover:text-neutral-600">
          이용약관
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="underline hover:text-neutral-600">
          개인정보처리방침
        </Link>
      </p>
    </div>
  );
}
