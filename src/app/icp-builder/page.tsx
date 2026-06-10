"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Magnet, MessageSquare, Target, Users } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { buildIcpStarter } from "@/lib/command-center";
import { getStoredResult } from "@/lib/launchpad";

export default function IcpBuilderPage() {
  const [result] = useState(() => getStoredResult());
  const icp = buildIcpStarter(result);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">ICP Builder / Audience Match</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Define the customer your marketing should be built around.</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          ICP Builder turns diagnostic inputs into a best-fit customer profile, industry match, buying triggers, objections, message angles, lead magnets, channels, and offer adjustments.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid size-11 place-items-center rounded-md bg-cyan-50 text-cyan-900">
                <Users size={23} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Industry match</p>
                <h2 className="text-2xl font-semibold text-slate-950">{icp.industry}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              <IcpBlock title="Best-fit customer summary" body={icp.bestFitSummary} />
              <IcpBlock title="Bad-fit customer warning" body={icp.badFitWarning} icon={<AlertTriangle size={18} aria-hidden="true" />} />
            </div>
          </article>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Next action steps</h2>
            <div className="mt-4 grid gap-3">
              {icp.nextActions.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-slate-200 p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-cyan-900 text-sm font-semibold text-white">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
            <Link href="/offer-builder" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Build offer from this ICP
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <OutputList icon={<Target size={21} />} title="Top pains" items={icp.topPains} />
          <OutputList icon={<AlertTriangle size={21} />} title="Buying triggers" items={icp.buyingTriggers} />
          <OutputList icon={<MessageSquare size={21} />} title="Objections" items={icp.objections} />
          <OutputList icon={<MessageSquare size={21} />} title="Message angles" items={icp.messageAngles} />
          <OutputList icon={<Magnet size={21} />} title="Lead magnet ideas" items={icp.leadMagnets} />
          <OutputList icon={<Target size={21} />} title="Best channels to consider" items={icp.channels} />
        </div>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Offer adjustments</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {icp.offerAdjustments.map((adjustment) => (
              <div key={adjustment} className="rounded-md border border-slate-200 p-4">
                <p className="text-sm leading-6 text-slate-700">{adjustment}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function IcpBlock({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        {icon ? <span className="text-amber-700">{icon}</span> : null}
        <p className="text-sm font-semibold text-slate-500">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-800">{body}</p>
    </div>
  );
}

function OutputList({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid size-10 place-items-center rounded-md bg-slate-100 text-cyan-900">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <p key={item} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}
