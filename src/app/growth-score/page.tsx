"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { getStoredResult, type LaunchPadResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getBusinesses, getSavedDiagnostics, type BusinessSummary, type SavedDiagnosticSummary } from "@/lib/supabase/diagnostics";
import { BarChart3, Compass, Target, Zap } from "lucide-react";

export default function GrowthScorePage() {
  const [result, setResult] = useState<LaunchPadResult | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [latestDiagnostic, setLatestDiagnostic] = useState<SavedDiagnosticSummary | null>(null);
  const [status, setStatus] = useState("Loading saved Growth Score...");

  useEffect(() => {
    async function loadGrowthScore() {
      const storedResult = getStoredResult();
      setResult(storedResult);
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setStatus(storedResult ? "Showing the diagnostic saved in this browser." : "Connect Supabase and run the LaunchPad Diagnostic to see a saved Growth Score.");
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setStatus(storedResult ? "Showing the diagnostic saved in this browser. Log in to load saved Business / Client history." : "Log in and run the LaunchPad Diagnostic to see a saved Growth Score.");
        return;
      }

      try {
        const savedBusinesses = await getBusinesses(supabase);
        const storedBusinessId = window.localStorage.getItem("simple-marketing-hq:selected-business-id") ?? "";
        const validStoredBusiness = savedBusinesses.some((business) => business.id === storedBusinessId);
        const nextBusinessId = validStoredBusiness ? storedBusinessId : savedBusinesses[0]?.id ?? "";

        setBusinesses(savedBusinesses);
        setSelectedBusinessId(nextBusinessId);

        if (!nextBusinessId) {
          setStatus("Create or select a Business / Client, then run the LaunchPad Diagnostic.");
          return;
        }

        window.localStorage.setItem("simple-marketing-hq:selected-business-id", nextBusinessId);
        const diagnostics = await getSavedDiagnostics(supabase, nextBusinessId);
        setLatestDiagnostic(diagnostics[0] ?? null);
        setStatus(diagnostics[0] ? "Latest saved Growth Score loaded from Supabase." : "No saved diagnostic yet for this Business / Client.");
      } catch (error) {
        setStatus(`Could not load saved Growth Score: ${(error as Error).message}`);
      }
    }

    void loadGrowthScore();
  }, []);

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !businessId) return;

    try {
      const diagnostics = await getSavedDiagnostics(supabase, businessId);
      setLatestDiagnostic(diagnostics[0] ?? null);
      setStatus(diagnostics[0] ? "Switched to this Business / Client's latest saved Growth Score." : "No saved diagnostic yet for this Business / Client.");
    } catch (error) {
      setStatus(`Could not switch Growth Score: ${(error as Error).message}`);
    }
  }

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const growthScore = latestDiagnostic?.growthScore ?? result?.growthScore ?? null;
  const icpClarity = latestDiagnostic?.icpClarity ?? result?.icpClarity ?? null;
  const offerStrength = latestDiagnostic?.offerStrength ?? result?.offerStrength ?? null;
  const channelFit = latestDiagnostic?.channelToIcpFit || result?.channelToIcpFit || "--";
  const actionItems = latestDiagnostic?.actionItems.length ? latestDiagnostic.actionItems : result?.actionItems ?? ["Run the LaunchPad Diagnostic.", "Define the best-fit customer.", "Build the offer starter."];
  const nextMove = latestDiagnostic?.nextMove || result?.nextMove || "Start with the diagnostic, then come back here for a scored direction.";
  const recommendedFirstChannel = latestDiagnostic?.recommendedFirstChannel || result?.recommendedFirstChannel || "Run the updated diagnostic to get this recommendation.";
  const channelRecommendationWhy = latestDiagnostic?.channelRecommendationWhy || result?.channelRecommendationWhy || "Simple Marketing HQ will infer this from your current lead sources, category, website readiness, follow-up, and time.";
  const scopedHref = (href: string) => (selectedBusinessId ? `${href}?businessId=${selectedBusinessId}` : href);

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
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => void handleBusinessChange(event.target.value)}
              className="min-h-12 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
              aria-label="Select Business / Client"
            >
              <option value="">Select Business / Client</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
            <p className="text-sm leading-6 text-slate-600">{selectedBusiness ? `Business: ${selectedBusiness.name}. ` : ""}{status}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <StatCard icon={<BarChart3 size={21} />} label="LaunchPad Score" value={growthScore === null ? "--" : String(growthScore)} body="Overall foundation readiness." />
          <StatCard icon={<Target size={21} />} label="ICP Clarity" value={icpClarity === null ? "--" : String(icpClarity)} body="Best-fit customer, pain, trigger, and proof clarity." />
          <StatCard icon={<Zap size={21} />} label="Offer Strength" value={offerStrength === null ? "--" : String(offerStrength)} body="How easy the offer is to understand and act on." />
          <StatCard icon={<Compass size={21} />} label="Channel Fit" value={channelFit} body="Whether the current channel matches the ICP." />
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Suggestions</h2>
            <div className="mt-4 grid gap-3">
              {actionItems.map((item) => (
                <p key={item} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {item}
                </p>
              ))}
            </div>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Open the next utility</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{nextMove}</p>
            <div className="mt-4 rounded-md bg-cyan-50 p-4">
              <p className="text-sm font-semibold text-cyan-950">Recommended first channel</p>
              <p className="mt-2 text-sm leading-6 text-cyan-900">{recommendedFirstChannel}</p>
              <p className="mt-2 text-sm leading-6 text-cyan-900">{channelRecommendationWhy}</p>
            </div>
            <div className="mt-5 grid gap-3">
              <Link href={scopedHref("/icp-builder")} className="rounded-md bg-cyan-900 px-4 py-3 text-center font-semibold text-white">
                Define ICP
              </Link>
              <Link href={scopedHref("/offer-builder")} className="rounded-md border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800">
                Build Offer
              </Link>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
