"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "sent" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle" && status !== "error") return;
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const redirectTo =
      process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  function handleReset() {
    setEmail("");
    setStatus("idle");
    setErrorMessage("");
  }

  return (
    <div
      className="min-h-screen flex flex-col text-[#F8FAFC]"
      style={{
        background: "radial-gradient(circle at center, #1e1b4b 0%, #0A0A0F 100%)",
      }}
    >
      <header className="fixed top-0 left-0 w-full p-8 z-10">
        <Link href="/" className="flex w-fit items-center gap-2">
          <div className="text-[#6366F1]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">DELO</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="w-full max-w-[420px] mx-auto">
            {status === "sent" ? (
              <div className="bg-[#13131A] border border-slate-800 rounded-2xl p-8 shadow-2xl motion-safe:animate-[loginSuccessCard_360ms_ease-out]">
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 bg-[#6366F1]/20 rounded-full flex items-center justify-center mb-6 text-[#6366F1]">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-3">이메일을 확인해 주세요</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    <span className="text-[#6366F1] font-medium italic">{email}</span> 으로
                    <br />
                    로그인 링크를 보냈습니다.
                  </p>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#6366F1] transition-colors text-sm font-medium"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M19 12H5m7-7-7 7 7 7" />
                    </svg>
                    다른 이메일로 시도하기
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#13131A] border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-12 h-12 bg-[#6366F1]/10 rounded-xl flex items-center justify-center mb-4 text-[#6366F1]">
                    <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L4.09 12.26c-.4.48-.6.72-.6.99 0 .22.08.43.24.58.16.15.37.17.6.17H12l-1 8.74 8.91-10.26c.4-.48.6-.72.6-.99 0-.22-.08-.43-.24-.58-.16-.15-.37-.17-.6-.17H12l1-8.74z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-100 mb-2">로그인</h1>
                  <p className="text-slate-400 text-sm">이메일로 로그인 링크를 받으세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1"
                    >
                      이메일 주소
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={status === "loading"}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-[#6366F1] transition-all disabled:opacity-50"
                    />
                  </div>

                  {status === "error" && (
                    <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                      {errorMessage || "오류가 발생했습니다. 다시 시도해 주세요."}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-bold py-3.5 rounded-full transition-all shadow-lg shadow-[#6366F1]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "전송 중..." : "로그인 링크 받기"}
                  </button>
                </form>

                <div className="relative my-8 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative px-4 bg-[#13131A] text-slate-500 text-xs font-medium">
                    또는
                  </span>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-transparent border border-slate-800 hover:bg-slate-800/50 text-slate-200 py-3.5 rounded-full transition-all"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-black text-[10px] font-bold text-white">
                    G
                  </span>
                  <span className="font-medium">Google로 계속하기</span>
                </button>

                <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-500">
                  계속 진행하면{" "}
                  <Link href="/terms" className="underline hover:text-slate-400 transition-colors">
                    이용약관
                  </Link>{" "}
                  및{" "}
                  <Link href="/privacy" className="underline hover:text-slate-400 transition-colors">
                    개인정보처리방침
                  </Link>
                  에 동의하는 것으로 간주됩니다.
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="w-full max-w-[420px] mx-auto bg-[#13131A]/50 border border-slate-800/50 rounded-2xl p-8 backdrop-blur-sm motion-safe:animate-[loginPreviewCard_500ms_ease-out]">
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-16 h-16 bg-[#6366F1]/20 rounded-full flex items-center justify-center mb-6 text-[#6366F1]">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-3">이메일을 확인해 주세요</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  <span className="text-[#6366F1] font-medium italic">you@example.com</span> 으로
                  <br />
                  로그인 링크를 보냈습니다.
                </p>
                <button
                  type="button"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#6366F1] transition-colors text-sm font-medium"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M19 12H5m7-7-7 7 7 7" />
                  </svg>
                  다른 이메일로 시도하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center">
        <p className="text-slate-600 text-xs">© 2025 DELO Copilot. All rights reserved.</p>
      </footer>

      <style jsx>{`
        @keyframes loginSuccessCard {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes loginPreviewCard {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
