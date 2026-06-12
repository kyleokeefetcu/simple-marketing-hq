"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, Clipboard, FlaskConical, History, Pencil, RefreshCw, Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AssetSavePanel } from "@/components/asset-save-panel";
import { getIndustryProfile, getStoredResult, type LaunchPadResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getMarketingAssets, type MarketingAssetSummary, type MarketingAssetType } from "@/lib/supabase/assets";
import { getBusinesses, getSavedDiagnostics, type BusinessSummary, type SavedDiagnosticSummary } from "@/lib/supabase/diagnostics";
import type { PromptRoleId } from "@/lib/ai/prompts/shared-output-rules";

type UtilityKind = "icp" | "offer" | "message" | "content" | "strategy_map" | "marketing_schedule" | "research" | "recommendation";

type UtilityConfig = {
  kind: UtilityKind;
  roleId: PromptRoleId;
  assetType: MarketingAssetType;
  navName: string;
  title: string;
  promise: string;
  currentAssetTitle: string;
  cmoTitle: string;
  feedLabel: string;
  feedPlaceholder: string;
  nextHref: string;
  nextLabel: string;
  nextOutput: string;
};

type UtilityContext = {
  result: LaunchPadResult | null;
  business: BusinessSummary | null;
  latestDiagnostic: SavedDiagnosticSummary | null;
  priorAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>>;
};

type Deliverable = {
  title: string;
  summary: string;
  currentAsset: { label: string; value: string }[];
  cmoRecommendation: {
    recommendation: string;
    why: string;
    customerProblem: string;
    outcome: string;
    nextAction: string;
    confidence: string;
  };
  copyPasteBlocks: { label: string; value: string }[];
  whyThisWorks: string;
  tests: { title: string; where: string; measure: string; signal: string; nextMove: string }[];
  useItNow: string[];
  actionSteps: string[];
  changeSummary: string;
  suggestedNextUtility: { label: string; href: string };
};

const assetTypes: MarketingAssetType[] = [
  "icp",
  "offer",
  "message",
  "content",
  "strategy_map",
  "marketing_schedule",
  "research",
  "recommendation",
  "buyer_psychology_audit",
  "market_demand_check",
  "problem_narrative",
  "buyer_messaging_output",
  "messaging_sequence",
];

const configs: Record<UtilityKind, UtilityConfig> = {
  icp: {
    kind: "icp",
    roleId: "icp_builder",
    assetType: "icp",
    navName: "Audience HQ",
    title: "Current best-fit customer for this business.",
    promise: "Simple Marketing HQ keeps this audience recommendation current as you add customer notes, objections, and real market feedback.",
    currentAssetTitle: "Current Best-Fit Customer",
    cmoTitle: "Audience recommendation",
    feedLabel: "Customer signal, sales note, objection, or review",
    feedPlaceholder: "Paste what a customer said, who bought fastest, who was a poor fit, a review, or a note from a real conversation.",
    nextHref: "/offer-builder",
    nextLabel: "Create Offer",
    nextOutput: "offer statement + CTA + proof point",
  },
  offer: {
    kind: "offer",
    roleId: "offer_builder",
    assetType: "offer",
    navName: "Offer HQ",
    title: "Current recommended offer for this business.",
    promise: "Simple Marketing HQ updates the offer as new buyer feedback, proof, and market signals come in.",
    currentAssetTitle: "Current Offer",
    cmoTitle: "Offer recommendation",
    feedLabel: "Customer question, objection, offer note, or campaign result",
    feedPlaceholder: "Paste a customer question, offer idea, objection, review, sales note, or what worked/did not work.",
    nextHref: "/message-builder",
    nextLabel: "Create Messaging",
    nextOutput: "headline + short pitch + CTA",
  },
  message: {
    kind: "message",
    roleId: "message_builder",
    assetType: "message",
    navName: "Messaging HQ",
    title: "Current messaging system for this business.",
    promise: "Simple Marketing HQ turns your current offer and buyer signals into clean words customers can understand and act on.",
    currentAssetTitle: "Current Message",
    cmoTitle: "Messaging recommendation",
    feedLabel: "Customer words, sales-call note, objection, or draft copy",
    feedPlaceholder: "Paste what customers say when they call, a rough headline, an objection, or a note from a sales conversation.",
    nextHref: "/content-engine",
    nextLabel: "Create Content",
    nextOutput: "hooks + posts + email ideas",
  },
  content: {
    kind: "content",
    roleId: "content_engine",
    assetType: "content",
    navName: "Content HQ",
    title: "Current content themes and assets.",
    promise: "Simple Marketing HQ converts the offer, audience, and message into useful content you can deploy through outside channels.",
    currentAssetTitle: "Current Content Plan",
    cmoTitle: "Content recommendation",
    feedLabel: "Content result, customer comment, topic idea, or campaign note",
    feedPlaceholder: "Paste a customer question, post idea, campaign result, content that worked, or topic you want to turn into useful assets.",
    nextHref: "/marketing-schedule",
    nextLabel: "Plan This Week",
    nextOutput: "weekly content rhythm",
  },
  strategy_map: {
    kind: "strategy_map",
    roleId: "strategy_map",
    assetType: "strategy_map",
    navName: "Strategy HQ",
    title: "Current marketing priorities and order of operations.",
    promise: "Simple Marketing HQ decides what to build first, what to ignore, and which channel should wait until the foundation is ready.",
    currentAssetTitle: "Current Strategy Priority",
    cmoTitle: "Strategy recommendation",
    feedLabel: "Business update, result, constraint, or new priority",
    feedPlaceholder: "Paste what changed, what worked, what failed, your time/budget constraint, or the marketing decision you are considering.",
    nextHref: "/marketing-schedule",
    nextLabel: "Build Weekly Plan",
    nextOutput: "next 7 days + next 30 days",
  },
  marketing_schedule: {
    kind: "marketing_schedule",
    roleId: "marketing_schedule",
    assetType: "marketing_schedule",
    navName: "Execution HQ",
    title: "This week’s marketing plan.",
    promise: "Simple Marketing HQ turns strategy into a practical weekly rhythm for assets, content, follow-up, and review.",
    currentAssetTitle: "This Week’s Plan",
    cmoTitle: "Execution recommendation",
    feedLabel: "Weekly result, time constraint, or task update",
    feedPlaceholder: "Paste what got done, what did not, how much time you have this week, or a result from last week.",
    nextHref: "/content-engine",
    nextLabel: "Create This Week’s Content",
    nextOutput: "content assets + follow-up task",
  },
  research: {
    kind: "research",
    roleId: "research_hub",
    assetType: "research",
    navName: "Research HQ",
    title: "Current market intelligence library.",
    promise: "Simple Marketing HQ turns raw research into customer pains, objections, language patterns, content ideas, and offer improvements.",
    currentAssetTitle: "Current Market Insights",
    cmoTitle: "Research recommendation",
    feedLabel: "Review, competitor note, customer comment, or pasted research",
    feedPlaceholder: "Paste customer reviews, competitor copy, sales notes, Reddit/forum snippets, FAQs, objections, or market observations.",
    nextHref: "/message-builder",
    nextLabel: "Turn Into Messaging",
    nextOutput: "message angles + proof gaps",
  },
  recommendation: {
    kind: "recommendation",
    roleId: "buyer_messaging_engine",
    assetType: "recommendation",
    navName: "Tool Stack HQ",
    title: "Current tool and channel recommendation.",
    promise: "Simple Marketing HQ recommends outside tools only when the marketing foundation is ready enough to deploy.",
    currentAssetTitle: "Current Recommended Tools",
    cmoTitle: "Tool stack recommendation",
    feedLabel: "Tool idea, channel question, bottleneck, or deployment note",
    feedPlaceholder: "Paste a tool you are considering, a channel question, a bottleneck, or what you already have ready.",
    nextHref: "/strategy-map",
    nextLabel: "Review Launch Order",
    nextOutput: "readiness check + channel order",
  },
};

export function UtilityWorkflow({ kind }: { kind: UtilityKind }) {
  const config = configs[kind];
  const [result, setResult] = useState<LaunchPadResult | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [latestDiagnostic, setLatestDiagnostic] = useState<SavedDiagnosticSummary | null>(null);
  const [priorAssets, setPriorAssets] = useState<Partial<Record<MarketingAssetType, MarketingAssetSummary>>>({});
  const [history, setHistory] = useState<MarketingAssetSummary[]>([]);
  const [feedbackType, setFeedbackType] = useState("customer_note");
  const [feedback, setFeedback] = useState("");
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [status, setStatus] = useState("Load or select a Business / Client to tailor this utility.");
  const [copyStatus, setCopyStatus] = useState("");

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const context = useMemo<UtilityContext>(() => ({ result, business: selectedBusiness, latestDiagnostic, priorAssets }), [result, selectedBusiness, latestDiagnostic, priorAssets]);
  const currentRecommendation = deliverable ?? assetToDeliverable(history[0], config) ?? buildDeliverable(config, context, { feedbackType: "starting_recommendation", feedback: "" });
  const businessName = context.business?.name || result?.businessName || "Selected business";
  const assetTitle = `${businessName} ${config.navName}`;
  const scopedHref = (href: string) => (selectedBusinessId ? `${href}?businessId=${selectedBusinessId}` : href);

  const loadBusinessContext = useCallback(async (businessId: string) => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !businessId) return;

    const [diagnostics, assetGroups, utilityHistory] = await Promise.all([
      getSavedDiagnostics(supabase, businessId),
      Promise.all(assetTypes.map((assetType) => getMarketingAssets(supabase, businessId, assetType))),
      getMarketingAssets(supabase, businessId, config.assetType, config.roleId),
    ]);
    const latestAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>> = {};
    assetGroups.forEach((assets, index) => {
      if (assets[0]) latestAssets[assetTypes[index]] = assets[0];
    });
    setLatestDiagnostic(diagnostics[0] ?? null);
    setPriorAssets(latestAssets);
    setHistory(utilityHistory);
  }, [config.assetType, config.roleId]);

  useEffect(() => {
    async function loadContext() {
      setResult(getStoredResult());
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setStatus("Connect Supabase to load saved business context. You can still review the local diagnostic context.");
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setStatus("Log in to load saved business context and history.");
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
          setStatus("Create or select a Business / Client to tailor this utility.");
          return;
        }

        window.localStorage.setItem("simple-marketing-hq:selected-business-id", nextBusinessId);
        await loadBusinessContext(nextBusinessId);
        setStatus("Business context loaded.");
      } catch (error) {
        setStatus(`Could not load full context: ${(error as Error).message}`);
      }
    }

    void loadContext();
  }, [loadBusinessContext]);

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    setDeliverable(null);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);
    try {
      await loadBusinessContext(businessId);
      setStatus("Business context loaded.");
    } catch (error) {
      setStatus(`Could not switch context: ${(error as Error).message}`);
    }
  }

  function handleImprove(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setDeliverable(buildDeliverable(config, context, { feedbackType, feedback }));
    setStatus(feedback ? "Recommendation updated with the new information." : "Recommendation refreshed from saved context.");
  }

  async function copyCurrentAsset() {
    const text = currentRecommendation.copyPasteBlocks.map((block) => `${block.label}\n${block.value}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopyStatus("Copied.");
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={scopedHref("/dashboard")} className="text-sm font-semibold text-cyan-800">
            Back to Command Center
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{status}</span>
            <label className="relative">
              <span className="sr-only">Business / Client</span>
              <select
                value={selectedBusinessId}
                onChange={(event) => void handleBusinessChange(event.target.value)}
                className="min-h-11 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-sm font-semibold text-slate-800"
              >
                <option value="">Business: local diagnostic context</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    Business: {business.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-500" size={16} aria-hidden="true" />
            </label>
          </div>
        </div>

        <header className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{config.navName}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">{config.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{config.promise}</p>
        </header>

        <section className="mt-5 rounded-lg border border-cyan-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{config.currentAssetTitle}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{currentRecommendation.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{currentRecommendation.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void copyCurrentAsset()} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800">
                <Clipboard size={16} aria-hidden="true" />
                Copy
              </button>
              <button type="button" onClick={() => handleImprove()} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-900">
                <RefreshCw size={16} aria-hidden="true" />
                Improve
              </button>
              <button type="button" onClick={() => handleImprove()} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white">
                <Save size={16} aria-hidden="true" />
                Save / Approve
              </button>
            </div>
          </div>
          {copyStatus ? <p className="mt-3 text-sm font-semibold text-emerald-700">{copyStatus}</p> : null}

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {currentRecommendation.currentAsset.map((item) => (
              <InfoCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="mt-5 rounded-md bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-950">Best recommendation first</p>
            <p className="mt-2 whitespace-pre-line text-base leading-7 text-cyan-950">{currentRecommendation.copyPasteBlocks[0]?.value}</p>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{config.cmoTitle}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Based on what we know, here is what your marketing team recommends.</h2>
            <div className="mt-4 grid gap-3">
              <RecommendationRow label="What we recommend" value={currentRecommendation.cmoRecommendation.recommendation} />
              <RecommendationRow label="Why" value={currentRecommendation.cmoRecommendation.why} />
              <RecommendationRow label="Customer problem" value={currentRecommendation.cmoRecommendation.customerProblem} />
              <RecommendationRow label="Outcome to emphasize" value={currentRecommendation.cmoRecommendation.outcome} />
              <RecommendationRow label="Next action" value={currentRecommendation.cmoRecommendation.nextAction} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => handleImprove()} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white">
                <CheckCircle2 size={16} aria-hidden="true" />
                Use this direction
              </button>
              <button type="button" onClick={() => handleImprove()} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800">
                <Pencil size={16} aria-hidden="true" />
                This is not right
              </button>
            </div>
          </article>

          <form onSubmit={handleImprove} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Feed New Info</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Improve this with real-world information.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Add raw notes. Simple Marketing HQ will translate them into a better recommendation.</p>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">Information type</span>
              <select
                value={feedbackType}
                onChange={(event) => setFeedbackType(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
              >
                <option value="customer_note">Customer question or sales note</option>
                <option value="objection">Objection heard</option>
                <option value="review">Review or testimonial</option>
                <option value="campaign_result">Campaign result</option>
                <option value="competitor">Competitor example</option>
                <option value="new_offer">New service or offer detail</option>
                <option value="not_right">What feels off</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700">{config.feedLabel}</span>
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder={config.feedPlaceholder}
                className="mt-2 min-h-32 w-full rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              />
            </label>
            <button type="submit" className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              <Sparkles size={18} aria-hidden="true" />
              Analyze and Improve
            </button>
          </form>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <FlaskConical className="mt-1 text-cyan-800" size={22} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Test & Improve</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Small experiments to learn what works.</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {currentRecommendation.tests.map((test) => (
                <details key={test.title} className="rounded-md border border-slate-200 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-950">{test.title}</summary>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                    <p><strong>Where:</strong> {test.where}</p>
                    <p><strong>Measure:</strong> {test.measure}</p>
                    <p><strong>Working signal:</strong> {test.signal}</p>
                    <p><strong>Next move:</strong> {test.nextMove}</p>
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Use It Now</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Put this asset to work.</h2>
            <div className="mt-4 grid gap-2">
              {currentRecommendation.useItNow.map((item) => (
                <p key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} aria-hidden="true" />
                  {item}
                </p>
              ))}
            </div>
            <div className="mt-5 rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Next best move</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{currentRecommendation.actionSteps[0]}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Output created: {config.nextOutput}</p>
            </div>
            <Link href={scopedHref(currentRecommendation.suggestedNextUtility.href)} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              {currentRecommendation.suggestedNextUtility.label}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </article>
        </section>

        {deliverable ? (
          <AssetSavePanel
            roleId={config.roleId}
            assetType={config.assetType}
            title={assetTitle}
            summary={deliverable.summary}
            input={{
              feedbackType,
              feedback,
              business: context.business,
              latestDiagnostic: context.latestDiagnostic,
              launchpadResult: context.result,
              priorAssetTitles: Object.fromEntries(Object.entries(context.priorAssets).map(([key, asset]) => [key, asset?.title])),
            }}
            output={deliverable as unknown as Record<string, unknown>}
            prompt={{
              purpose: "Maintain a living marketing asset with current recommendation, CMO recommendation, feedback analysis, tests, use guidance, and one next action.",
              utility: config.navName,
              role_id: config.roleId,
              global_rules: [
                "The app recommends. The owner approves, corrects, or feeds new information.",
                "Compress raw business context into short customer-facing language before writing final copy.",
                "Put the best recommendation first, then copy/paste asset, why it works, where to use it, and one next action.",
              ],
            }}
          />
        ) : null}

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <History className="mt-1 text-cyan-800" size={22} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">History / Change Log</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Saved versions for this Business / Client.</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {history.length ? (
              history.map((asset) => (
                <details key={asset.id} className="rounded-md border border-slate-200 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-950">
                    {asset.title} <span className="font-normal text-slate-500">- {new Date(asset.updatedAt).toLocaleDateString()}</span>
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{asset.summary}</p>
                  <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-50">{JSON.stringify(asset.output, null, 2)}</pre>
                </details>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">No saved versions yet. Save the current recommendation when it is ready to become part of this business’s marketing history.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function buildDeliverable(config: UtilityConfig, context: UtilityContext, input: { feedbackType: string; feedback: string }): Deliverable {
  const industry = getIndustryProfile(context.result?.answers.industryCategory);
  const businessName = context.business?.name || context.result?.businessName || "the business";
  const offer = compressPhrase(context.priorAssets.offer?.summary || context.result?.answers.whatSelling || context.business?.services || "the core offer");
  const target = compressPhrase(context.priorAssets.icp?.summary || context.result?.answers.targetCustomer || context.business?.idealCustomer || "best-fit customers");
  const problem = compressPhrase(input.feedback || context.result?.answers.urgentProblem || context.result?.answers.marketingFrustration || context.result?.biggestBottleneck || "the problem creating hesitation");
  const outcome = compressPhrase(context.result?.customerDesiredOutcome || inferCustomerWant(problem, target));
  const bottleneck = compressPhrase(context.latestDiagnostic?.biggestBottleneck || context.result?.biggestBottleneck || "unclear marketing priority");
  const nextMove = compressPhrase(context.latestDiagnostic?.nextMove || context.result?.nextMove || "build one clear foundation asset");
  const proof = compressPhrase(context.result?.answers.trustFactor || industry.proof);
  const channel = compressPhrase(context.result?.recommendedFirstChannel || industry.channels[0]);
  const currentAsset = buildCurrentAsset(config.kind, { businessName, offer, target, problem, outcome, bottleneck, nextMove, proof, channel });
  const primaryAsset = currentAsset[0]?.value ?? `${businessName} helps ${target} solve ${problem}.`;
  const action = buildNextAction(config, { nextMove, channel, outcome });

  return {
    title: `${config.navName} for ${businessName}`,
    summary: input.feedback
      ? `Updated with ${input.feedbackType.replaceAll("_", " ")}: ${compressPhrase(input.feedback)}`
      : `Current recommendation based on saved business context, latest diagnostic, website analysis, and saved assets.`,
    currentAsset,
    cmoRecommendation: {
      recommendation: primaryAsset,
      why: buildWhy(config.kind, { problem, outcome, bottleneck, channel }),
      customerProblem: problem,
      outcome,
      nextAction: action,
      confidence: context.latestDiagnostic || context.priorAssets[config.assetType] ? "Good starting confidence" : "Starting recommendation. Add one real customer note to improve it.",
    },
    copyPasteBlocks: buildCopyBlocks(config.kind, { businessName, offer, target, problem, outcome, proof, channel }),
    whyThisWorks: buildWhy(config.kind, { problem, outcome, bottleneck, channel }),
    tests: buildTests(config.kind, { problem, outcome, channel }),
    useItNow: buildUseItNow(config.kind),
    actionSteps: [
      action,
      `Use the current asset in ${buildUseItNow(config.kind)[0].toLowerCase()}.`,
      "Feed one real customer signal back into this page after you use it.",
    ],
    changeSummary: input.feedback ? `The recommendation was updated around this new signal: ${compressPhrase(input.feedback)}` : "Starting recommendation generated from the current business context.",
    suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
  };
}

function assetToDeliverable(asset: MarketingAssetSummary | undefined, config: UtilityConfig): Deliverable | null {
  if (!asset) return null;
  const output = asset.output as Partial<Deliverable>;
  if (Array.isArray(output.currentAsset) && output.cmoRecommendation && Array.isArray(output.copyPasteBlocks)) {
    return {
      title: output.title ?? asset.title,
      summary: output.summary ?? asset.summary,
      currentAsset: output.currentAsset,
      cmoRecommendation: output.cmoRecommendation,
      copyPasteBlocks: output.copyPasteBlocks,
      whyThisWorks: output.whyThisWorks ?? "This is the latest saved recommendation for this business.",
      tests: output.tests ?? [],
      useItNow: output.useItNow ?? [],
      actionSteps: output.actionSteps ?? ["Use the latest saved asset and feed new information after you test it."],
      changeSummary: output.changeSummary ?? asset.summary,
      suggestedNextUtility: output.suggestedNextUtility ?? { label: config.nextLabel, href: config.nextHref },
    };
  }
  return null;
}

function buildCurrentAsset(kind: UtilityKind, input: Record<string, string>) {
  const { businessName, offer, target, problem, outcome, bottleneck, nextMove, proof, channel } = input;
  switch (kind) {
    case "icp":
      return [
        { label: "Best-fit customer", value: `${target} with an urgent reason to solve ${problem}` },
        { label: "Buying trigger", value: problem },
        { label: "Need to believe", value: `${businessName} can help them get ${outcome} with less risk.` },
        { label: "Poor fit", value: "Low urgency, unclear budget, no decision authority, or no trust in the process." },
      ];
    case "offer":
      return [
        { label: "Offer statement", value: `${businessName} helps ${target} get ${outcome} by solving ${problem}.` },
        { label: "Primary CTA", value: "Get the recommended next step." },
        { label: "Proof point", value: proof },
        { label: "Current angle", value: `Make ${problem} feel solvable and worth acting on now.` },
      ];
    case "message":
      return [
        { label: "Headline", value: `${businessName} helps ${target} fix ${problem}.` },
        { label: "Subheadline", value: `Get ${outcome} with a clearer first step and less guessing.` },
        { label: "CTA", value: "Find the gap." },
        { label: "Follow-up opener", value: `The reason I am reaching out is that ${problem} can quietly cost more when it is ignored.` },
      ];
    case "content":
      return [
        { label: "Active theme", value: `The hidden cost of ${problem}` },
        { label: "This week’s content", value: `Show ${target} the first sign that ${problem} needs attention.` },
        { label: "Hook", value: `${problem} is not always the real issue. Waiting too long is.` },
        { label: "CTA", value: "Reply with “next step” and we’ll point you to the first fix." },
      ];
    case "strategy_map":
      return [
        { label: "Do first", value: nextMove },
        { label: "Current bottleneck", value: bottleneck },
        { label: "Ignore for now", value: "More channel activity before offer, message, CTA, proof, and follow-up are ready." },
        { label: "Channel order", value: `Prepare foundation first, then deploy through ${channel}.` },
      ];
    case "marketing_schedule":
      return [
        { label: "Top priority", value: nextMove },
        { label: "Tasks this week", value: "Sharpen one asset, publish one useful message, follow up, review replies." },
        { label: "Content to create", value: `One proof-backed post about ${problem}.` },
        { label: "Skip", value: "Adding a new channel before the current foundation asset is ready." },
      ];
    case "research":
      return [
        { label: "Market insight", value: `${target} need language, proof, and a safe next step around ${problem}.` },
        { label: "Objection to study", value: "Will this be worth the time, money, and change?" },
        { label: "Proof gap", value: proof },
        { label: "Research theme", value: `What ${target} already tried before looking for ${offer}.` },
      ];
    case "recommendation":
      return [
        { label: "Recommended tool/channel", value: channel },
        { label: "Why now / why not yet", value: `Use it after ${offer}, message, proof, CTA, and follow-up are ready.` },
        { label: "Tool category", value: "External deployment channel, not the foundation itself." },
        { label: "Readiness check", value: nextMove },
      ];
  }
}

function buildCopyBlocks(kind: UtilityKind, input: Record<string, string>) {
  const { businessName, offer, target, problem, outcome, proof, channel } = input;
  switch (kind) {
    case "icp":
      return [
        { label: "Audience statement", value: `${businessName} should focus on ${target} who need ${outcome} because ${problem}.` },
        { label: "Bad-fit filter", value: "Do not build campaigns around buyers without urgency, budget, authority, or trust." },
      ];
    case "offer":
      return [
        { label: "Offer statement", value: `${businessName} helps ${target} get ${outcome} by solving ${problem}.` },
        { label: "CTA", value: "Get the recommended next step." },
      ];
    case "message":
      return [
        { label: "Homepage message", value: `${businessName} helps ${target} fix ${problem} so they can get ${outcome} without guessing what to do next.` },
        { label: "Short pitch", value: `We help ${target} identify the gap, choose the next move, and move toward ${outcome}.` },
      ];
    case "content":
      return [
        { label: "Post hook", value: `${problem} is not always the real issue. The expensive part is waiting too long to fix the first gap.` },
        { label: "Email opener", value: `If ${problem} keeps showing up, the next step is not more noise. It is a clearer first decision.` },
      ];
    case "strategy_map":
      return [
        { label: "Strategy priority", value: `First, fix ${problem}. Then prepare ${channel} after the offer, message, proof, and follow-up are ready.` },
        { label: "What to ignore", value: "Ignore extra tools and channels until the next foundation asset is ready." },
      ];
    case "marketing_schedule":
      return [
        { label: "This week’s plan", value: `Priority: fix ${problem}\nCreate: one proof-backed message\nFollow up: send one useful next step\nReview: replies, objections, and leads.` },
      ];
    case "research":
      return [
        { label: "Research brief", value: `Find out what ${target} believe about ${problem}, what they already tried, and what proof they need before choosing ${offer}.` },
        { label: "Proof question", value: `What would make ${target} believe ${businessName} can help them get ${outcome}?` },
      ];
    case "recommendation":
      return [
        { label: "Tool recommendation", value: `Based on the current foundation, consider ${channel} only after the offer, message, proof, CTA, and follow-up are ready.` },
        { label: "Readiness reminder", value: `Prepare the rocket ship before takeoff: ${proof}, clear message, and one next step.` },
      ];
  }
}

function buildWhy(kind: UtilityKind, input: Record<string, string>) {
  const { problem, outcome, bottleneck, channel } = input;
  const base = `This keeps the business focused on ${problem} and ${outcome} instead of asking the owner to invent a marketing strategy from scratch.`;
  if (kind === "strategy_map" || kind === "recommendation") return `${base} It also prevents premature channel deployment through ${channel}.`;
  if (kind === "marketing_schedule") return `${base} The work becomes a repeatable weekly rhythm instead of scattered tasks.`;
  if (kind === "research") return `${base} Raw notes become market intelligence that improves offer, message, and content decisions.`;
  return `${base} It addresses the current bottleneck: ${bottleneck}.`;
}

function buildNextAction(config: UtilityConfig, input: Record<string, string>) {
  if (config.kind === "offer") return "Use this offer as the source for Messaging HQ.";
  if (config.kind === "message") return "Turn this message into two content assets in Content HQ.";
  if (config.kind === "icp") return "Use this audience recommendation to sharpen the offer.";
  if (config.kind === "content") return "Choose one hook and schedule it this week.";
  if (config.kind === "strategy_map") return "Turn the priority into this week’s execution plan.";
  if (config.kind === "marketing_schedule") return "Complete the first task and add the result back here.";
  if (config.kind === "research") return "Turn the strongest insight into a message angle.";
  return `Review readiness before deploying through ${input.channel}.`;
}

function buildTests(kind: UtilityKind, input: Record<string, string>) {
  const { problem, outcome, channel } = input;
  const defaultWhere = kind === "content" ? channel : "homepage, email, sales follow-up, or next campaign";
  const testName = {
    icp: "Best-fit buyer test",
    offer: "Offer angle test",
    message: "Headline and CTA test",
    content: "Content angle test",
    strategy_map: "Priority order test",
    marketing_schedule: "Weekly rhythm test",
    research: "Customer language test",
    recommendation: "Channel readiness test",
  }[kind];
  return [
    {
      title: testName,
      where: defaultWhere,
      measure: "Replies, booked calls, form starts, qualified conversations, or clear customer feedback.",
      signal: `People recognize ${problem} and move toward ${outcome} with less explanation.`,
      nextMove: "Keep the winning angle, feed the result back into Simple Marketing HQ, and improve the current asset.",
    },
  ];
}

function buildUseItNow(kind: UtilityKind) {
  switch (kind) {
    case "icp":
      return ["Offer Builder", "ad targeting notes", "landing page audience section", "sales qualification", "content topics"];
    case "offer":
      return ["homepage hero", "landing page opener", "sales follow-up", "ad hook", "email subject line"];
    case "message":
      return ["homepage headline", "landing page section", "email opener", "short-form post", "sales script"];
    case "content":
      return ["LinkedIn or Facebook post", "email list", "short video script", "website blog", "sales enablement"];
    case "strategy_map":
      return ["weekly planning", "owner decision-making", "agency/client review", "campaign prep", "team handoff"];
    case "marketing_schedule":
      return ["weekly calendar", "content tasks", "follow-up block", "review meeting", "campaign prep"];
    case "research":
      return ["Message Builder", "Offer Builder", "Content Engine", "FAQ section", "sales scripts"];
    case "recommendation":
      return ["tool selection", "channel planning", "partner recommendation", "budget discussion", "launch readiness review"];
  }
}

function inferCustomerWant(problem: string, target: string) {
  const normalized = problem.toLowerCase();
  if (normalized.includes("lead") || normalized.includes("call") || normalized.includes("book")) return "more qualified conversations and booked calls";
  if (normalized.includes("time") || normalized.includes("busy") || normalized.includes("fast")) return "a faster answer and less wasted time";
  if (normalized.includes("cost") || normalized.includes("expensive") || normalized.includes("price")) return "confidence before spending money";
  if (normalized.includes("trust") || normalized.includes("risk")) return "a provider they can trust";
  if (normalized.includes("confus") || normalized.includes("not sure") || normalized.includes("options")) return "clarity on the right next step";
  if (normalized.includes("urgent") || normalized.includes("deadline") || normalized.includes("emergency")) return "the problem handled quickly and correctly";
  return `${target} want a clear answer, less risk, and a next step they can trust`;
}

function compressPhrase(value: string) {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/small business ranging from/gi, "")
    .replace(/with license requirements and website and marketing agencies that maintain their websites/gi, "and agencies")
    .trim();
  if (cleaned.length <= 140) return cleaned;
  const sentence = cleaned.split(/[.!?]/)[0]?.trim();
  return sentence && sentence.length <= 140 ? sentence : `${cleaned.slice(0, 137).trim()}...`;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-900">{value}</p>
    </article>
  );
}

function RecommendationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}
