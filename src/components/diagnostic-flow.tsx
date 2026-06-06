"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
import { buildLaunchPadResult, diagnosticQuestions, saveStoredResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { saveLaunchPadResultToSupabase } from "@/lib/supabase/diagnostics";

export function DiagnosticFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(() => getSavedStepIndex());
  const [answers, setAnswers] = useState<Record<string, string>>(() => getSavedAnswers());
  const [isWorking, setIsWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const question = diagnosticQuestions[stepIndex];
  const currentValue = answers[question.id] ?? "";
  const progress = ((stepIndex + 1) / diagnosticQuestions.length) * 100;
  const canContinue = currentValue.trim().length > 0;

  useEffect(() => {
    window.localStorage.setItem("simple-marketing-hq:diagnostic-progress", JSON.stringify({ stepIndex, answers }));
  }, [stepIndex, answers]);

  function setAnswer(value: string) {
    setErrorMessage("");
    setSaveStatus("");
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  async function goNext() {
    if (!canContinue) return;
    setErrorMessage("");
    setSaveStatus("");

    if (question.type === "url") {
      const normalizedUrl = normalizeWebsiteUrl(currentValue);
      const urlError = validateWebsiteUrl(normalizedUrl);
      if (urlError) {
        setErrorMessage(urlError);
        return;
      }
      setAnswers((current) => ({ ...current, [question.id]: normalizedUrl }));

      setIsWorking(true);
      try {
        const response = await fetch("/api/website/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ websiteUrl: normalizedUrl }),
        });
        const analysis = (await response.json()) as { summary?: string; businessName?: string; error?: string };
        if (!response.ok) {
          setErrorMessage(analysis.error ?? "We could not review that website URL. You can fix the URL or continue manually.");
          setIsWorking(false);
          return;
        }
        setAnswers((current) => ({
          ...current,
          websiteAnalysisSummary: analysis.summary ?? "",
          detectedBusinessName: analysis.businessName ?? "",
        }));
      } finally {
        setIsWorking(false);
      }
    }

    if (stepIndex === diagnosticQuestions.length - 1) {
      const result = buildLaunchPadResult(answers);
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
      router.push("/diagnostic/result");
      return;
    }
    setStepIndex((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-cyan-900">{brand.diagnosticName}</p>
            <p className="text-slate-500">
              {stepIndex + 1} of {diagnosticQuestions.length}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-cyan-800 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-1 items-center">
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
                      onClick={() => setAnswer(option.value)}
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
                onChange={(event) => setAnswer(event.target.value)}
                type={question.type === "url" ? "url" : "text"}
                placeholder={question.inputHint}
                className="mt-6 w-full rounded-md border border-slate-300 px-4 py-4 text-lg outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              />
            )}

            {stepIndex === 0 && currentValue ? (
              <div className="mt-5 rounded-md bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                We will review public website basics and use anything we can read to shape your diagnostic.
              </div>
            ) : null}
            {errorMessage ? <p className="mt-5 rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">{errorMessage}</p> : null}
            {saveStatus ? <p className="mt-5 rounded-md bg-amber-50 p-4 text-sm font-medium text-amber-800">{saveStatus}</p> : null}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue || isWorking}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isWorking ? "Reviewing..." : stepIndex === diagnosticQuestions.length - 1 ? "View Growth Plan" : "Continue"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function getSavedAnswers() {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem("simple-marketing-hq:diagnostic-progress");
  if (!raw) return {};
  return (JSON.parse(raw) as { answers?: Record<string, string> }).answers ?? {};
}

function getSavedStepIndex() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem("simple-marketing-hq:diagnostic-progress");
  if (!raw) return 0;
  return (JSON.parse(raw) as { stepIndex?: number }).stepIndex ?? 0;
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
