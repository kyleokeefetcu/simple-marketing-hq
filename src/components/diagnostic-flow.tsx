"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { brand } from "@/lib/brand";
import { buildLaunchPadResult, diagnosticQuestions, saveStoredResult } from "@/lib/launchpad";

export function DiagnosticFlow() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const question = diagnosticQuestions[stepIndex];
  const currentValue = answers[question.id] ?? "";
  const progress = ((stepIndex + 1) / diagnosticQuestions.length) * 100;
  const canContinue = currentValue.trim().length > 0;

  function setAnswer(value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  function goNext() {
    if (!canContinue) return;
    if (stepIndex === diagnosticQuestions.length - 1) {
      const result = buildLaunchPadResult(answers);
      saveStoredResult(result);
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
                placeholder={question.placeholder}
                className="mt-6 w-full rounded-md border border-slate-300 px-4 py-4 text-lg outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              />
            )}

            {stepIndex === 0 && currentValue ? (
              <div className="mt-5 rounded-md bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Starter website analysis will confirm the business name, offer, CTA, proof, lead capture, and conversion bottlenecks.
              </div>
            ) : null}

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
                disabled={!canContinue}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {stepIndex === diagnosticQuestions.length - 1 ? "View Growth Plan" : "Continue"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
