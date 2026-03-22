export function LandingProductMockup() {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute -inset-4 rounded-3xl bg-[var(--landing-accent)]/8 blur-3xl" />

      {/* Window chrome */}
      <div className="relative rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-[var(--landing-border)] bg-[var(--landing-bg)]/60 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
            <div className="h-3 w-3 rounded-full bg-green-500/50" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)]/40 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-[var(--landing-accent)]/60" />
            <span className="text-[10px] text-[var(--landing-muted)]">delo.app · 문의 분석 결과</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Raw inquiry snippet */}
          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)]/50 p-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--landing-muted)]">원문 문의</p>
            <p className="text-xs leading-relaxed text-[var(--landing-muted)] line-clamp-2">
              "안녕하세요! 저희는 친환경 뷰티 브랜드 소프트블룸입니다. 인스타그램 피드 포스팅 1회와 스토리 3회 협찬을 제안드립니다..."
            </p>
          </div>

          {/* Analysis arrow */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-[var(--landing-accent)]/30" />
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--landing-accent)]/15 text-[10px] text-[var(--landing-accent)]">↓</div>
              <div className="h-px w-8 bg-[var(--landing-accent)]/30" />
            </div>
          </div>

          {/* Parsed info row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "브랜드", value: "소프트블룸" },
              { label: "플랫폼", value: "인스타그램" },
              { label: "납기", value: "다음 달" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg)]/40 p-2 text-center">
                <p className="text-[10px] text-[var(--landing-muted)]">{label}</p>
                <p className="mt-0.5 text-xs font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="rounded-xl border border-[var(--landing-accent)]/25 bg-[var(--landing-accent-soft)] p-3">
            <p className="text-[10px] text-[var(--landing-muted)] mb-0.5">AI 적정 견적 범위</p>
            <p className="text-xl font-black text-[var(--landing-accent)]">45 ~ 80만원</p>
            <p className="mt-1 text-[10px] text-[var(--landing-muted)]">팔로워 구간·플랫폼·콘텐츠 유형 기반</p>
          </div>

          {/* Check items */}
          <div className="space-y-1.5">
            {[
              { ok: false, text: "예산 미기재 — 협상 전 확인 필요" },
              { ok: false, text: "콘텐츠 사용권 명시 없음" },
              { ok: true, text: "납기일 명확 (다음 달)" },
            ].map(({ ok, text }) => (
              <div key={text} className="flex items-start gap-2 text-[11px]">
                <span className={`mt-0.5 shrink-0 font-bold ${ok ? "text-emerald-400" : "text-amber-400"}`}>
                  {ok ? "✓" : "⚠"}
                </span>
                <span className={ok ? "text-[var(--landing-muted)]" : "text-[var(--landing-text)]"}>{text}</span>
              </div>
            ))}
          </div>

          {/* Reply draft preview */}
          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)]/40 p-3">
            <p className="mb-1.5 text-[10px] font-semibold text-[var(--landing-muted)]">응답 초안 (정중한 톤)</p>
            <p className="text-[11px] leading-relaxed text-[var(--landing-muted)] line-clamp-2">
              "안녕하세요. 제안 주셔서 감사합니다. 긍정적으로 검토했습니다. 다만 예산과 콘텐츠 사용 범위를 먼저..."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
