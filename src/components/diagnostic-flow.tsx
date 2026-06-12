"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Pencil, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { brand } from "@/lib/brand";
import { buildLaunchPadResult, diagnosticQuestions, getIndustryProfile, saveStoredResult, type WebsiteAnalysisProfile } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { saveLaunchPadResultToSupabase } from "@/lib/supabase/diagnostics";

type IntakePhase = "website" | "confirm" | "questions";

const analysisSteps = [
  "Reading your website...",
  "Looking for your offer...",
  "Checking your calls-to-action...",
  "Finding proof and trust signals...",
  "Building your starting marketing profile...",
];

const confirmationFields = [
  { key: "businessName", analysisKey: "business_name", label: "Business name" },
  { key: "industryLabel", analysisKey: "industry_category", label: "Industry/category" },
  { key: "services", analysisKey: "services_offers", label: "What you sell" },
  { key: "serviceArea", analysisKey: "service_area", label: "Service area/location" },
  { key: "primaryCustomer", analysisKey: "primary_customer", label: "Primary customer" },
  { key: "primaryCta", analysisKey: "main_cta", label: "Main website CTA" },
  { key: "trustSignals", analysisKey: "trust_proof", label: "Trust/proof found" },
  { key: "leadCapture", analysisKey: "lead_capture", label: "Lead capture found" },
  { key: "messagingClarityNotes", analysisKey: "messaging_summary", label: "Messaging summary" },
] as const;

export function DiagnosticFlow() {
  const router = useRouter();
  const fallbackProgress = getEmptyProgress();
  const [phase, setPhase] = useState<IntakePhase>(fallbackProgress.phase);
  const [gapIndex, setGapIndex] = useState(fallbackProgress.gapIndex);
  const [answers, setAnswers] = useState<Record<string, string>>(fallbackProgress.answers);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [profile, setProfile] = useState<WebsiteAnalysisProfile | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const question = diagnosticQuestions[gapIndex];
  const currentValue = question ? answers[question.id] ?? "" : "";
  const totalSteps = 2 + diagnosticQuestions.length;
  const currentStep = phase === "website" ? 1 : phase === "confirm" ? 2 : 3 + gapIndex;
  const progress = (currentStep / totalSteps) * 100;
  const canContinue = phase === "questions" ? currentValue.trim().length > 0 : true;

  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const shouldResume = params.get("resume") === "1";
      const shouldStartFresh = params.get("fresh") === "1" || !shouldResume;
      const businessId = params.get("businessId");

      if (businessId) {
        window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);
      }

      if (shouldStartFresh) {
        clearSavedProgress();
        setPhase("website");
        setGapIndex(0);
        setAnswers({});
        setWebsiteUrl("");
        setProfile(null);
        return;
      }

      const savedProgress = getSavedProgress();
      setPhase(savedProgress.phase);
      setGapIndex(savedProgress.gapIndex);
      setAnswers(savedProgress.answers);
      setWebsiteUrl(savedProgress.answers.websiteUrl ?? "");
      setProfile(savedProgress.profile);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("simple-marketing-hq:diagnostic-progress", JSON.stringify({ phase, gapIndex, answers, profile, startedAt: answers.startedAt ?? new Date().toISOString() }));
  }, [phase, gapIndex, answers, profile]);

  useEffect(() => {
    if (!isWorking) return;
    const interval = window.setInterval(() => {
      setAnalysisStepIndex((current) => (current + 1) % analysisSteps.length);
    }, 900);
    return () => window.clearInterval(interval);
  }, [isWorking]);

  const lowConfidenceCount = useMemo(() => {
    if (!profile?.extractedFields) return 0;
    return confirmationFields.filter((field) => profile.extractedFields?.[field.analysisKey]?.confidence === "low" || !profile.extractedFields?.[field.analysisKey]?.value).length;
  }, [profile]);

  function setQuestionAnswer(value: string) {
    if (!question) return;
    setErrorMessage("");
    setSaveStatus("");
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  function updateProfileField(key: (typeof confirmationFields)[number]["key"], value: string) {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  }

  async function analyzeWebsite() {
    setErrorMessage("");
    setSaveStatus("");
    const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
    const urlError = validateWebsiteUrl(normalizedUrl);
    if (urlError) {
      setErrorMessage(urlError);
      return;
    }

    setIsWorking(true);
    setAnalysisStepIndex(0);
    try {
      const response = await fetch("/api/website/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: normalizedUrl }),
      });
      const analysis = (await response.json()) as WebsiteAnalysisProfile & { error?: string };
      if (!response.ok) {
        setErrorMessage(analysis.error ?? "We could not review that website URL. You can fix the URL or continue manually.");
        return;
      }

      const nextProfile = normalizeProfile(analysis, normalizedUrl);
      setProfile(nextProfile);
      setAnswers((current) => mergeProfileIntoAnswers(current, nextProfile));
      setWebsiteUrl(normalizedUrl);
      setPhase("confirm");
    } finally {
      setIsWorking(false);
    }
  }

  function confirmProfile() {
    if (!profile) return;
    const industryCategory = resolveIndustryCategory(profile);
    const nextProfile = { ...profile, industryCategory, industryLabel: profile.industryLabel || (industryCategory ? getIndustryProfile(industryCategory).label : "") };
    setProfile(nextProfile);
    setAnswers((current) => mergeProfileIntoAnswers(current, nextProfile));
    setPhase("questions");
    setGapIndex(0);
  }

  async function goNextQuestion() {
    if (!question || !canContinue) return;
    setErrorMessage("");
    setSaveStatus("");

    if (gapIndex === diagnosticQuestions.length - 1) {
      const finalAnswers = profile ? mergeProfileIntoAnswers({ ...answers, [question.id]: currentValue }, profile) : { ...answers, [question.id]: currentValue };
      const result = buildLaunchPadResult(finalAnswers);
      saveStoredResult(result);

      const supabase = createBrowserSupabaseClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            const selectedBusinessId = window.localStorage.getItem("simple-marketing-hq:selected-business-id");
            const savedId = await saveLaunchPadResultToSupabase(supabase, data.user, result, selectedBusinessId);
            window.localStorage.setItem("simple-marketing-hq:last-saved-diagnostic-id", savedId);
          } catch (error) {
            setSaveStatus(`Saved locally, but Supabase save failed: ${(error as Error).message}`);
            return;
          }
        }
      }

      clearSavedProgress();
      router.push("/dashboard");
      return;
    }

    setGapIndex((current) => current + 1);
  }

  function goBack() {
    setErrorMessage("");
    if (phase === "website") return;
    if (phase === "confirm") {
      setPhase("website");
      return;
    }
    if (gapIndex === 0) {
      setPhase("confirm");
      return;
    }
    setGapIndex((current) => Math.max(0, current - 1));
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-cyan-900">{brand.diagnosticName}</p>
            <p className="text-slate-500">
              {currentStep} of {totalSteps}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-cyan-800 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-1 items-center">
          {phase === "website" ? (
            <article className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Step 1</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">What is your website?</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                We&apos;ll use this to understand your business so you don&apos;t have to type everything manually.
              </p>
              <input
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                type="url"
                placeholder="https://yourcompany.com"
                className="mt-6 w-full rounded-md border border-slate-300 px-4 py-4 text-lg outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              />
              {isWorking ? (
                <div className="mt-5 rounded-md bg-cyan-50 p-4 text-sm font-semibold text-cyan-950">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles size={17} aria-hidden="true" />
                    {analysisSteps[analysisStepIndex]}
                  </span>
                </div>
              ) : (
                <div className="mt-5 rounded-md bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Simple Marketing HQ will read public website basics, build a starting profile, then ask you to confirm or correct it.
                </div>
              )}
              {errorMessage ? <p className="mt-5 rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">{errorMessage}</p> : null}
              <FooterActions
                backDisabled
                nextDisabled={!websiteUrl.trim() || isWorking}
                nextLabel={isWorking ? "Analyzing..." : "Analyze website"}
                onBack={goBack}
                onNext={analyzeWebsite}
              />
            </article>
          ) : null}

          {phase === "confirm" && profile ? (
            <article className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI review</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Here is what we found from your website.</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {profile.readable ? "Please confirm anything we missed. We will only prefill fields when the website evidence is strong enough." : "We could not read enough from your website. We will ask a few quick questions instead."}
              </p>
              {profile.qualityWarning || lowConfidenceCount >= 4 ? (
                <div className="mt-5 flex gap-3 rounded-md bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                  <p>{profile.qualityWarning || "We could not confidently read everything from your website. We will ask a few quick questions to fill the gaps."}</p>
                </div>
              ) : null}
              {profile.pagesAnalyzed?.length ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pages analyzed: {profile.pagesAnalyzed.length}
                </p>
              ) : null}

              <div className="mt-6 grid gap-3">
                {confirmationFields.map((field) => {
                  const extraction = profile.extractedFields?.[field.analysisKey];
                  const confidence = extraction?.confidence ?? "low";
                  const isLowConfidence = confidence === "low" || !extraction?.value;
                  return (
                    <label key={field.key} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
                        <Pencil size={15} aria-hidden="true" />
                        {field.label}
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${confidence === "high" ? "bg-emerald-100 text-emerald-800" : confidence === "medium" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}`}>
                          {confidence === "high" ? "High confidence" : confidence === "medium" ? "Please confirm" : "Could not confirm"}
                        </span>
                      </span>
                      <input
                        value={profile[field.key]}
                        onChange={(event) => updateProfileField(field.key, event.target.value)}
                        placeholder={isLowConfidence ? "We could not confirm this yet." : undefined}
                        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                      />
                      {extraction?.source_evidence ? (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Evidence: {extraction.source_evidence}
                        </p>
                      ) : null}
                    </label>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={confirmProfile} className="min-h-12 rounded-md bg-cyan-900 px-4 py-3 font-semibold text-white">
                  Yes, continue
                </button>
                <button type="button" onClick={confirmProfile} className="min-h-12 rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-800">
                  Mostly right, continue
                </button>
                <button type="button" onClick={confirmProfile} className="min-h-12 rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-800">
                  I corrected it
                </button>
              </div>

              <FooterActions backDisabled={false} nextDisabled={false} nextLabel="Continue" onBack={goBack} onNext={confirmProfile} />
            </article>
          ) : null}

          {phase === "questions" && question ? (
            <article className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{question.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">{question.question}</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">{question.helper}</p>

              {question.type === "choice" ? (
                <div className="mt-6 grid gap-3">
                  {question.options?.map((option) => {
                    const selected = currentValue === option.value;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setQuestionAnswer(option.value)}
                        className={`flex min-h-14 items-center justify-between rounded-md border px-4 py-3 text-left font-medium transition ${
                          selected
                            ? "border-cyan-800 bg-cyan-50 text-cyan-950"
                            : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                        }`}
                      >
                        {option.label}
                        {selected ? <CheckCircle2 size={18} className="text-emerald-600" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={currentValue}
                  onChange={(event) => setQuestionAnswer(event.target.value)}
                  type="text"
                  placeholder={question.inputHint}
                  className="mt-6 w-full rounded-md border border-slate-300 px-4 py-4 text-lg outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                />
              )}

              {saveStatus ? <p className="mt-5 rounded-md bg-amber-50 p-4 text-sm font-medium text-amber-800">{saveStatus}</p> : null}
              <FooterActions
                backDisabled={false}
                nextDisabled={!canContinue}
                nextLabel={gapIndex === diagnosticQuestions.length - 1 ? "Build my command center" : "Continue"}
                onBack={goBack}
                onNext={goNextQuestion}
              />
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function FooterActions({
  backDisabled,
  nextDisabled,
  nextLabel,
  onBack,
  onNext,
}: {
  backDisabled: boolean;
  nextDisabled: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        className="inline-flex min-h-12 items-center gap-2 rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex min-h-12 items-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

function getEmptyProgress() {
  const fallback = { phase: "website" as IntakePhase, gapIndex: 0, answers: {} as Record<string, string>, profile: null as WebsiteAnalysisProfile | null };
  return fallback;
}

function getSavedProgress() {
  const fallback = getEmptyProgress();
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem("simple-marketing-hq:diagnostic-progress");
  if (!raw) return fallback;
  const parsed = JSON.parse(raw) as Partial<typeof fallback>;
  return {
    phase: parsed.phase ?? fallback.phase,
    gapIndex: parsed.gapIndex ?? fallback.gapIndex,
    answers: parsed.answers ?? fallback.answers,
    profile: parsed.profile ?? fallback.profile,
  };
}

function clearSavedProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("simple-marketing-hq:diagnostic-progress");
}

function mergeProfileIntoAnswers(current: Record<string, string>, profile: WebsiteAnalysisProfile) {
  const industryCategory = resolveIndustryCategory(profile);
  return {
    ...current,
    websiteUrl: profile.websiteUrl,
    businessName: profile.businessName,
    detectedBusinessName: profile.businessName,
    industryCategory,
    industryLabel: profile.industryLabel || (industryCategory ? getIndustryProfile(industryCategory).label : ""),
    whatSelling: current.whatSelling || profile.services,
    services: profile.services,
    serviceArea: profile.serviceArea,
    targetCustomer: current.targetCustomer || profile.primaryCustomer,
    primaryCustomer: profile.primaryCustomer,
    primaryCta: profile.primaryCta,
    trustFactor: current.trustFactor || profile.trustSignals,
    leadCaptureFound: profile.leadCapture,
    messagingClarityNotes: profile.messagingClarityNotes,
    websiteAnalysisSummary: profile.summary,
    websiteAnalysisEvidence: JSON.stringify(profile.extractedFields ?? {}),
    pagesAnalyzed: JSON.stringify(profile.pagesAnalyzed ?? []),
    extractionQuality: profile.extractionQuality ?? "",
    homepageHeadline: profile.homepageHeadline,
    currentOffer: current.currentOffer || (profile.primaryCta ? "The offer is understandable but could be sharper." : "The offer needs work."),
  };
}

function normalizeProfile(profile: WebsiteAnalysisProfile, websiteUrl: string): WebsiteAnalysisProfile {
  const industryCategory = resolveIndustryCategory(profile);
  return {
    ...profile,
    websiteUrl,
    businessName: profile.businessName || "",
    industryCategory,
    industryLabel: profile.industryLabel || (industryCategory ? getIndustryProfile(industryCategory).label : ""),
  };
}

function resolveIndustryCategory(profile: WebsiteAnalysisProfile) {
  if (profile.industryCategory) return profile.industryCategory;
  const normalizedLabel = profile.industryLabel.toLowerCase();
  const candidates = [
    "local_service",
    "home_services",
    "medical_wellness",
    "real_estate",
    "professional_services",
    "restaurant_retail",
    "b2b_services",
    "saas_software",
    "coaching_consulting",
    "creator_course",
    "agency",
    "ecommerce",
  ];
  return candidates.find((candidate) => getIndustryProfile(candidate).label.toLowerCase() === normalizedLabel) ?? "";
}

function validateWebsiteUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "Use a website URL that starts with http:// or https://.";
    }
    return "";
  } catch {
    return "Enter a valid website URL, including https://.";
  }
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
