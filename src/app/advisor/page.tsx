"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { buildAdvisorNextAction } from "@/lib/command-center";
import { brand } from "@/lib/brand";
import { getStoredResult } from "@/lib/launchpad";

export default function AdvisorPage() {
  const [result] = useState(() => getStoredResult());
  const advice = buildAdvisorNextAction(result);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-4xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.advisorName}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Know what to build next.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          The advisor translates your diagnostic into one useful action, the reason it matters, the steps to execute, and the asset to create.
        </p>

        <article className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Diagnosis</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{advice.diagnosis}</h2>
          <div className="mt-5 rounded-md bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-950">Recommended action</p>
            <p className="mt-2 text-sm leading-6 text-cyan-900">{advice.action}</p>
            <p className="mt-3 text-sm leading-6 text-cyan-900">{advice.why}</p>
          </div>
          <div className="mt-5 grid gap-3">
            {advice.steps.map((step, index) => (
              <div key={step} className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-cyan-800">Step {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-950">Asset to create: {advice.asset}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Next: {advice.next}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/offer-builder" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Build offer asset
            </Link>
            <Link href="/content-engine" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
              Build content asset
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
