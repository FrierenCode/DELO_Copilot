"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mapToApiProfile, type PrdOnboardingData } from "@/lib/creator-profile-mapper";

// ─── Step options ────────────────────────────────────────────────────────────

const PLATFORM_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
];

const NICHE_OPTIONS = [
  { value: "beauty", label: "Beauty" },
  { value: "gaming", label: "Gaming" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "tech", label: "Tech" },
  { value: "food", label: "Food" },
];

const AUDIENCE_OPTIONS = [
  { value: "under_10k", label: "Under 10k" },
  { value: "10k_50k", label: "10k – 50k" },
  { value: "50k_150k", label: "50k – 150k" },
  { value: "150k_300k", label: "150k – 300k" },
  { value: "300k_plus", label: "300k+" },
];

const AVG_VIEWS_OPTIONS = [
  { value: "under_10k", label: "Under 10k" },
  { value: "10k_50k", label: "10k – 50k" },
  { value: "50k_150k", label: "50k – 150k" },
  { value: "150k_plus", label: "150k+" },
];

const GEO_OPTIONS = [
  { value: "korea", label: "Korea" },
  { value: "english", label: "English-speaking" },
  { value: "other", label: "Other" },
];

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "Platform",
  "Niche",
  "Audience",
  "Avg Views",
  "Region",
  "Floor Rate",
];

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helper components ───────────────────────────────────────────────────────

type Option = { value: string; label: string };

function OptionGrid({
  options,
  value,
  onSelect,
}: {
  options: Option[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={[
            "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
            value === opt.value
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Step headings ───────────────────────────────────────────────────────────

function stepHeading(step: number): string {
  switch (step) {
    case 1: return "What's your primary platform?";
    case 2: return "What's your content niche?";
    case 3: return "How large is your audience?";
    case 4: return "What are your average views?";
    case 5: return "Where is your audience based?";
    case 6: return "Set your floor rate";
    default: return "";
  }
}

function stepSubheading(step: number): string {
  switch (step) {
    case 1: return "Choose the platform where most of your audience lives.";
    case 2: return "Select the category that best describes your content.";
    case 3: return "Pick the band closest to your total follower count.";
    case 4: return "Pick the band closest to your typical view count per post.";
    case 5: return "Select the region that describes most of your audience.";
    case 6: return "The minimum deal value you will accept, in KRW. Must be a positive whole number.";
    default: return "";
  }
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

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
    if (!val.trim()) return "Floor rate is required.";
    const n = Number(val);
    if (!Number.isInteger(n) || n < 1) return "Must be a positive whole number.";
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
          "Save failed. Please try again.";
        setSubmitError(msg);
        setSubmitting(false);
        return;
      }

      router.push("/dashboard/intake");
    } catch {
      setSubmitError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // ── Step content ──────────────────────────────────────────────────────────

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <OptionGrid
            options={PLATFORM_OPTIONS}
            value={data.primary_platform}
            onSelect={(v) => handleSelect("primary_platform", v)}
          />
        );
      case 2:
        return (
          <OptionGrid
            options={NICHE_OPTIONS}
            value={data.niche}
            onSelect={(v) => handleSelect("niche", v)}
          />
        );
      case 3:
        return (
          <OptionGrid
            options={AUDIENCE_OPTIONS}
            value={data.audience_band}
            onSelect={(v) => handleSelect("audience_band", v)}
          />
        );
      case 4:
        return (
          <OptionGrid
            options={AVG_VIEWS_OPTIONS}
            value={data.avg_views_band}
            onSelect={(v) => handleSelect("avg_views_band", v)}
          />
        );
      case 5:
        return (
          <OptionGrid
            options={GEO_OPTIONS}
            value={data.geo_region}
            onSelect={(v) => handleSelect("geo_region", v)}
          />
        );
      case 6:
        return (
          <div className="space-y-2">
            <label
              htmlFor="floor_rate"
              className="text-sm font-medium text-neutral-700"
            >
              Minimum rate per deal (KRW)
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
              placeholder="e.g. 500000"
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
            />
            {floorRateError && (
              <p className="text-sm text-red-600">{floorRateError}</p>
            )}
          </div>
        );
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const progressPct = (step / TOTAL_STEPS) * 100;

  return (
    <div className="mx-auto max-w-lg space-y-8 py-8">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{STEP_LABELS[step - 1]}</span>
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Step heading */}
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">
          {stepHeading(step)}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{stepSubheading(step)}</p>
      </div>

      {/* Step content */}
      {renderStepContent()}

      {/* Submit error */}
      {submitError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={submitting}
          >
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step < TOTAL_STEPS ? (
          <Button onClick={handleNext} disabled={!isStepValid()}>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid() || submitting}
          >
            {submitting ? "Saving…" : "Finish setup"}
          </Button>
        )}
      </div>
    </div>
  );
}
