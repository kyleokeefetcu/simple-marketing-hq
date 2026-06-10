"use client";

import Link from "next/link";
import { BarChart3, Compass, Target, Zap } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { getStoredResult } from "@/lib/launchpad";

export default function GrowthScorePage() {
  const result = getStoredResult();

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/dashboard" className="text-sm font-semibold text-cyan-800">
          Back to Command Center
        </Link>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Growth Score & Suggestions</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Use the score as a map, not the destination.</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Growth Score shows which foundation pieces need attention before you deploy into channels. Use it to decide which utility to open next.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard icon={<BarChart3 size={21} />} label="LaunchPad Score" value={result ? String(result.growthScore) : "--"} body="Overall foundation readiness." />
          <StatCard icon={<Target size={21} />} label="ICP Clarity" value={result ? String(result.icpClarity) : "--"} body="Best-fit customer, pain, trigger, and proof clarity." />
          <StatCard icon={<Zap size={21} />} label="Offer Strength" value={result ? String(result.offerStrength) : "--"} body="How easy the offer is to understand and act on." />
          <StatCard icon={<Compass size={21} />} label="Channel Fit" value={result?.channelToIcpFit ?? "--"} body="Whether the current channel matches the ICP." />
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Suggestions</h2>
            <div className="mt-4 grid gap-3">
              {(result?.actionItems ?? ["Run the LaunchPad Diagnostic.", "Define the best-fit customer.", "Build the offer starter."]).map((item) => (
                <p key={item} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {item}
                </p>
              ))}
            </div>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Open the next utility</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{result?.nextMove ?? "Start with the diagnostic, then come back here for a scored direction."}</p>
            <div className="mt-5 grid gap-3">
              <Link href="/icp-builder" className="rounded-md bg-cyan-900 px-4 py-3 text-center font-semibold text-white">
                Define ICP
              </Link>
              <Link href="/offer-builder" className="rounded-md border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800">
                Build Offer
              </Link>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
