"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AssetSavePanel } from "@/components/asset-save-panel";
import { buildOfferStarter } from "@/lib/command-center";
import { getStoredResult } from "@/lib/launchpad";
import { useState } from "react";

export default function OfferBuilderPage() {
  const [result] = useState(() => getStoredResult());
  const offer = buildOfferStarter(result);
  const assetTitle = `${result?.businessName ?? "Business"} offer stack`;
  const assetSummary = `${offer.dreamOutcome} Clear CTA: ${offer.cta}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Offer Builder</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Build the offer before launching the channel.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Shape the customer outcome, value stack, proof, risk reducer, and call-to-action so your marketing has something clear to launch.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Starter offer stack</h2>
            <div className="mt-5 grid gap-4">
              <OfferRow label="Dream outcome" value={offer.dreamOutcome} />
              <OfferRow label="Problem to solve" value={offer.problem} />
              <OfferRow label="Why now" value={offer.whyNow} />
              <OfferRow label="Clear CTA" value={offer.cta} />
            </div>
          </article>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Build order</h2>
            <div className="mt-4 grid gap-3">
              {offer.offerStack.map((item, index) => (
                <div key={item} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-cyan-800">Step {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <Link href="/content-engine" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Create content from this offer
            </Link>
          </aside>
        </div>

        <AssetSavePanel
          assetType="offer"
          title={assetTitle}
          summary={assetSummary}
          input={{
            businessName: result?.businessName,
            websiteUrl: result?.websiteUrl,
            bottleneck: result?.biggestBottleneck,
            answers: result?.answers,
          }}
          output={offer}
          prompt={{
            purpose: "Create a practical offer stack with outcome, pain, proof, risk reducer, package framing, CTA, and next steps.",
          }}
        />
      </section>
    </main>
  );
}

function OfferRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}
