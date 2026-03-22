"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mapToApiProfile, type PrdOnboardingData } from "@/lib/creator-profile-mapper";

// ─── Step options ─────────────────────────────────────────────────────────────

type Option = { value: string; label: string; sublabel?: string };

type PlatformOption = Option & {
  iconBg: string;
  icon: React.ReactNode;
};

const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    value: "youtube",
    label: "YouTube",
    sublabel: "구독자 수 기준",
    iconBg: "bg-red-600/10",
    icon: (
      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    value: "instagram",
    label: "Instagram",
    sublabel: "팔로워 수 기준",
    iconBg: "bg-pink-600/10",
    icon: (
      <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    value: "tiktok",
    label: "TikTok",
    sublabel: "팔로워 수 기준",
    iconBg: "bg-white/10",
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.03 1.64-.13.47-.11.97-.01 1.45.18.9.82 1.69 1.62 2.09.84.4 1.85.39 2.69-.04.66-.33 1.14-.93 1.35-1.62.15-.5.18-1.03.18-1.55 0-4.04-.02-8.08-.01-12.12z" />
      </svg>
    ),
  },
  {
    value: "other",
    label: "기타",
    sublabel: "블로그, 트위터 등",
    iconBg: "bg-blue-600/10",
    icon: (
      <span className="text-2xl font-bold text-blue-400">···</span>
    ),
  },
];

const NICHE_OPTIONS: Option[] = [
  { value: "beauty", label: "뷰티/패션" },
  { value: "gaming", label: "게임" },
  { value: "lifestyle", label: "라이프스타일" },
  { value: "tech", label: "테크" },
  { value: "food", label: "푸드" },
];

const AUDIENCE_OPTIONS: Option[] = [
  { value: "under_10k", label: "1만 미만" },
  { value: "10k_50k", label: "1만~5만" },
  { value: "50k_150k", label: "5만~15만" },
  { value: "150k_300k", label: "15만~30만" },
  { value: "300k_plus", label: "30만 이상" },
];

const AVG_VIEWS_OPTIONS: Option[] = [
  { value: "under_10k", label: "1만 미만" },
  { value: "10k_50k", label: "1만~5만" },
  { value: "50k_150k", label: "5만~15만" },
  { value: "150k_plus", label: "15만 이상" },
];

const GEO_OPTIONS: Option[] = [
  { value: "korea", label: "국내 (한국)" },
  { value: "english", label: "영어권" },
  { value: "other", label: "기타 지역" },
];

const TOTAL_STEPS = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardData = {
  primary_platform: string;
  niche: string;
  audience_band: string;
  avg_views_band: string;
  geo_region: string;
  floor_rate: string;
};

const EMPTY_DATA: WizardData = {
  primary_platform: "",
  niche: "",
  audience_band: "",
  avg_views_band: "",
  geo_region: "",
  floor_rate: "",
};

function previewValue(step: number, data: WizardData): string | null {
  switch (step) {
    case 1:
      return PLATFORM_OPTIONS.find((opt) => opt.value === data.primary_platform)?.label ?? null;
    case 2:
      return NICHE_OPTIONS.find((opt) => opt.value === data.niche)?.label ?? null;
    case 3:
      return AUDIENCE_OPTIONS.find((opt) => opt.value === data.audience_band)?.label ?? null;
    case 4:
      return AVG_VIEWS_OPTIONS.find((opt) => opt.value === data.avg_views_band)?.label ?? null;
    case 5:
      return GEO_OPTIONS.find((opt) => opt.value === data.geo_region)?.label ?? null;
    case 6:
      return data.floor_rate ? `₩${Number(data.floor_rate).toLocaleString("ko-KR")}` : null;
    default:
      return null;
  }
}

// ─── Step copy ────────────────────────────────────────────────────────────────

function stepHeading(step: number): string {
  switch (step) {
    case 1: return "주로 활동하는 플랫폼이 어디인가요?";
    case 2: return "어떤 카테고리의 콘텐츠를 만드시나요?";
    case 3: return "팔로워가 몇 명인가요?";
    case 4: return "평균 조회수는 어느 정도인가요?";
    case 5: return "주요 시청자는 어디에 계신가요?";
    case 6: return "최소 희망 단가를 설정해 주세요";
    default: return "";
  }
}

function stepSubheading(step: number): string {
  switch (step) {
    case 1: return "가장 많은 팔로워가 있는 플랫폼을 선택해 주세요.";
    case 2: return "내 콘텐츠를 가장 잘 나타내는 카테고리를 선택해 주세요.";
    case 3: return "팔로워 수에 가장 가까운 구간을 선택해 주세요.";
    case 4: return "게시물당 평균 조회수에 가장 가까운 구간을 선택해 주세요.";
    case 5: return "주요 시청자가 위치한 지역을 선택해 주세요.";
    case 6: return "수락할 최소 딜 금액을 KRW로 입력해 주세요. 양의 정수여야 합니다.";
    default: return "";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CHECK_ICON = (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

function SelectionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative p-5 rounded-2xl border cursor-pointer text-center font-semibold transition-all",
        selected
          ? "border-[#6366F1] bg-[#6366F1]/5 text-[#F8FAFC]"
          : "border-[#27272A] bg-[#13131A] text-[#94A3B8] hover:border-[#3F3F46] hover:bg-[#1C1C24] hover:text-[#F8FAFC]",
      ].join(" ")}
      style={selected ? { boxShadow: "0 0 0 1px #6366F1" } : undefined}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 bg-[#6366F1] rounded-full flex items-center justify-center text-white">
          {CHECK_ICON}
        </span>
      )}
      {children}
    </button>
  );
}

function TextOptionGrid({
  options,
  value,
  onSelect,
}: {
  options: Option[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      {options.map((opt) => (
        <SelectionCard key={opt.value} selected={value === opt.value} onClick={() => onSelect(opt.value)}>
          {opt.label}
        </SelectionCard>
      ))}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(EMPTY_DATA);
  const [floorRateError, setFloorRateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleSelect(field: keyof WizardData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function validateFloorRate(val: string): string | null {
    if (!val.trim()) return "최소 단가를 입력해 주세요.";
    const n = Number(val);
    if (!Number.isInteger(n) || n < 1) return "양의 정수를 입력해 주세요.";
    return null;
  }

  function isStepValid(): boolean {
    switch (step) {
      case 1: return data.primary_platform !== "";
      case 2: return data.niche !== "";
      case 3: return data.audience_band !== "";
      case 4: return data.avg_views_band !== "";
      case 5: return data.geo_region !== "";
      case 6: return validateFloorRate(data.floor_rate) === null;
      default: return false;
    }
  }

  function handleNext() {
    if (!isStepValid()) return;
    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (submitting) return;

    const floorErr = validateFloorRate(data.floor_rate);
    if (floorErr) {
      setFloorRateError(floorErr);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const prdData: PrdOnboardingData = {
      primary_platform: data.primary_platform,
      niche: data.niche,
      audience_band: data.audience_band,
      avg_views_band: data.avg_views_band,
      geo_region: data.geo_region,
      floor_rate: parseInt(data.floor_rate, 10),
    };

    try {
      const res = await fetch("/api/creator-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapToApiProfile(prdData)),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const msg =
          (json as { error?: { message?: string } })?.error?.message ??
          "저장에 실패했습니다. 다시 시도해 주세요.";
        setSubmitError(msg);
        setSubmitting(false);
        return;
      }

      router.push("/dashboard/intake");
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  // ── Step content ───────────────────────────────────────────────────────────

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-2 gap-4 w-full">
            {PLATFORM_OPTIONS.map((opt) => {
              const selected = data.primary_platform === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect("primary_platform", opt.value)}
                  className={[
                    "relative p-8 rounded-2xl border cursor-pointer flex flex-col items-center text-center transition-all",
                    selected
                      ? "border-[#6366F1] bg-[#6366F1]/5"
                      : "border-[#27272A] bg-[#13131A] hover:border-[#3F3F46] hover:bg-[#1C1C24]",
                  ].join(" ")}
                  style={selected ? { boxShadow: "0 0 0 1px #6366F1" } : undefined}
                >
                  {selected && (
                    <span className="absolute top-4 right-4 w-6 h-6 bg-[#6366F1] rounded-full flex items-center justify-center text-white">
                      {CHECK_ICON}
                    </span>
                  )}
                  <div className={`w-14 h-14 ${opt.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                    {opt.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{opt.label}</h3>
                  <p className="text-sm text-[#94A3B8]">{opt.sublabel}</p>
                </button>
              );
            })}
          </div>
        );

      case 2:
        return (
          <TextOptionGrid
            options={NICHE_OPTIONS}
            value={data.niche}
            onSelect={(v) => handleSelect("niche", v)}
          />
        );

      case 3:
        return (
          <TextOptionGrid
            options={AUDIENCE_OPTIONS}
            value={data.audience_band}
            onSelect={(v) => handleSelect("audience_band", v)}
          />
        );

      case 4:
        return (
          <TextOptionGrid
            options={AVG_VIEWS_OPTIONS}
            value={data.avg_views_band}
            onSelect={(v) => handleSelect("avg_views_band", v)}
          />
        );

      case 5:
        return (
          <TextOptionGrid
            options={GEO_OPTIONS}
            value={data.geo_region}
            onSelect={(v) => handleSelect("geo_region", v)}
          />
        );

      case 6:
        return (
          <div className="w-full max-w-sm mx-auto space-y-3">
            <label
              htmlFor="floor_rate"
              className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider ml-1"
            >
              최소 단가 (KRW)
            </label>
            <input
              id="floor_rate"
              type="number"
              min={1}
              step={1}
              value={data.floor_rate}
              onChange={(e) => {
                setFloorRateError("");
                handleSelect("floor_rate", e.target.value);
              }}
              placeholder="예: 500000"
              className="w-full bg-[#13131A] border border-[#27272A] rounded-2xl px-5 py-4 text-lg text-[#F8FAFC] placeholder:text-[#94A3B8]/40 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-[#6366F1] transition-all"
            />
            {floorRateError && (
              <p className="text-sm text-red-400 ml-1">{floorRateError}</p>
            )}
          </div>
        );
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F8FAFC] flex flex-col">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-2.5">
          <Image src="/fox-icon.svg" width={30} height={30} alt="DELO 로고" />
          <span className="text-2xl font-black tracking-tighter text-[#6366F1]">DELO</span>
        </div>
        <button
          type="button"
          onClick={() => {
            document.cookie = "onboarding_skipped=1; path=/; max-age=31536000";
            router.push("/dashboard");
          }}
          className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          나중에 하기
        </button>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center pt-28 pb-36 px-4">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center">

          {/* Step indicator */}
          <section className="w-full max-w-md flex flex-col items-center mb-16">
            <div className="flex items-center w-full justify-between mb-4">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s, i) => (
                <Fragment key={s}>
                  {/* Circle */}
                  {s < step ? (
                    /* Completed */
                    <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : s === step ? (
                    /* Active */
                    <div className="w-8 h-8 rounded-full bg-[#6366F1] border-4 border-[#6366F1]/20 flex items-center justify-center text-white font-bold shrink-0">
                      {s}
                    </div>
                  ) : (
                    /* Upcoming */
                    <div className="w-8 h-8 rounded-full border-2 border-[#27272A] flex items-center justify-center text-[#94A3B8] shrink-0" />
                  )}
                  {/* Connector line */}
                  {i < TOTAL_STEPS - 1 && (
                    <div
                      className="h-0.5 flex-grow mx-2"
                      style={{ background: s < step ? "rgba(99,102,241,0.3)" : "#27272A" }}
                    />
                  )}
                </Fragment>
              ))}
            </div>
            <p className="text-sm text-[#94A3B8] font-medium">
              {TOTAL_STEPS}단계 중 {step}단계
            </p>
          </section>

          {/* Step heading */}
          <section className="w-full text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {stepHeading(step)}
            </h1>
            <p className="text-[#94A3B8] text-lg">{stepSubheading(step)}</p>
          </section>

          {/* Step content */}
          <div className="w-full">{renderStepContent()}</div>

          <section className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((previewStep) => {
              const value = previewValue(previewStep, data);
              const isCurrent = previewStep === step;
              const isCompleted = previewStep < step && value;

              return (
                <div
                  key={previewStep}
                  className={[
                    "flex items-center justify-between rounded-xl border p-4 transition-colors",
                    isCurrent
                      ? "border-[#6366F1]/20 bg-[#13131A]/70"
                      : "border-[#27272A]/60 bg-[#13131A]/30",
                  ].join(" ")}
                >
                  <div>
                    <span className="block text-xs text-[#94A3B8]">Step {previewStep}</span>
                    <span className="text-sm font-semibold">{stepHeading(previewStep)}</span>
                  </div>
                  {isCompleted && (
                    <span className="rounded bg-[#6366F1]/20 px-2 py-1 text-xs font-bold text-[#6366F1]">
                      {value}
                    </span>
                  )}
                </div>
              );
            })}
          </section>

          {/* Submit error */}
          {submitError && (
            <p className="mt-6 w-full rounded-2xl border border-red-900/50 bg-red-950/30 px-5 py-4 text-sm text-red-400">
              {submitError}
            </p>
          )}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-[#0A0A0F]/80 backdrop-blur-md border-t border-[#27272A] z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="px-8 py-4 rounded-full text-[#94A3B8] font-semibold hover:bg-white/5 transition-all disabled:opacity-0 disabled:pointer-events-none"
          >
            ← 이전
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-10 py-4 rounded-full bg-[#6366F1] text-white font-bold hover:bg-[#6366F1]/90 transition-all shadow-lg shadow-[#6366F1]/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음 →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || submitting}
              className="px-10 py-4 rounded-full bg-[#6366F1] text-white font-bold hover:bg-[#6366F1]/90 transition-all shadow-lg shadow-[#6366F1]/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "저장 중…" : "설정 완료 →"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
