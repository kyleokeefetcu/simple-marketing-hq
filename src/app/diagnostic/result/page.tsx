"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, ShieldAlert, Target } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { brand } from "@/lib/brand";
import type { LaunchPadResult } from "@/lib/launchpad";
import { getStoredResult } from "@/lib/launchpad";

export default function DiagnosticResultPage() {
  const [result] = useState<LaunchPadResult | null>(() => getStoredResult());

  if (!result) {
    return (
      <main className="min-h-screen bg-slate-50">
        <AppHeader />
        <section className="mx-auto w-full max-w-3xl px-5 py-12">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-950">No diagnostic found yet.</h1>
            <p className="mt-2 text-slate-600">Start the LaunchPad Diagnostic to generate your Growth Plan.</p>
            <Link href="/diagnostic" className="mt-5 inline-flex rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Start Diagnostic
            </Link>
          </div>
        </section>
      </main>
    );
  }

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

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard icon={<BarChart3 size={21} />} label="Offer Strength" value={`${result.offerStrength}`} body="How easy it is for a buyer to understand what they should say yes to." />
          <StatCard icon={<Target size={21} />} label="Messaging Clarity" value={result.messagingClarity} body="How clearly your website and offer connect to what customers want." />
          <StatCard icon={<CheckCircle2 size={21} />} label="Speed-to-Lead" value={result.speedToLeadGrade} body="How quickly your business can turn interest into a real conversation." />
        </div>

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
