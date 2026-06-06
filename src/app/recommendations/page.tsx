"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { buildToolRecommendations } from "@/lib/command-center";
import { brand } from "@/lib/brand";
import { getStoredResult } from "@/lib/launchpad";

export default function RecommendationsPage() {
  const [result] = useState(() => getStoredResult());
  const recommendations = buildToolRecommendations(result);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.recommendationsName}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Choose channels after the foundation is ready.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Simple Marketing HQ prepares the offer, message, assets, and strategy. External tools handle deployment when your foundation is clear enough to launch.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {recommendations.map((item) => (
            <article key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use this only when the related offer, message, follow-up, and campaign assets are ready.
              </p>
            </article>
          ))}
        </div>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Recommended order</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Diagnose the foundation, build the offer, create the content or campaign asset, map the strategy, then choose the deployment tool.
          </p>
          <Link href="/strategy-map" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
            Review Strategy Map
          </Link>
        </article>
      </section>
    </main>
  );
}
