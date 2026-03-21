"use client";

import { useEffect } from "react";

/** localStorage에 저장된 테마를 html 클래스로 복원합니다. */
export function ThemeInit() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("landing-theme");
      document.documentElement.classList.toggle("landing-light", saved === "light");
    } catch {
      // ignore
    }
  }, []);
  return null;
}
