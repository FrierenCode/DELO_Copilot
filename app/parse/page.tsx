import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ParseInterface } from "@/components/ParseInterface";
import { ThemeInit } from "@/components/ThemeInit";

export default async function ParsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="parse-page min-h-screen" style={{ backgroundColor: "var(--p-bg)" }}>
      <ThemeInit />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ backgroundColor: "var(--p-glow)" }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ backgroundColor: "var(--p-nav-bg)", boxShadow: "var(--p-nav-shadow)" }}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fox-icon.svg" width={26} height={26} alt="DELO" priority />
            <span className="text-lg font-black tracking-tighter" style={{ color: "var(--p-primary)" }}>
              DELO
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95"
                style={{ background: "var(--p-btn-gradient)", color: "white" }}
              >
                대시보드 →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-all hover:brightness-125"
                  style={{ color: "var(--p-muted)" }}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full px-5 py-2 text-sm font-black transition-all hover:brightness-110 active:scale-95"
                  style={{ background: "var(--p-btn-gradient)", color: "white" }}
                >
                  무료로 시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-12">
        {/* Header */}
        <header className="mb-10 text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              backgroundColor: "var(--p-secondary-badge-bg)",
              borderColor: "var(--p-secondary-badge-bd)",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--p-secondary)" }}>
              ✦ AI 분석
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter md:text-4xl" style={{ color: "var(--p-text)" }}>
            브랜드 문의 분석기
          </h1>
        </header>

        <ParseInterface isLoggedIn={!!user} />
      </main>
    </div>
  );
}
