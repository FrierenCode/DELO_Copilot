"use client";

import { useRef, useState } from "react";

export function LandingProductMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setTilt({ x: dy * -7, y: dx * 7 });
  }

  function onMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }

  const shadowX = 6 + tilt.y * 0.6;
  const shadowY = 6 - tilt.x * 0.6;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ perspective: "900px" }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
    >
      {/* Ambient glow that reacts to hover */}
      <div
        className="absolute -inset-6 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at ${50 + tilt.y * 3}% ${50 + tilt.x * 3}%, rgba(99,102,241,${hovered ? 0.22 : 0.1}) 0%, transparent 70%)`,
          filter: "blur(24px)",
        }}
      />

      {/* 3D tilting wrapper */}
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: hovered ? "transform 0.08s ease-out" : "transform 0.6s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outer pixel frame */}
        <div
          className="relative border-2 border-[var(--landing-accent)]/40 bg-[var(--landing-surface)] overflow-hidden"
          style={{
            boxShadow: `${shadowX}px ${shadowY}px 0 rgba(55,48,163,0.85), ${shadowX + 2}px ${shadowY + 2}px 0 rgba(99,102,241,0.18)`,
          }}
        >
          {/* Scanline sweep */}
          <div className="scanline" />

          {/* CRT scanlines */}
          <div className="crt-lines" />

          {/* Title bar — pixel window chrome */}
          <div className="flex items-center gap-2 border-b-2 border-dashed border-[var(--landing-border)] bg-[var(--landing-bg)] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 bg-red-500/50" />
              <div className="h-3 w-3 bg-yellow-500/50" />
              <div className="h-3 w-3 bg-green-500/50" />
            </div>
            <div className="mx-auto flex items-center gap-1.5 border border-[var(--landing-border)] bg-[var(--landing-bg)]/60 px-3 py-1">
              <div className="h-2 w-2 bg-[var(--landing-accent)]/60" />
              <span className="font-pixel text-[8px] text-[var(--landing-muted)]">DELO · 문의 분석</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Raw inquiry snippet */}
            <div className="border border-dashed border-[var(--landing-border)] bg-[var(--landing-bg)]/50 p-3">
              <p className="mb-1.5 font-pixel text-[8px] uppercase tracking-wide text-[var(--landing-muted)]">원문 문의</p>
              <p className="text-xs leading-relaxed text-[var(--landing-muted)] line-clamp-2">
                "안녕하세요! 저희는 친환경 뷰티 브랜드 소프트블룸입니다. 인스타그램 피드 포스팅 1회와 스토리 3회 협찬을 제안드립니다..."
              </p>
            </div>

            {/* Analysis arrow */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 border-t border-dashed border-[var(--landing-accent)]/30" />
              <div className="flex h-6 w-6 items-center justify-center border border-[var(--landing-accent)]/40 bg-[var(--landing-accent)]/15 text-[10px] text-[var(--landing-accent)]">↓</div>
              <div className="h-px flex-1 border-t border-dashed border-[var(--landing-accent)]/30" />
            </div>

            {/* Parsed info row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "브랜드", value: "소프트블룸" },
                { label: "플랫폼", value: "인스타그램" },
                { label: "납기", value: "다음 달" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="border border-[var(--landing-border)] bg-[var(--landing-bg)]/40 p-2 text-center"
                  style={{ boxShadow: "2px 2px 0 rgba(99,102,241,0.2)" }}
                >
                  <p className="text-[10px] text-[var(--landing-muted)]">{label}</p>
                  <p className="mt-0.5 text-xs font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div
              className="border-2 border-[var(--landing-accent)]/40 bg-[var(--landing-accent-soft)] p-3"
              style={{ boxShadow: "4px 4px 0 rgba(99,102,241,0.35)" }}
            >
              <p className="font-pixel text-[8px] text-[var(--landing-muted)] mb-1">AI 적정 견적 범위</p>
              <p className="text-xl font-black text-[var(--landing-accent)]">45 ~ 80만원</p>
              <p className="mt-1 text-[10px] text-[var(--landing-muted)]">팔로워 구간·플랫폼·콘텐츠 유형 기반</p>
            </div>

            {/* Check items */}
            <div className="space-y-1.5">
              {[
                { ok: false, text: "예산 미기재 — 협상 전 확인 필요" },
                { ok: false, text: "콘텐츠 사용권 명시 없음" },
                { ok: true,  text: "납기일 명확 (다음 달)" },
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
            <div className="border border-[var(--landing-border)] bg-[var(--landing-bg)]/40 p-3">
              <p className="mb-1.5 font-pixel text-[8px] text-[var(--landing-muted)]">답장 초안 (정중한 톤)</p>
              <p className="text-[11px] leading-relaxed text-[var(--landing-muted)] line-clamp-2">
                "안녕하세요. 제안 주셔서 감사합니다. 긍정적으로 검토했습니다. 다만 예산과 콘텐츠 사용 범위를 먼저..."
              </p>
            </div>
          </div>
        </div>

        {/* 3D depth shadow layer */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            transform: "translateZ(-30px)",
            background: "rgba(99,102,241,0.12)",
            filter: "blur(18px)",
          }}
        />
      </div>
    </div>
  );
}
