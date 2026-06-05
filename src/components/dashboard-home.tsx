"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, Building2, ClipboardList, Eye, MessageSquare, Share2, Target } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { brand } from "@/lib/brand";
import { dashboardModules, getStoredResult, type LaunchPadResult } from "@/lib/launchpad";

export function DashboardHome() {
  const [result] = useState<LaunchPadResult | null>(() => getStoredResult());

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.appName}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Your business growth game plan.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Your dashboard keeps the focus on the next practical move: message, customers, website, visibility, referrals, follow-up, and momentum.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/diagnostic" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
                Update Diagnostic
              </Link>
              <Link href="/check-in" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
                Weekly Check-in
              </Link>
            </div>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{brand.growthScoreName}</p>
            <p className="mt-2 text-6xl font-semibold text-cyan-900">{result?.growthScore ?? "--"}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {result ? result.biggestBottleneck : "Run the LaunchPad Diagnostic to generate your first score."}
            </p>
          </article>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard icon={<Target size={21} />} label="Leads" value="12" body="Placeholder for weekly lead count from check-ins." />
          <StatCard icon={<ClipboardList size={21} />} label="Booked calls" value="4" body="Track calls and missed opportunities without CRM overload." />
          <StatCard icon={<Eye size={21} />} label="High-intent visitors" value="7" body="RB2B-style company-level visitor intelligence placeholder." />
          <StatCard icon={<Share2 size={21} />} label="Referrals received" value="2" body="Referral partner foundation for future tracking." />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardModules.map((module) => (
            <Link key={module.slug} href={`/dashboard/${module.slug}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-950">{module.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{module.body}</p>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <QuickLink href="/content-engine" icon={<MessageSquare size={21} />} title="Stop Stack Content Engine" body="Generate hooks and campaign ideas designed to stop attention and move toward leads." />
          <QuickLink href="/dashboard/referrals" icon={<Building2 size={21} />} title="Referral profile" body="Create a referral-ready business profile and power team foundation." />
          <QuickLink href="/billing" icon={<Bell size={21} />} title="Upgrade path" body="Subscription-ready plan gates for future paid execution and optimization." />
        </div>
      </section>
    </main>
  );
}

function QuickLink({ href, icon, title, body }: { href: string; icon: ReactNode; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 grid size-10 place-items-center rounded-md bg-slate-100 text-cyan-900">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </Link>
  );
}
