"use client";

import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Globe, LineChart, LockKeyhole, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { clsx } from "clsx";

const quizSteps = [
  {
    label: "Traffic",
    question: "How are people finding you today?",
    options: ["Mostly referrals", "Organic search", "Paid ads", "Not sure yet"],
  },
  {
    label: "Conversion",
    question: "What happens after someone lands on your site?",
    options: ["They book or buy", "They browse quietly", "They bounce fast", "We do not track it"],
  },
  {
    label: "Priority",
    question: "What would help most this month?",
    options: ["More qualified leads", "Clearer offer", "Better follow-up", "A full diagnosis"],
  },
];

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const diagnosisReady = websiteUrl.trim().length > 6 && answers.length === quizSteps.length;

  const recommendedAction = useMemo(() => {
    const priority = answers[2];

    if (priority === "Clearer offer") {
      return "Clarify the offer and homepage call-to-action before scaling traffic.";
    }

    if (priority === "Better follow-up") {
      return "Map the lead handoff and follow-up sequence before adding new campaigns.";
    }

    if (priority === "More qualified leads") {
      return "Audit traffic sources and build a focused lead capture path.";
    }

    return "Run the full LaunchPad Diagnostic once the master prompt is loaded.";
  }, [answers]);

  function chooseAnswer(answer: string) {
    const nextAnswers = [...answers];
    nextAnswers[currentStep] = answer;
    setAnswers(nextAnswers);
    setCurrentStep((step) => Math.min(step + 1, quizSteps.length - 1));
  }

  const step = quizSteps[currentStep];

  return (
    <main className="min-h-screen">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-cyan-900 text-amber-300">
              <Sparkles size={21} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Simple Marketing HQ</p>
              <p className="text-xs text-slate-500">AI marketing advisor for small businesses</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
            <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
            Vercel-ready
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
        <div className="flex flex-col justify-between gap-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-900">
              <Globe size={16} aria-hidden="true" />
              LaunchPad Diagnostic
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                Welcome to Simple Marketing HQ.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Let&apos;s build your LaunchPad Growth Plan. This starter experience captures a website URL, guides a short onboarding quiz, and prepares the app for AI diagnosis, account creation, Supabase persistence, RB2B tracking, and advisor workflows.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["LaunchPad Diagnostic", "Quiz funnel shell"],
              ["LaunchPad Growth Score", "AI-ready flow"],
              ["LaunchPad Advisor", "Dashboard placeholder"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">LaunchPad Diagnostic</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Build your Growth Plan</h2>
            </div>
            <div className="grid size-11 place-items-center rounded-md bg-amber-100 text-amber-700">
              <ClipboardList size={22} aria-hidden="true" />
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700" htmlFor="website-url">
            Website URL
          </label>
          <input
            id="website-url"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://yourcompany.com"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
          />

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{step.label}</span>
              <span className="text-slate-500">
                {currentStep + 1} of {quizSteps.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-cyan-800 transition-all"
                style={{ width: `${((answers.length || 1) / quizSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-lg font-semibold text-slate-950">{step.question}</h3>
            <div className="mt-4 grid gap-3">
              {step.options.map((option) => {
                const selected = answers[currentStep] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => chooseAnswer(option)}
                    className={clsx(
                      "flex min-h-12 items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-medium transition",
                      selected
                        ? "border-cyan-800 bg-cyan-50 text-cyan-950"
                        : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50",
                    )}
                  >
                    {option}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-10 lg:grid-cols-3">
        <StatusPanel
          icon={<BarChart3 size={22} aria-hidden="true" />}
          title="LaunchPad Diagnostic flow"
          status={diagnosisReady ? "Ready for prompt wiring" : "Waiting for intake"}
          body={diagnosisReady ? "The intake has enough signal for the future AI diagnosis endpoint." : "Add a website URL and complete the quiz to unlock the LaunchPad Recommendations placeholder."}
        />
        <StatusPanel
          icon={<LineChart size={22} aria-hidden="true" />}
          title="LaunchPad Recommendations"
          status={diagnosisReady ? "Generated locally" : "Pending"}
          body={diagnosisReady ? recommendedAction : "The production version will use the master prompt and OpenAI API to shape the LaunchPad Action Plan."}
        />
        <StatusPanel
          icon={<LockKeyhole size={22} aria-hidden="true" />}
          title="Lead capture and auth"
          status="Supabase-ready"
          body="Client and server helper files are in place. Database SQL will be added after the data model is defined."
        />
      </section>
    </main>
  );
}

function StatusPanel({
  icon,
  title,
  status,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-slate-100 text-cyan-900">{icon}</div>
        <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{status}</span>
      </div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
