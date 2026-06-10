"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AssetSavePanel } from "@/components/asset-save-panel";
import { buildResearchHub } from "@/lib/command-center";
import { getStoredResult } from "@/lib/launchpad";

export default function ResearchHubPage() {
  const result = getStoredResult();
  const research = buildResearchHub(result);
  const assetTitle = `${result?.businessName ?? "Business"} research brief`;
  const assetSummary = research.audiencePains[0] ?? "Audience research brief";

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/dashboard" className="text-sm font-semibold text-cyan-800">
          Back to Command Center
        </Link>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Research Hub</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Research the customer before launching the channel.</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Use this workspace to collect audience pains, competitor notes, objections, positioning angles, FAQs, and content ideas.
          </p>
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <ListCard title="Audience pains to validate" items={research.audiencePains} />
          <ListCard title="Competitor questions" items={research.competitorQuestions} />
          <ListCard title="Positioning angles" items={research.positioningAngles} />
          <ListCard title="FAQ seeds" items={research.faqSeeds} />
        </section>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Next research actions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {research.nextSteps.map((step) => (
              <p key={step} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {step}
              </p>
            ))}
          </div>
          <Link href="/message-builder" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
            Turn research into message
          </Link>
        </article>

        <AssetSavePanel
          assetType="research"
          title={assetTitle}
          summary={assetSummary}
          input={{
            businessName: result?.businessName,
            websiteUrl: result?.websiteUrl,
            answers: result?.answers,
          }}
          output={research}
          prompt={{
            purpose: "Save audience pains, competitor questions, positioning angles, FAQ seeds, and next research actions.",
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
