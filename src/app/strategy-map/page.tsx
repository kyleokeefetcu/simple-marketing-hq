"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AssetSavePanel } from "@/components/asset-save-panel";
import { buildStrategyMap } from "@/lib/command-center";
import { getStoredResult } from "@/lib/launchpad";
import { useState } from "react";

export default function StrategyMapPage() {
  const [result] = useState(() => getStoredResult());
  const strategy = buildStrategyMap(result);
  const assetTitle = `${result?.businessName ?? "Business"} strategy map`;
  const assetSummary = strategy.objective;

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Strategy Map</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Prepare the foundation before takeoff.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          This map turns the LaunchPad result into a practical order of operations: what to fix first, what to build next, and when to choose a channel.
        </p>

        <article className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Highest-leverage objective</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{strategy.objective}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{strategy.channelReadiness}</p>
        </article>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <PlanCard title="Next 7 days" items={strategy.nextSevenDays} />
          <PlanCard title="Next 30 days" items={strategy.nextThirtyDays} />
          <PlanCard title="Missing assets" items={strategy.missingAssets} />
        </div>

        <Link href="/advisor" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
          Ask the Advisor what to build next
        </Link>

        <AssetSavePanel
          assetType="strategy_map"
          title={assetTitle}
          summary={assetSummary}
          input={{
            businessName: result?.businessName,
            websiteUrl: result?.websiteUrl,
            growthScore: result?.growthScore,
            bottleneck: result?.biggestBottleneck,
            answers: result?.answers,
          }}
          output={strategy}
          prompt={{
            purpose: "Create a practical strategy map with next 7 days, next 30 days, missing assets, channel readiness, and order of operations.",
          }}
        />
      </section>
    </main>
  );
}

function PlanCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-md border border-slate-200 p-3 text-sm leading-6 text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}
