"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, ShieldAlert, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { brand } from "@/lib/brand";
import type { LaunchPadResult } from "@/lib/launchpad";
import { getStoredResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getSavedDiagnosticById, type SavedDiagnosticSummary } from "@/lib/supabase/diagnostics";

export default function DiagnosticResultPage() {
  const [result, setResult] = useState<LaunchPadResult | null>(null);
  const [savedDiagnostic, setSavedDiagnostic] = useState<SavedDiagnosticSummary | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(async () => {
      const params = new URLSearchParams(window.location.search);
      const diagnosticId = params.get("diagnosticId");
      const supabase = createBrowserSupabaseClient();
      if (diagnosticId && supabase) {
        try {
          const saved = await getSavedDiagnosticById(supabase, diagnosticId);
          setSavedDiagnostic(saved);
        } catch {
          setSavedDiagnostic(null);
        }
      }
      if (!diagnosticId) setResult(getStoredResult());
      setHasLoaded(true);
    });
  }, []);

  if (!hasLoaded) {
    return (
      <main className="min-h-screen bg-slate-50">
        <AppHeader />
        <section className="mx-auto w-full max-w-3xl px-5 py-12">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-950">Loading your LaunchPad Growth Plan...</h1>
            <p className="mt-2 text-slate-600">Simple Marketing HQ is checking the diagnostic saved in this browser.</p>
          </div>
        </section>
      </main>
    );
  }

  if (savedDiagnostic) {
    return (
      <main className="min-h-screen bg-slate-50">
        <AppHeader />
        <section className="mx-auto w-full max-w-6xl px-5 py-8">
          <Link href="/diagnostic" className="text-sm font-semibold text-cyan-800">
            Back to Diagnostic HQ
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.growthScoreName}</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">{savedDiagnostic.businessName}</h1>
              <p className="mt-3 text-slate-600">Diagnostic snapshot from {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(savedDiagnostic.completedAt))}.</p>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-7xl font-semibold text-cyan-900">{savedDiagnostic.growthScore ?? "--"}</span>
                <span className="pb-3 text-slate-500">/ 100</span>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-md bg-amber-100 text-amber-700">
                  <ShieldAlert size={23} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Current bottleneck at this snapshot</p>
                  <h2 className="text-2xl font-semibold text-slate-950">{savedDiagnostic.biggestBottleneck}</h2>
                </div>
              </div>
              <div className="mt-6 rounded-md bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-cyan-950">Highest-leverage next move</p>
                <p className="mt-2 text-sm leading-6 text-cyan-900">{savedDiagnostic.nextMove}</p>
              </div>
            </article>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <StatCard icon={<BarChart3 size={21} />} label="Offer Strength" value={savedDiagnostic.offerStrength === null ? "--" : `${savedDiagnostic.offerStrength}`} body="How easy it was for a buyer to understand what they should say yes to." />
            <StatCard icon={<Target size={21} />} label="ICP Clarity" value={savedDiagnostic.icpClarity === null ? "--" : `${savedDiagnostic.icpClarity}`} body="How clearly the best-fit customer and buying situation were defined." />
            <StatCard icon={<CheckCircle2 size={21} />} label="Channel Fit" value={savedDiagnostic.channelToIcpFit || "--"} body="Whether the first channel matched the business foundation." />
            <StatCard icon={<BarChart3 size={21} />} label="Snapshot" value="Saved" body="This diagnostic remains available as an archived point-in-time read." />
          </div>

          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Action Plan From This Snapshot</h2>
            <div className="mt-4 grid gap-3">
              {(savedDiagnostic.actionItems.length ? savedDiagnostic.actionItems : [savedDiagnostic.nextMove]).map((item) => (
                <p key={item} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {item}
                </p>
              ))}
            </div>
            <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Open Command Center
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </section>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-50">
        <AppHeader />
        <section className="mx-auto w-full max-w-3xl px-5 py-12">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-950">No diagnostic found yet.</h1>
            <p className="mt-2 text-slate-600">Start the LaunchPad Diagnostic to generate your Growth Plan.</p>
            <Link href="/diagnostic/run?fresh=1" className="mt-5 inline-flex rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Start Diagnostic
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const customerDesiredOutcome = result.customerDesiredOutcome ?? "a clear answer, less risk, and a next step they can trust";
  const recommendedFirstChannel = result.recommendedFirstChannel ?? "Run the updated diagnostic to get a channel recommendation";
  const channelRecommendationWhy = result.channelRecommendationWhy ?? "Simple Marketing HQ recommends the first channel after reviewing your industry, current lead sources, website readiness, follow-up speed, and available time.";
  const channelPreparationSteps = result.channelPreparationSteps?.length
    ? result.channelPreparationSteps
    : ["Sharpen offer language", "Define best-fit customer", "Create a clear CTA", "Build a simple follow-up script"];
  const channelToIgnoreForNow = result.channelToIgnoreForNow ?? "Any channel that requires more time or budget than the foundation can support right now.";

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.growthScoreName}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">{result.businessName}</h1>
            <p className="mt-3 text-slate-600">Your LaunchPad Growth Plan is ready.</p>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-7xl font-semibold text-cyan-900">{result.growthScore}</span>
              <span className="pb-3 text-slate-500">/ 100</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-cyan-800" style={{ width: `${result.growthScore}%` }} />
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-md bg-amber-100 text-amber-700">
                <ShieldAlert size={23} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Biggest bottleneck</p>
                <h2 className="text-2xl font-semibold text-slate-950">{result.biggestBottleneck}</h2>
              </div>
            </div>
            <div className="mt-6 rounded-md bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-950">Highest-leverage next move</p>
              <p className="mt-2 text-sm leading-6 text-cyan-900">{result.nextMove}</p>
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatCard icon={<BarChart3 size={21} />} label="Offer Strength" value={`${result.offerStrength}`} body="How easy it is for a buyer to understand what they should say yes to." />
          <StatCard icon={<Target size={21} />} label="ICP Clarity" value={result.icpClarity ? `${result.icpClarity}` : "--"} body="How clearly the best-fit customer, industry match, buyer pain, trigger, and proof needs are defined." />
          <StatCard icon={<Target size={21} />} label="Messaging Clarity" value={result.messagingClarity} body="How clearly your website and offer connect to what customers want." />
          <StatCard icon={<CheckCircle2 size={21} />} label="Speed-to-Lead" value={result.speedToLeadGrade} body="How quickly your business can turn interest into a real conversation." />
        </div>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">What Simple Marketing HQ inferred</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-md bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-950">What your customers likely want most</p>
              <p className="mt-2 text-sm leading-6 text-cyan-900">{customerDesiredOutcome}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Recommended first channel to prepare for</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">{recommendedFirstChannel}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{channelRecommendationWhy}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {channelPreparationSteps.map((step, index) => (
              <p key={step} className="rounded-md border border-slate-200 p-4 text-sm leading-6 text-slate-700">
                {index + 1}. {step}
              </p>
            ))}
          </div>
          <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Ignore for now: {channelToIgnoreForNow}
          </p>
        </article>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">ICP and Industry Match</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Industry fit</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">{result.industryFit ?? "Run the updated diagnostic to set industry fit."}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Buyer pain clarity</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">{result.buyerPainClarity ?? "Needs updated ICP input."}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Offer-to-ICP fit</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">{result.offerToIcpFit ?? "Needs updated ICP input."}</p>
            </div>
          </div>
          <Link href="/icp-builder" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
            Build ICP starter
          </Link>
        </article>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">{brand.actionPlanName}</h2>
          <div className="mt-5 grid gap-3">
            {result.actionItems.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-md border border-slate-200 p-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-cyan-900 text-sm font-semibold text-white">{index + 1}</span>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Create account and save
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/offer-builder" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
              Build offer starter
            </Link>
          </div>
        </article>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["ICP Builder", "Define best-fit customers, bad-fit traits, buying triggers, objections, channels, and offer fit.", "/icp-builder"],
            ["Offer Builder", "Turn the result into an offer stack, proof layer, risk reducer, and CTA.", "/offer-builder"],
            ["Content Engine", "Create hooks and campaign assets from the offer and bottleneck.", "/content-engine"],
            [brand.advisorName, "Get the next action with steps, asset, and follow-up move.", "/advisor"],
          ].map(([title, body, href]) => (
            <Link key={title} href={href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
