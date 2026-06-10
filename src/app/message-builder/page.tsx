"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { buildMessageStarter } from "@/lib/command-center";
import { getStoredResult } from "@/lib/launchpad";

export default function MessageBuilderPage() {
  const result = getStoredResult();
  const message = buildMessageStarter(result);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/dashboard" className="text-sm font-semibold text-cyan-800">
          Back to Command Center
        </Link>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Message Builder</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Turn the offer into words customers understand.</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Use saved diagnostic context to create a homepage headline, elevator pitch, proof points, and follow-up lines.
          </p>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Starter message</h2>
            <div className="mt-4 grid gap-4">
              <OutputBlock label="Homepage headline" value={message.headline} />
              <OutputBlock label="Elevator pitch" value={message.elevatorPitch} />
            </div>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Use it next</h2>
            <div className="mt-4 grid gap-3">
              {message.nextSteps.map((step) => (
                <p key={step} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {step}
                </p>
              ))}
            </div>
            <Link href="/content-engine" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Create content from this message
            </Link>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {message.proofPoints.map((point) => (
            <article key={point} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Proof point</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{point}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function OutputBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-base leading-7 text-slate-900">{value}</p>
    </div>
  );
}
