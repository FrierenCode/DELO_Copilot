"use client";

import { useState, useEffect } from "react";

const COOKIE_KEY = "cdc_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (SSR / private browsing) — hide banner
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(COOKIE_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="쿠키 동의"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white px-4 py-3 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="flex-1 text-xs text-neutral-600">
          이 사이트는 서비스 개선을 위해 필수 쿠키와 분석 쿠키를 사용합니다.{" "}
          <a href="/privacy" className="underline hover:text-neutral-900">
            개인정보처리방침
          </a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700"
        >
          동의
        </button>
      </div>
    </div>
  );
}
