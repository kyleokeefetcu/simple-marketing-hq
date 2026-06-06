"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, ClipboardList, Eye, MessageSquare, Share2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { brand } from "@/lib/brand";
import { dashboardModules, getStoredResult, type LaunchPadResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getSavedCheckIns, getSavedDiagnostics, type SavedCheckInSummary, type SavedDiagnosticSummary } from "@/lib/supabase/diagnostics";

export function DashboardHome() {
  const [result] = useState<LaunchPadResult | null>(() => getStoredResult());
  const [diagnostics, setDiagnostics] = useState<SavedDiagnosticSummary[]>([]);
  const [checkIns, setCheckIns] = useState<SavedCheckInSummary[]>([]);
  const [diagnosticStatus, setDiagnosticStatus] = useState("Connect Supabase to show saved diagnostics.");
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    async function loadDiagnostics() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setRequiresLogin(true);
        setDiagnosticStatus("Log in to show saved diagnostics from Supabase.");
        return;
      }

      try {
        const [saved, savedCheckIns] = await Promise.all([getSavedDiagnostics(supabase), getSavedCheckIns(supabase)]);
        setDiagnostics(saved);
        setCheckIns(savedCheckIns);
        setDiagnosticStatus(saved.length ? "Saved diagnostics loaded from Supabase." : "No saved diagnostics yet.");
      } catch (error) {
        setDiagnosticStatus(`Could not load saved diagnostics: ${(error as Error).message}`);
      }
    }

    void loadDiagnostics();
  }, []);

  const latestDiagnostic = diagnostics[0];
  const latestCheckIn = checkIns[0];
  const score = latestDiagnostic?.growthScore ?? result?.growthScore ?? null;

  if (requiresLogin) {
    return (
      <main className="min-h-screen bg-slate-50">
        <AppHeader />
        <section className="mx-auto w-full max-w-3xl px-5 py-12">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.appName}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Log in to view your saved dashboard.</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Your dashboard shows saved LaunchPad Diagnostics, check-ins, action plans, and referral profile data tied to your account.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
                Login
              </Link>
              <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
                Create account
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

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
            <p className="mt-2 text-6xl font-semibold text-cyan-900">{score ?? "--"}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {latestDiagnostic?.biggestBottleneck ?? result?.biggestBottleneck ?? "Run the LaunchPad Diagnostic to generate your first score."}
            </p>
          </article>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard icon={<Target size={21} />} label="Leads" value={latestCheckIn ? String(latestCheckIn.leadsCount) : "--"} body="Saved from your most recent weekly check-in." />
          <StatCard icon={<ClipboardList size={21} />} label="Booked calls" value={latestCheckIn ? String(latestCheckIn.bookedCallsCount) : "--"} body="Track booked conversations from your check-ins." />
          <StatCard icon={<Eye size={21} />} label="Saved diagnostics" value={String(diagnostics.length)} body="LaunchPad Diagnostic history tied to your account." />
          <StatCard icon={<Share2 size={21} />} label="Referrals received" value={latestCheckIn ? String(latestCheckIn.referralsCount) : "--"} body="Referral activity from your weekly check-in." />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardModules.map((module) => (
            <Link key={module.slug} href={`/dashboard/${module.slug}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-950">{module.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{module.body}</p>
            </Link>
          ))}
        </div>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Saved LaunchPad Diagnostics</h2>
              <p className="mt-1 text-sm text-slate-600">{diagnosticStatus}</p>
            </div>
            <Link href="/diagnostic" className="rounded-md bg-cyan-900 px-4 py-2 text-sm font-semibold text-white">
              New Diagnostic
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {diagnostics.length ? (
              diagnostics.map((diagnostic) => (
                <div key={diagnostic.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{diagnostic.businessName}</p>
                      <p className="mt-1 text-sm text-slate-500">{diagnostic.websiteUrl}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{diagnostic.biggestBottleneck}</p>
                    </div>
                    <div className="rounded-md bg-cyan-50 px-3 py-2 text-center">
                      <p className="text-xs font-semibold text-cyan-800">Score</p>
                      <p className="text-2xl font-semibold text-cyan-950">{diagnostic.growthScore ?? "--"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-cyan-900">{diagnostic.nextMove}</p>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-600">
                Complete the LaunchPad Diagnostic while logged in, or create an account after completing a diagnostic, to save it to Supabase.
              </div>
            )}
          </div>
        </article>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <QuickLink href="/content-engine" icon={<MessageSquare size={21} />} title="Stop Stack Content Engine" body="Generate hooks and campaign ideas designed to stop attention and move toward leads." />
          <QuickLink href="/dashboard/referrals" icon={<Building2 size={21} />} title="Referral profile" body="Create a referral-ready business profile and power team foundation." />
          <QuickLink href="/check-in" icon={<ClipboardList size={21} />} title="Weekly check-in" body="Save fresh lead, booking, referral, and follow-up notes for your dashboard." />
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
