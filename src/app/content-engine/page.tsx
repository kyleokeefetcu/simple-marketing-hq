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
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Content Engine</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Turn the offer into content assets.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Build attention-first hooks, authority content, campaign ideas, and follow-up assets that support the foundation instead of posting randomly.
        </p>
        <div className="mt-6 grid gap-4">
          {ideas.map((idea) => (
            <article key={idea.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{idea.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{idea.idea}</p>
              <div className="mt-4 rounded-md bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-cyan-950">Execution steps</p>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-cyan-900">
                  <li>Open with the hook before explaining the business.</li>
                  <li>Connect the tension to a customer pain or missed result.</li>
                  <li>End with one simple action: book, ask, reply, download, or start the diagnostic.</li>
                </ol>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
