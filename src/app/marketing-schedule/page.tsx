"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AssetSavePanel } from "@/components/asset-save-panel";
import { buildMarketingSchedule } from "@/lib/command-center";
import { getStoredResult } from "@/lib/launchpad";

export default function MarketingSchedulePage() {
  const result = getStoredResult();
  const schedule = buildMarketingSchedule(result);
  const assetTitle = `${result?.businessName ?? "Business"} weekly marketing schedule`;
  const assetSummary = schedule.weeklyFocus;

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/dashboard" className="text-sm font-semibold text-cyan-800">
          Back to Command Center
        </Link>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Marketing Schedule</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Turn strategy into a weekly rhythm.</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            This is not a generic checklist. It is a simple operating rhythm for offer refinement, content creation, campaign prep, follow-up, and review.
          </p>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border border-cyan-200 bg-cyan-950 p-5 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">This week&apos;s focus</p>
            <h2 className="mt-3 text-2xl font-semibold">{schedule.weeklyFocus}</h2>
            <Link href="/strategy-map" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 font-semibold text-cyan-950">
              Review Strategy Map
            </Link>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Weekly rhythm</h2>
            <div className="mt-4 grid gap-3">
              {schedule.rhythm.map((item) => (
                <p key={item} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {item}
                </p>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <ListCard title="Campaign prep assets" items={schedule.campaignPrep} />
          <ListCard title="Review questions" items={schedule.reviewQuestions} />
        </section>

        <AssetSavePanel
          assetType="marketing_schedule"
          title={assetTitle}
          summary={assetSummary}
          input={{
            businessName: result?.businessName,
            websiteUrl: result?.websiteUrl,
            nextMove: result?.nextMove,
            answers: result?.answers,
          }}
          output={schedule}
          prompt={{
            purpose: "Turn strategy and content into a weekly action rhythm for offer refinement, campaign prep, follow-up, and review.",
          }}
        />
      </section>
    </main>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <p key={item} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}
