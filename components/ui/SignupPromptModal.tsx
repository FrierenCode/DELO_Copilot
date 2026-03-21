"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SignupPromptModal({ open, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 160);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        backgroundColor: `rgba(0,0,0,${animating ? 0.45 : 0})`,
        transition: "background-color 180ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: animating ? "scale(1)" : "scale(0.92)",
          opacity: animating ? 1 : 0,
          transition: animating
            ? "transform 220ms ease-out, opacity 220ms ease-out"
            : "transform 160ms ease-in, opacity 160ms ease-in",
          backgroundColor: "var(--p-surface)",
          border: "1px solid var(--p-card-border)",
        }}
        className="relative w-full max-w-[420px] rounded-2xl px-8 py-8 shadow-2xl"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="p-close-btn absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition-colors"
          aria-label="닫기"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: "var(--p-primary-soft)" }}
          >
            ✨
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-lg font-bold" style={{ color: "var(--p-text)" }}>
              답장 초안을 저장하고 바로 보내세요
            </p>
            <p className="text-sm" style={{ color: "var(--p-muted)" }}>
              무료 계정을 만들면 월 5회 분석 + 답장 저장이 가능합니다
            </p>
          </div>
          <Link
            href="/signup"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-black text-white transition-all hover:brightness-110 active:scale-95"
            style={{ background: "var(--p-btn-gradient)", boxShadow: "var(--p-btn-shadow)" }}
          >
            무료로 시작하기 →
          </Link>
          <p className="text-xs" style={{ color: "var(--p-dim)" }}>카드 불필요 · 30초 가입</p>
        </div>
      </div>
    </div>
  );
}
