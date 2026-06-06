"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { Building2, ClipboardList, Compass, Eye, Lightbulb, MessageSquare, Plus, Rocket, Share2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { brand } from "@/lib/brand";
import { commandCenterModules } from "@/lib/command-center";
import { dashboardModules, getStoredResult, type LaunchPadResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  createBusiness,
  getBusinesses,
  getSavedCheckIns,
  getSavedDiagnostics,
  type BusinessSummary,
  type SavedCheckInSummary,
  type SavedDiagnosticSummary,
} from "@/lib/supabase/diagnostics";

export function DashboardHome() {
  const [result] = useState<LaunchPadResult | null>(() => getStoredResult());
  const [diagnostics, setDiagnostics] = useState<SavedDiagnosticSummary[]>([]);
  const [checkIns, setCheckIns] = useState<SavedCheckInSummary[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(() => getSelectedBusinessId());
  const [newBusinessName, setNewBusinessName] = useState("");
  const [diagnosticStatus, setDiagnosticStatus] = useState("Connect Supabase to show saved diagnostics.");
  const [businessStatus, setBusinessStatus] = useState("");
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setRequiresLogin(true);
        setDiagnosticStatus("Log in to show saved diagnostics from Supabase.");
        return;
      }

      try {
        const [savedBusinesses, saved, savedCheckIns] = await Promise.all([getBusinesses(supabase), getSavedDiagnostics(supabase), getSavedCheckIns(supabase)]);
        const savedSelectedBusinessId = getSelectedBusinessId();
        const validSelectedBusiness = savedBusinesses.some((business) => business.id === savedSelectedBusinessId);
        const nextSelectedBusinessId = validSelectedBusiness ? savedSelectedBusinessId : savedBusinesses.length === 1 ? savedBusinesses[0].id : "";
        if (nextSelectedBusinessId) {
          window.localStorage.setItem("simple-marketing-hq:selected-business-id", nextSelectedBusinessId);
        }
        setBusinesses(savedBusinesses);
        setSelectedBusinessId(nextSelectedBusinessId);
        setDiagnostics(saved);
        setCheckIns(savedCheckIns);
        setDiagnosticStatus(saved.length ? "Saved diagnostics loaded from Supabase." : "No saved diagnostics yet.");
      } catch (error) {
        setDiagnosticStatus(`Could not load saved diagnostics: ${(error as Error).message}`);
      }
    }

    void loadWorkspace();
  }, []);

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const scopedDiagnostics = selectedBusinessId ? diagnostics.filter((diagnostic) => diagnostic.businessId === selectedBusinessId) : diagnostics;
  const scopedCheckIns = selectedBusinessId ? checkIns.filter((checkIn) => checkIn.businessId === selectedBusinessId) : checkIns;
  const latestDiagnostic = scopedDiagnostics[0];
  const latestCheckIn = scopedCheckIns[0];
  const score = latestDiagnostic?.growthScore ?? result?.growthScore ?? null;
  const businessLimit = getBusinessLimit("free");
  const portfolioMode = !selectedBusinessId && businesses.length > 0;

  function selectBusiness(businessId: string) {
    setSelectedBusinessId(businessId);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);
  }

  function clearBusinessSelection() {
    setSelectedBusinessId("");
    window.localStorage.removeItem("simple-marketing-hq:selected-business-id");
  }

  async function addBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusinessStatus("");
    const name = newBusinessName.trim();
    if (!name) return;

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setBusinessStatus("Connect Supabase before adding a saved Business / Client.");
      return;
    }

    setIsAddingBusiness(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setBusinessStatus("Log in before adding a Business / Client.");
        return;
      }

      const businessId = await createBusiness(supabase, data.user, name);
      const savedBusinesses = await getBusinesses(supabase);
      setBusinesses(savedBusinesses);
      setNewBusinessName("");
      selectBusiness(businessId);
      setBusinessStatus(`${name} added and selected.`);
    } catch (error) {
      setBusinessStatus(`Could not add Business / Client: ${(error as Error).message}`);
    } finally {
      setIsAddingBusiness(false);
    }
  }

  if (requiresLogin) {
    return (
      <main className="min-h-screen bg-slate-50">
        <AppHeader />
        <section className="mx-auto w-full max-w-3xl px-5 py-12">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.appName}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Log in to view your saved dashboard.</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Your dashboard shows saved Business / Client profiles, LaunchPad Diagnostics, check-ins, action plans, and referral profile data tied to your account.
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
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">
              {selectedBusiness ? `${selectedBusiness.name} command center.` : "Your Business / Client command center."}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {selectedBusiness
                ? "All modules and outputs are scoped to this selected Business / Client."
                : "Create or select a Business / Client, then prepare the offer, message, audience, strategy, content, schedule, assets, and recommendations."}
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

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Business / Client switcher</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedBusinessId}
                  onChange={(event) => (event.target.value ? selectBusiness(event.target.value) : clearBusinessSelection())}
                  className="min-h-12 rounded-md border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="">All businesses / clients</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={clearBusinessSelection}
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  View all
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Current account limit shown: {businessLimit.label}. Additional Business / Client profiles can be priced at $15/month after the plan limit.
              </p>
              {businessStatus ? <p className="mt-3 text-sm font-semibold text-cyan-800">{businessStatus}</p> : null}
            </div>
            <form onSubmit={addBusiness} className="rounded-md bg-slate-50 p-4">
              <label className="text-sm font-semibold text-slate-700">
                Add Business / Client
                <input
                  value={newBusinessName}
                  onChange={(event) => setNewBusinessName(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Business or client name"
                />
              </label>
              <button
                disabled={isAddingBusiness || !newBusinessName.trim()}
                className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} aria-hidden="true" />
                {isAddingBusiness ? "Adding..." : "Add Business / Client"}
              </button>
            </form>
          </div>
        </article>

        {portfolioMode ? (
          <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Business / Client portfolio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select a Business / Client to scope diagnostics, offer work, content, strategy, advisor output, and recommendations.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => {
                const latestBusinessDiagnostic = diagnostics.find((diagnostic) => diagnostic.businessId === business.id);
                return (
                  <button
                    key={business.id}
                    type="button"
                    onClick={() => selectBusiness(business.id)}
                    className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{business.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{business.websiteUrl || "Website not saved yet"}</p>
                      </div>
                      <span className="rounded-md bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900">
                        {latestBusinessDiagnostic?.growthScore ?? "--"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-600">
                      <p>Current bottleneck: {latestBusinessDiagnostic?.biggestBottleneck ?? "Run a diagnostic."}</p>
                      <p>Next action: {latestBusinessDiagnostic?.nextMove ?? "Start with intake."}</p>
                      <p>Last diagnostic: {latestBusinessDiagnostic ? formatDate(latestBusinessDiagnostic.completedAt) : "Not completed"}</p>
                      <p>Offer status: {latestBusinessDiagnostic ? "Starter ready" : "Needs diagnostic"}</p>
                      <p>Content plan status: {latestBusinessDiagnostic ? "Starter ideas available" : "Needs offer input"}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </article>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard icon={<Target size={21} />} label="Leads" value={latestCheckIn ? String(latestCheckIn.leadsCount) : "--"} body="Saved from your most recent weekly check-in." />
          <StatCard icon={<ClipboardList size={21} />} label="Booked calls" value={latestCheckIn ? String(latestCheckIn.bookedCallsCount) : "--"} body="Track booked conversations from your check-ins." />
          <StatCard icon={<Eye size={21} />} label="Saved diagnostics" value={String(scopedDiagnostics.length)} body="LaunchPad Diagnostic history for the current view." />
          <StatCard icon={<Share2 size={21} />} label="Referrals received" value={latestCheckIn ? String(latestCheckIn.referralsCount) : "--"} body="Referral activity from your weekly check-in." />
        </div>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Command center spine</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Build the foundation before launch.</h2>
            </div>
              <Link href={scopedHref("/offer-builder", selectedBusinessId)} className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Start Offer Builder
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {commandCenterModules.map((module) => (
              <Link key={module.slug} href={scopedHref(module.href, selectedBusinessId)} className="rounded-md border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
                <p className="font-semibold text-slate-950">{module.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.body}</p>
              </Link>
            ))}
          </div>
        </article>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardModules.map((module) => (
            <Link key={module.slug} href={scopedHref(`/dashboard/${module.slug}`, selectedBusinessId)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
            {scopedDiagnostics.length ? (
              scopedDiagnostics.map((diagnostic) => (
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
                Complete the LaunchPad Diagnostic while logged in, or create/select a Business / Client after completing a diagnostic, to save it to Supabase.
              </div>
            )}
          </div>
        </article>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <QuickLink href={scopedHref("/offer-builder", selectedBusinessId)} icon={<Rocket size={21} />} title="Offer Builder" body="Shape outcome, pain, proof, risk reducer, package framing, and CTA before launch." />
          <QuickLink href={scopedHref("/strategy-map", selectedBusinessId)} icon={<Compass size={21} />} title="Strategy Map" body="Turn the diagnosis into next 7 days, next 30 days, missing assets, and launch order." />
          <QuickLink href={scopedHref("/advisor", selectedBusinessId)} icon={<Lightbulb size={21} />} title={brand.advisorName} body="Get the next action, why it matters, execution steps, and the asset to build." />
          <QuickLink href={scopedHref("/content-engine", selectedBusinessId)} icon={<MessageSquare size={21} />} title="Content Engine" body="Generate hooks, scripts, posts, sequences, lead magnets, and campaign ideas." />
          <QuickLink href={scopedHref("/dashboard/referrals", selectedBusinessId)} icon={<Building2 size={21} />} title="Referral profile" body="Create a referral-ready business profile and power team foundation." />
          <QuickLink href={scopedHref("/check-in", selectedBusinessId)} icon={<ClipboardList size={21} />} title="Weekly check-in" body="Save fresh lead, booking, referral, and follow-up notes for your dashboard." />
        </div>
      </section>
    </main>
  );
}

function getSelectedBusinessId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("simple-marketing-hq:selected-business-id") ?? "";
}

function scopedHref(href: string, businessId: string) {
  return businessId ? `${href}?businessId=${encodeURIComponent(businessId)}` : href;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function getBusinessLimit(plan: string) {
  const limits: Record<string, string> = {
    free: "Free Diagnostic: 1 business",
    starter: "Starter: 1 business",
    owner: "Owner: up to 3 businesses",
    growth: "Growth / Agency Lite: up to 10 businesses / clients",
    agency_pro: "Agency Pro: up to 25 businesses / clients",
  };

  return { label: limits[plan] ?? limits.free };
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
