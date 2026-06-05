"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { getStopStackIdeas, getStoredResult, type LaunchPadResult } from "@/lib/launchpad";

export default function ContentEnginePage() {
  const [result] = useState<LaunchPadResult | null>(() => getStoredResult());
  const ideas = useMemo(() => getStopStackIdeas(result), [result]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Stop Stack Content Engine</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Generate attention-first campaign ideas.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          The first 1.5 seconds matter most. Stop attention first, then stack meaning, tension, and customer pain toward leads or booked calls.
        </p>
        <div className="mt-6 grid gap-4">
          {ideas.map((idea) => (
            <article key={idea.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{idea.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{idea.idea}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-950">Paid-ready placeholder</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Future paid plans can unlock more campaigns, landing page openers, ads, YouTube hooks, email subject lines, and saved generated assets.
          </p>
        </div>
      </section>
    </main>
  );
}
