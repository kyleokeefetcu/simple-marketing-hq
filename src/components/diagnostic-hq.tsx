"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, GitCompareArrows, History, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getBusinesses, getSavedDiagnostics, type BusinessSummary, type SavedDiagnosticSummary } from "@/lib/supabase/diagnostics";

type DiagnosticDraft = {
  phase?: string;
  gapIndex?: number;
  answers?: Record<string, string>;
  startedAt?: string;
};

export function DiagnosticHQ() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [diagnostics, setDiagnostics] = useState<SavedDiagnosticSummary[]>([]);
  const [draft, setDraft] = useState<DiagnosticDraft | null>(null);
  const [status, setStatus] = useState("Loading diagnostic history...");

  useEffect(() => {
    async function loadDiagnosticHQ() {
      setDraft(getLocalDraft());
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setStatus("Connect Supabase to show saved diagnostic history.");
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setStatus("Log in to show saved diagnostic history for your Business / Client.");
        return;
      }

      try {
        const savedBusinesses = await getBusinesses(supabase);
        const storedBusinessId = window.localStorage.getItem("simple-marketing-hq:selected-business-id") ?? "";
        const validStoredBusiness = savedBusinesses.some((business) => business.id === storedBusinessId);
        const nextBusinessId = validStoredBusiness ? storedBusinessId : savedBusinesses[0]?.id ?? "";
        setBusinesses(savedBusinesses);
        setSelectedBusinessId(nextBusinessId);

        if (nextBusinessId) {
          window.localStorage.setItem("simple-marketing-hq:selected-business-id", nextBusinessId);
          const savedDiagnostics = await getSavedDiagnostics(supabase, nextBusinessId);
          setDiagnostics(savedDiagnostics);
          setStatus(savedDiagnostics.length ? "Diagnostic history loaded." : "No completed diagnostics yet for this Business / Client.");
        } else {
          setStatus("Create or select a Business / Client, then run your first diagnostic.");
        }
      } catch (error) {
        setStatus(`Could not load diagnostic history: ${(error as Error).message}`);
      }
    }

    void loadDiagnosticHQ();
  }, []);

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !businessId) return;

    try {
      const savedDiagnostics = await getSavedDiagnostics(supabase, businessId);
      setDiagnostics(savedDiagnostics);
      setStatus(savedDiagnostics.length ? "Diagnostic history loaded." : "No completed diagnostics yet for this Business / Client.");
    } catch (error) {
      setStatus(`Could not switch diagnostic history: ${(error as Error).message}`);
    }
  }

  const latest = diagnostics[0] ?? null;
  const previous = diagnostics[1] ?? null;
  const runHref = selectedBusinessId ? `/diagnostic/run?fresh=1&businessId=${selectedBusinessId}` : "/diagnostic/run?fresh=1";
  const resumeHref = selectedBusinessId ? `/diagnostic/run?resume=1&businessId=${selectedBusinessId}` : "/diagnostic/run?resume=1";
  const comparison = useMemo(() => buildComparison(latest, previous), [latest, previous]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">LaunchPad Diagnostic</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-950">LaunchPad Diagnostic</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Run a fresh marketing checkup when your business, customers, leads, offer, or priorities change.
            </p>
            <p className="mt-2 text-sm font-semibold text-cyan-800">{status}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={runHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              <Play size={18} aria-hidden="true" />
              Run New Diagnostic
            </Link>
            <select
              value={selectedBusinessId}
              onChange={(event) => void handleBusinessChange(event.target.value)}
              className="min-h-12 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
              aria-label="Business / Client"
            >
              <option value="">Select Business / Client</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <ClipboardList className="mt-1 shrink-0 text-cyan-800" size={22} aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">A fresh snapshot of what is happening now.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Marketing changes over time. A diagnostic gives Simple Marketing HQ a fresh read on what is happening right now so your offer, message, content, strategy, and next actions can improve.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Latest Diagnostic</p>
            {latest ? (
              <>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{latest.businessName}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <SnapshotItem label="Completed" value={formatDate(latest.completedAt)} />
                  <SnapshotItem label="Growth Score" value={latest.growthScore === null ? "--" : `${latest.growthScore}/100`} />
                  <SnapshotItem label="Current bottleneck" value={latest.biggestBottleneck} />
                  <SnapshotItem label="Next action" value={latest.nextMove} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/diagnostic/result?diagnosticId=${latest.id}`} className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white">
                    View Latest Results
                  </Link>
                  <a href="#compare" className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800">
                    Compare to Previous
                  </a>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-md bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">You have not run a diagnostic for this business yet.</p>
                <Link href={runHref} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white">
                  Run First Diagnostic
                </Link>
              </div>
            )}
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Current Draft</p>
            {draft ? (
              <>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Unfinished diagnostic</h2>
                <div className="mt-4 grid gap-3">
                  <SnapshotItem label="Started" value={formatDate(draft.startedAt ?? new Date().toISOString())} />
                  <SnapshotItem label="Progress" value={draft.phase === "questions" ? `Question ${(draft.gapIndex ?? 0) + 1}` : draft.phase === "confirm" ? "Website review" : "Website step"} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={resumeHref} className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white">
                    Continue Draft
                  </Link>
                  <Link href={runHref} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800">
                    Start New Instead
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">No unfinished diagnostic is saved in this browser.</p>
            )}
          </article>
        </section>

        <section className="mt-5 rounded-lg border border-cyan-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Run New Diagnostic</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Take a fresh look at the business.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Run a fresh diagnostic when something changed or when you want a new read on your marketing. This starts at step 1 and keeps older diagnostics as archived snapshots.
              </p>
            </div>
            <Link href={runHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              <RotateCcw size={18} aria-hidden="true" />
              Run New Diagnostic
            </Link>
          </div>
        </section>

        {latest && previous ? (
          <section id="compare" className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <GitCompareArrows className="mt-1 shrink-0 text-cyan-800" size={22} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">What changed since last time</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Latest snapshot compared with the prior diagnostic.</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {comparison.map((item) => (
                <SnapshotItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <History className="text-cyan-800" size={22} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Diagnostic Archive</p>
              <h2 className="text-2xl font-semibold text-slate-950">Previous snapshots stay available.</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {diagnostics.length ? (
              diagnostics.map((diagnostic, index) => (
                <article key={diagnostic.id} className="grid gap-3 rounded-md border border-slate-200 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{formatDate(diagnostic.completedAt)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${index === 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {index === 0 ? "Current" : "Archived"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Score: {diagnostic.growthScore ?? "--"} | Bottleneck: {diagnostic.biggestBottleneck} | Next: {diagnostic.nextMove}
                    </p>
                  </div>
                  <Link href={`/diagnostic/result?diagnosticId=${diagnostic.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800">
                    View Results
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">No completed diagnostics yet.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function getLocalDraft(): DiagnosticDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("simple-marketing-hq:diagnostic-progress");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DiagnosticDraft;
    return parsed.answers || parsed.phase ? parsed : null;
  } catch {
    return null;
  }
}

function buildComparison(latest: SavedDiagnosticSummary | null, previous: SavedDiagnosticSummary | null) {
  if (!latest || !previous) return [];
  const scoreDelta = latest.growthScore !== null && previous.growthScore !== null ? latest.growthScore - previous.growthScore : null;
  const repeated = latest.biggestBottleneck === previous.biggestBottleneck;
  return [
    { label: "What improved", value: scoreDelta === null ? "Run one more diagnostic to see score movement." : scoreDelta > 0 ? `Growth Score improved by ${scoreDelta} points.` : "No score improvement yet." },
    { label: "What got worse", value: scoreDelta !== null && scoreDelta < 0 ? `Growth Score dropped by ${Math.abs(scoreDelta)} points.` : "No score drop detected." },
    { label: "What changed", value: latest.nextMove !== previous.nextMove ? `Next action changed to: ${latest.nextMove}` : "The next action is similar to last time." },
    { label: "New bottleneck", value: repeated ? "No new bottleneck detected." : latest.biggestBottleneck },
    { label: "Repeated bottleneck", value: repeated ? latest.biggestBottleneck : "The bottleneck changed since the prior snapshot." },
    { label: "Recommended next action", value: latest.nextMove },
  ];
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
