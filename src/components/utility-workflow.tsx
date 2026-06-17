"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { ArrowRight, ChevronDown, FlaskConical, History, Lightbulb, Mail, MessageSquare, Sparkles, Target, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { getIndustryProfile, getStoredResult, type LaunchPadResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getMarketingAssets, saveMarketingAsset, type MarketingAssetSummary, type MarketingAssetType } from "@/lib/supabase/assets";
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

type WorkBlockId = string;

type WorkBlock = {
  id: WorkBlockId;
  title: string;
  subtitle: string;
  purpose: string;
  assetType: string;
  intentExamples: string[];
  outputRules: string[];
  icon: "spark" | "target" | "message" | "mail" | "video" | "test" | "history" | "idea";
};

type QuickPrompt = {
  label: string;
  prompt: string;
  workBlockId: WorkBlockId;
};

type DetailView = "asset" | "history" | "tests" | "feed" | null;

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
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeBlock, setActiveBlock] = useState<WorkBlockId>(() => firstWorkBlockId(kind));
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [sessionMessages, setSessionMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([]);
  const [sessionInput, setSessionInput] = useState("");

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const context = useMemo<UtilityContext>(() => ({ result, business: selectedBusiness, latestDiagnostic, priorAssets }), [result, selectedBusiness, latestDiagnostic, priorAssets]);
  const currentRecommendation = deliverable ?? assetToDeliverable(history[0], config) ?? buildDeliverable(config, context, { feedbackType: "starting_recommendation", feedback: "" });
  const businessName = context.business?.name || result?.businessName || "Selected business";
  const assetTitle = `${businessName} ${config.navName}`;
  const scopedHref = (href: string) => (selectedBusinessId ? `${href}?businessId=${selectedBusinessId}` : href);
  const workBlocks = useMemo(() => getWorkBlocks(config.kind), [config.kind]);
  const activeWorkBlock = workBlocks.find((block) => block.id === activeBlock) ?? workBlocks[0];

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

  async function handleSaveCurrentAsset() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !selectedBusinessId) {
      setSaveStatus("Log in and select a Business / Client before saving.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setSaveStatus("Log in before saving this output.");
      return;
    }

    setIsSaving(true);
    setSaveStatus("Saving...");
    try {
      await saveMarketingAsset(supabase, data.user, {
        businessId: selectedBusinessId,
        roleId: config.roleId,
        assetType: config.assetType,
        title: assetTitle,
        summary: currentRecommendation.summary,
        input: {
          feedbackType,
          feedback,
          activeBlock,
          business: context.business,
          latestDiagnostic: context.latestDiagnostic,
        },
        output: currentRecommendation as unknown as Record<string, unknown>,
        prompt: {
          purpose: "Save the current living utility recommendation and selected workspace state.",
          utility: config.navName,
          activeBlock,
          workBlockSlug: activeBlock,
          workBlockAssetType: activeWorkBlock.assetType,
        },
      });
      await loadBusinessContext(selectedBusinessId);
      setSaveStatus("Saved to this Business / Client history.");
    } catch (error) {
      setSaveStatus(`Could not save: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }

  function handleQuickPrompt(prompt: string, workBlockId?: WorkBlockId) {
    const routedBlock = workBlockId ? getWorkBlock(config.kind, workBlockId) : getRoutedWorkBlock(config.kind, prompt, activeWorkBlock.id);
    setActiveBlock(routedBlock.id);
    const response = workBlockId ? buildWorkBlockAsset(config.kind, routedBlock.id, currentRecommendation) : buildSessionResponse(config, routedBlock, currentRecommendation, prompt);
    setSessionMessages((messages) => [...messages, { role: "user", content: prompt }, { role: "assistant", content: response }]);
  }

  function openWorkBlock(blockId: WorkBlockId) {
    setActiveBlock(blockId);
    setWorkspaceOpen(true);
    setDetailView(null);
    const params = new URLSearchParams(window.location.search);
    params.set("block", blockId.replaceAll("_", "-"));
    window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function closeWorkspace() {
    setWorkspaceOpen(false);
    setDetailView(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("block");
    const query = params.toString();
    window.history.pushState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }

  function handleSessionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = sessionInput.trim();
    if (!prompt) return;
    handleQuickPrompt(prompt);
    setSessionInput("");
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

        {workspaceOpen ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button type="button" onClick={closeWorkspace} className="text-sm font-semibold text-cyan-800">
                  {config.navName} / {activeWorkBlock.title}
                </button>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">{activeWorkBlock.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Working on {config.navName.replace(" HQ", "")} + {activeWorkBlock.title}. The AI session is using the selected Business / Client, latest diagnostic, and saved asset history.
                </p>
              </div>
              <button type="button" onClick={closeWorkspace} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800">
                Back to tiles
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setDetailView(detailView === "asset" ? null : "asset")} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                Show current asset
              </button>
              <button type="button" onClick={() => void handleSaveCurrentAsset()} disabled={isSaving} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-50">
                {isSaving ? "Saving..." : "Save version"}
              </button>
              <button type="button" onClick={() => setDetailView(detailView === "history" ? null : "history")} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                View history
              </button>
              <button type="button" onClick={() => setDetailView(detailView === "tests" ? null : "tests")} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                Tests
              </button>
              <button type="button" onClick={() => setDetailView(detailView === "feed" ? null : "feed")} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                New info
              </button>
              <button type="button" onClick={() => void copyCurrentAsset()} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                Copy output
              </button>
            </div>
            {copyStatus || saveStatus ? <p className="mt-3 text-sm font-semibold text-emerald-700">{copyStatus || saveStatus}</p> : null}

            {detailView ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                {renderWorkBlock({
                  activeBlock: detailView === "asset" ? activeBlock : detailView === "history" ? "history" : detailView === "tests" ? "tests" : "feed",
                  config,
                  currentRecommendation,
                  feedback,
                  feedbackType,
                  history,
                  scopedHref,
                  setFeedback,
                  setFeedbackType,
                  onImprove: handleImprove,
                })}
              </div>
            ) : null}

            <article className="mt-5 rounded-lg border border-cyan-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI Working Session</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ask AI</h2>
              <div className="mt-4 grid gap-3">
                {sessionMessages.map((message, index) => (
                  <ChatBubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {getQuickPrompts(config.kind, activeBlock).map((quickPrompt) => (
                  <button key={quickPrompt.label} type="button" onClick={() => handleQuickPrompt(quickPrompt.prompt, quickPrompt.workBlockId)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                    {quickPrompt.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSessionSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={sessionInput}
                  onChange={(event) => setSessionInput(event.target.value)}
                  placeholder="Ask AI..."
                  className="min-h-12 flex-1 rounded-md border border-slate-300 px-4 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                />
                <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 font-semibold text-white">
                  Ask
                </button>
              </form>
            </article>
          </section>
        ) : (
          <>
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Work blocks</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {workBlocks.map((block) => {
              const active = block.id === activeBlock;
              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => openWorkBlock(block.id)}
                  className={`min-h-24 rounded-lg border p-3 text-left transition ${
                    active ? "border-cyan-800 bg-cyan-50 shadow-sm" : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50"
                  }`}
                >
                  <span className={`grid size-9 place-items-center rounded-md ${active ? "bg-cyan-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <WorkBlockIcon icon={block.icon} />
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-slate-950">{block.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{block.subtitle}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI Working Session</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ask AI</h2>
            <div className="mt-4 grid gap-3">
              {sessionMessages.map((message, index) => (
                <ChatBubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {getQuickPrompts(config.kind, activeBlock).map((quickPrompt) => (
                <button key={quickPrompt.label} type="button" onClick={() => handleQuickPrompt(quickPrompt.prompt, quickPrompt.workBlockId)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                  {quickPrompt.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSessionSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={sessionInput}
                onChange={(event) => setSessionInput(event.target.value)}
                placeholder="Ask AI..."
                className="min-h-12 flex-1 rounded-md border border-slate-300 px-4 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              />
              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 font-semibold text-white">
                Ask
              </button>
            </form>
          </article>
        </section>
          </>
        )}
      </section>
    </main>
  );
}

const defaultOutputRules = [
  "Return the asset only.",
  "Use 3-7 bullets or 1-3 short paragraphs.",
  "Do not include wrapper intros.",
  "Do not include why it matters unless asked.",
  "Do not include next action unless asked.",
];

function createWorkBlock(input: Omit<WorkBlock, "outputRules"> & { outputRules?: string[] }): WorkBlock {
  return {
    ...input,
    outputRules: input.outputRules ?? defaultOutputRules,
  };
}

const utilityWorkBlockRegistry: Record<UtilityKind, WorkBlock[]> = {
  icp: [
    createWorkBlock({ id: "best-fit-customer", title: "Best-Fit Customer", subtitle: "Who to focus on.", purpose: "Define who the business should focus on.", assetType: "audience_profile", intentExamples: ["who is the best-fit customer", "who should we target", "ideal customer"], icon: "target" }),
    createWorkBlock({ id: "buyer-problems", title: "Buyer Problems", subtitle: "What they struggle with.", purpose: "Define what the customer is struggling with.", assetType: "pain_points", intentExamples: ["what pain matters most", "what problem do they have", "what are they struggling with"], icon: "idea" }),
    createWorkBlock({ id: "buying-triggers", title: "Buying Triggers", subtitle: "Why they buy now.", purpose: "Define why they would buy now.", assetType: "buying_triggers", intentExamples: ["why would they buy now", "why do they buy now", "buying triggers"], icon: "spark" }),
    createWorkBlock({ id: "objections", title: "Objections", subtitle: "What slows yes.", purpose: "Define what slows the buying decision.", assetType: "objections", intentExamples: ["what objections", "what slows them down", "hesitations"], icon: "message" }),
    createWorkBlock({ id: "where-to-find-them", title: "Where To Find Them", subtitle: "Practical channels.", purpose: "Define practical acquisition channels.", assetType: "channels", intentExamples: ["where do i find them", "where to find them", "channels"], icon: "target" }),
    createWorkBlock({ id: "feed", title: "New Info", subtitle: "Add customer notes.", purpose: "Add customer notes, objections, sales calls, reviews, or market feedback.", assetType: "audience_feedback", intentExamples: ["new info", "add note", "customer note"], icon: "spark" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Apply the audience.", purpose: "Turn the audience asset into practical outputs.", assetType: "audience_activation", intentExamples: ["what should i do next", "use it now", "turn this into"], icon: "idea" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "audience_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
  offer: [
    createWorkBlock({ id: "core-offer", title: "Core Offer", subtitle: "Plain-English offer.", purpose: "State what the business sells in plain English.", assetType: "core_offer", intentExamples: ["what do we sell", "core offer", "what is the offer"], icon: "spark" }),
    createWorkBlock({ id: "primary-promise", title: "Primary Promise", subtitle: "Result customers want.", purpose: "State the result the customer wants.", assetType: "primary_promise", intentExamples: ["what is the promise", "main promise", "result"], icon: "idea" }),
    createWorkBlock({ id: "offer-statement", title: "Offer Statement", subtitle: "One-sentence offer.", purpose: "Create a one-sentence version of the offer.", assetType: "offer_statement", intentExamples: ["write the offer statement", "offer statement", "one sentence offer"], icon: "message" }),
    createWorkBlock({ id: "proof", title: "Proof", subtitle: "Trust points.", purpose: "List trust points, outcomes, examples, testimonials, or credentials.", assetType: "proof_points", intentExamples: ["what proof", "proof should we use", "trust"], icon: "target" }),
    createWorkBlock({ id: "cta", title: "CTA", subtitle: "Clear next step.", purpose: "Write the clearest next step.", assetType: "cta", intentExamples: ["what cta", "button", "next step copy"], icon: "message" }),
    createWorkBlock({ id: "packages-pricing", title: "Packages / Pricing", subtitle: "Simple structure.", purpose: "Create a simple offer structure if relevant.", assetType: "packages_pricing", intentExamples: ["package", "pricing", "structure"], icon: "target" }),
    createWorkBlock({ id: "risk-reversal", title: "Risk Reversal", subtitle: "Confidence builder.", purpose: "Create a guarantee, trial, pilot, setup promise, or confidence builder.", assetType: "risk_reversal", intentExamples: ["risk reversal", "guarantee", "trial", "confidence"], icon: "idea" }),
    createWorkBlock({ id: "feed", title: "New Info", subtitle: "Add offer notes.", purpose: "Add buyer feedback, proof, objections, or offer notes.", assetType: "offer_feedback", intentExamples: ["new info", "offer note"], icon: "spark" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Apply the offer.", purpose: "Turn the offer into homepage, email, ad, or sales copy.", assetType: "offer_activation", intentExamples: ["what should i do next", "use it now", "homepage copy", "sales copy"], icon: "spark" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "offer_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
  message: [
    createWorkBlock({ id: "one-liner", title: "One-Liner", subtitle: "Simple explanation.", purpose: "Create the simplest explanation of the business.", assetType: "one_liner", intentExamples: ["one-liner", "explain this simply", "simple explanation"], icon: "message" }),
    createWorkBlock({ id: "homepage-headline", title: "Homepage Headline", subtitle: "Hero copy.", purpose: "Write a clear headline and subheadline.", assetType: "homepage_headline", intentExamples: ["headline", "homepage headline", "hero"], icon: "spark" }),
    createWorkBlock({ id: "differentiators", title: "Differentiators", subtitle: "What makes it different.", purpose: "State what makes this business different.", assetType: "differentiators", intentExamples: ["what makes us different", "differentiators", "different"], icon: "idea" }),
    createWorkBlock({ id: "proof-points", title: "Proof Points", subtitle: "Trust claims.", purpose: "Write short trust-building claims.", assetType: "message_proof_points", intentExamples: ["proof points", "trust claims", "proof"], icon: "target" }),
    createWorkBlock({ id: "cta-copy", title: "CTA Copy", subtitle: "Button language.", purpose: "Write button text and supporting CTA language.", assetType: "cta_copy", intentExamples: ["button", "cta copy", "what should the button say"], icon: "target" }),
    createWorkBlock({ id: "faq-objection-copy", title: "FAQ / Objection Copy", subtitle: "Hesitation answers.", purpose: "Answer common hesitation points.", assetType: "faq_objection_copy", intentExamples: ["objection faq", "faq", "hesitation", "objections"], icon: "mail" }),
    createWorkBlock({ id: "before-after", title: "Before / After", subtitle: "Simple contrast.", purpose: "Show life before and after the product.", assetType: "before_after", intentExamples: ["before after", "before and after"], icon: "video" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Create copy.", purpose: "Create website section, email, ad, or social copy.", assetType: "message_activation", intentExamples: ["use it now", "write copy", "create copy"], icon: "spark" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "message_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
  content: [
    createWorkBlock({ id: "content-pillars", title: "Content Pillars", subtitle: "Main topics.", purpose: "List main topics the business should talk about.", assetType: "content_pillars", intentExamples: ["content pillars", "topics", "talk about"], icon: "target" }),
    createWorkBlock({ id: "post-ideas", title: "Post Ideas", subtitle: "Ready topics.", purpose: "Create simple content ideas based on the offer and audience.", assetType: "post_ideas", intentExamples: ["what should i post", "post ideas", "social post"], icon: "message" }),
    createWorkBlock({ id: "weekly-plan", title: "Weekly Plan", subtitle: "What to publish.", purpose: "Create a practical schedule.", assetType: "weekly_content_plan", intentExamples: ["this week", "weekly plan", "publish this week"], icon: "spark" }),
    createWorkBlock({ id: "email-ideas", title: "Email Ideas", subtitle: "Useful email topics.", purpose: "Create useful email topics or a short email.", assetType: "email_ideas", intentExamples: ["write an email", "email ideas", "subject lines"], icon: "mail" }),
    createWorkBlock({ id: "blog-seo-ideas", title: "Blog / SEO Ideas", subtitle: "Search topics.", purpose: "Create search-friendly topics.", assetType: "blog_seo_ideas", intentExamples: ["blog", "seo", "search topics"], icon: "idea" }),
    createWorkBlock({ id: "repurpose", title: "Repurpose", subtitle: "More formats.", purpose: "Turn one idea into multiple formats.", assetType: "repurposed_content", intentExamples: ["repurpose", "turn this into", "multiple formats"], icon: "video" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Draft content.", purpose: "Generate a post, email, short video script, checklist, or calendar.", assetType: "content_activation", intentExamples: ["create", "draft", "use it now"], icon: "spark" }),
    createWorkBlock({ id: "feed", title: "Campaign Results", subtitle: "Add results.", purpose: "Add content results, questions, or campaign notes.", assetType: "content_feedback", intentExamples: ["campaign result", "new info", "worked"], icon: "target" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "content_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
  strategy_map: [
    createWorkBlock({ id: "current-bottleneck", title: "Current Bottleneck", subtitle: "What is stuck.", purpose: "State what is most likely holding growth back.", assetType: "current_bottleneck", intentExamples: ["bottleneck", "what is stuck", "holding growth back"], icon: "target" }),
    createWorkBlock({ id: "growth-focus", title: "Growth Focus", subtitle: "Main priority.", purpose: "State the main priority right now.", assetType: "growth_focus", intentExamples: ["focus", "what should we focus", "priority"], icon: "spark" }),
    createWorkBlock({ id: "channel-priority", title: "Channel Priority", subtitle: "First channel.", purpose: "State which channel should matter first and why.", assetType: "channel_priority", intentExamples: ["channel", "prioritize", "use first"], icon: "message" }),
    createWorkBlock({ id: "funnel-map", title: "Funnel Map", subtitle: "Simple path.", purpose: "Map the simple path from attention to lead to sale.", assetType: "simple_funnel_map", intentExamples: ["funnel", "path", "lead to sale"], icon: "idea" }),
    createWorkBlock({ id: "90-day-plan", title: "90-Day Plan", subtitle: "Realistic plan.", purpose: "Create a short, realistic action plan.", assetType: "ninety_day_plan", intentExamples: ["90-day", "plan", "what is the plan"], icon: "spark" }),
    createWorkBlock({ id: "positioning", title: "Positioning", subtitle: "Market place.", purpose: "State where the business should sit in the market.", assetType: "positioning", intentExamples: ["positioning", "sit in the market", "market"], icon: "target" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Owner actions.", purpose: "Turn strategy into owner actions.", assetType: "strategy_activation", intentExamples: ["what should i do next", "actions", "use it now"], icon: "spark" }),
    createWorkBlock({ id: "feed", title: "New Info", subtitle: "Add updates.", purpose: "Add business updates, results, constraints, or priorities.", assetType: "strategy_feedback", intentExamples: ["new info", "update", "constraint"], icon: "idea" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "strategy_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
  marketing_schedule: [
    createWorkBlock({ id: "weekly-actions", title: "Weekly Actions", subtitle: "Current action list.", purpose: "List the current action list.", assetType: "weekly_actions", intentExamples: ["what should i do this week", "weekly actions", "plan this week"], icon: "spark" }),
    createWorkBlock({ id: "task-checklist", title: "Task Checklist", subtitle: "Steps to complete.", purpose: "Create a simple step-by-step checklist.", assetType: "task_checklist", intentExamples: ["checklist", "steps", "task"], icon: "target" }),
    createWorkBlock({ id: "campaign-plan", title: "Campaign Plan", subtitle: "Launch order.", purpose: "State what to launch and in what order.", assetType: "campaign_plan", intentExamples: ["campaign", "launch", "what campaign"], icon: "message" }),
    createWorkBlock({ id: "follow-up-process", title: "Follow-Up Process", subtitle: "Handle leads.", purpose: "State how leads should be handled.", assetType: "follow_up_process", intentExamples: ["follow up", "leads handled", "lead follow-up"], icon: "mail" }),
    createWorkBlock({ id: "calendar", title: "Calendar", subtitle: "Simple schedule.", purpose: "Create a simple execution schedule.", assetType: "execution_calendar", intentExamples: ["calendar", "schedule"], icon: "idea" }),
    createWorkBlock({ id: "progress-check-in", title: "Progress Check-In", subtitle: "What changed.", purpose: "Identify what changed, what is stuck, and what to do next.", assetType: "progress_check_in", intentExamples: ["progress", "check in", "what changed"], icon: "spark" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Complete tasks.", purpose: "Create tasks the owner can complete.", assetType: "execution_activation", intentExamples: ["what should i do next", "use it now", "actions"], icon: "spark" }),
    createWorkBlock({ id: "feed", title: "Adjust Plan", subtitle: "Add updates.", purpose: "Add weekly results, constraints, or task updates.", assetType: "execution_feedback", intentExamples: ["adjust", "new info", "update"], icon: "idea" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "execution_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
  research: [
    createWorkBlock({ id: "website-findings", title: "Website Findings", subtitle: "Site message.", purpose: "State what the site currently communicates.", assetType: "website_findings", intentExamples: ["website", "what does the site say", "site communicates"], icon: "target" }),
    createWorkBlock({ id: "competitor-notes", title: "Competitor Notes", subtitle: "What others say.", purpose: "State what competitors are saying or doing.", assetType: "competitor_notes", intentExamples: ["competitors", "competitor notes", "what are competitors doing"], icon: "message" }),
    createWorkBlock({ id: "market-patterns", title: "Market Patterns", subtitle: "Category norms.", purpose: "Capture common language, offers, and expectations in the category.", assetType: "market_patterns", intentExamples: ["market patterns", "category", "expectations"], icon: "idea" }),
    createWorkBlock({ id: "customer-language", title: "Customer Language", subtitle: "Words to use.", purpose: "Capture words customers likely use.", assetType: "customer_language", intentExamples: ["customer language", "what language", "words"], icon: "mail" }),
    createWorkBlock({ id: "content-search-signals", title: "Content / Search Signals", subtitle: "Questions people ask.", purpose: "List topics and questions people care about.", assetType: "content_search_signals", intentExamples: ["search", "questions", "topics"], icon: "spark" }),
    createWorkBlock({ id: "gaps", title: "Gaps", subtitle: "What is missing.", purpose: "State what the business is missing.", assetType: "research_gaps", intentExamples: ["gaps", "missing", "what gaps"], icon: "target" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Apply research.", purpose: "Turn research into copy, offers, content, or positioning.", assetType: "research_activation", intentExamples: ["use it now", "turn research into", "apply"], icon: "spark" }),
    createWorkBlock({ id: "feed", title: "Reviews / Notes", subtitle: "Paste research.", purpose: "Add reviews, competitor notes, customer comments, or market observations.", assetType: "research_feedback", intentExamples: ["new info", "review", "notes"], icon: "spark" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "research_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
  recommendation: [
    createWorkBlock({ id: "current-tools", title: "Current Tools", subtitle: "What exists now.", purpose: "State what the business appears to use or has mentioned.", assetType: "current_tools", intentExamples: ["current tools", "what do we use", "existing tools"], icon: "spark" }),
    createWorkBlock({ id: "recommended-tools", title: "Recommended Tools", subtitle: "Best fit now.", purpose: "Recommend tools that fit the next action.", assetType: "recommended_tools", intentExamples: ["what tools should i use", "recommended tools", "which tool"], icon: "target" }),
    createWorkBlock({ id: "setup-steps", title: "Setup Steps", subtitle: "How to set up.", purpose: "Give simple setup instructions.", assetType: "setup_steps", intentExamples: ["set it up", "setup", "how do i set"], icon: "message" }),
    createWorkBlock({ id: "cost-fit", title: "Cost Fit", subtitle: "Right stage.", purpose: "State what makes sense for the user’s stage.", assetType: "cost_fit", intentExamples: ["cost", "budget", "stage"], icon: "idea" }),
    createWorkBlock({ id: "integrations", title: "Integrations", subtitle: "What connects.", purpose: "State what should connect to what.", assetType: "integrations", intentExamples: ["connects", "integrations", "what connects to what"], icon: "mail" }),
    createWorkBlock({ id: "avoid-for-now", title: "Avoid For Now", subtitle: "Too much too early.", purpose: "List tools that would add complexity too early.", assetType: "tools_to_avoid", intentExamples: ["avoid", "not ready", "what should i avoid"], icon: "idea" }),
    createWorkBlock({ id: "use", title: "Use It Now", subtitle: "Setup checklist.", purpose: "Give a short setup checklist.", assetType: "tool_stack_activation", intentExamples: ["use it now", "checklist", "what should i do next"], icon: "spark" }),
    createWorkBlock({ id: "feed", title: "Tool Notes", subtitle: "Add context.", purpose: "Add tool ideas, channel questions, bottlenecks, or deployment notes.", assetType: "tool_feedback", intentExamples: ["new info", "tool note", "channel question"], icon: "spark" }),
    createWorkBlock({ id: "history", title: "History", subtitle: "Saved versions.", purpose: "Show saved versions and changes over time.", assetType: "tool_history", intentExamples: ["history", "saved versions"], icon: "history" }),
  ],
};

const quickPromptRegistry: Record<UtilityKind, QuickPrompt[]> = {
  icp: [
    { label: "Best-fit customer", prompt: "Who is the best-fit customer?", workBlockId: "best-fit-customer" },
    { label: "Top pain points", prompt: "What pain matters most?", workBlockId: "buyer-problems" },
    { label: "Buying triggers", prompt: "Why do they buy now?", workBlockId: "buying-triggers" },
    { label: "Objections", prompt: "What objections slow them down?", workBlockId: "objections" },
    { label: "Where to find them", prompt: "Where do I find them?", workBlockId: "where-to-find-them" },
    { label: "What next?", prompt: "What should I do next?", workBlockId: "use" },
  ],
  offer: [
    { label: "Core offer", prompt: "What do we sell?", workBlockId: "core-offer" },
    { label: "Main promise", prompt: "What is the main promise?", workBlockId: "primary-promise" },
    { label: "Offer statement", prompt: "Write the offer statement.", workBlockId: "offer-statement" },
    { label: "Proof", prompt: "What proof should we use?", workBlockId: "proof" },
    { label: "CTA", prompt: "What CTA should we use?", workBlockId: "cta" },
  ],
  message: [
    { label: "One-liner", prompt: "Write the one-liner.", workBlockId: "one-liner" },
    { label: "Homepage headline", prompt: "Write the homepage headline.", workBlockId: "homepage-headline" },
    { label: "Different", prompt: "What makes this different?", workBlockId: "differentiators" },
    { label: "CTA copy", prompt: "Write CTA copy.", workBlockId: "cta-copy" },
    { label: "FAQ copy", prompt: "Write objection FAQ copy.", workBlockId: "faq-objection-copy" },
  ],
  content: [
    { label: "This week", prompt: "What should I post this week?", workBlockId: "weekly-plan" },
    { label: "Pillars", prompt: "What are the content pillars?", workBlockId: "content-pillars" },
    { label: "Blog ideas", prompt: "Give me blog ideas.", workBlockId: "blog-seo-ideas" },
    { label: "Write email", prompt: "Write an email.", workBlockId: "email-ideas" },
    { label: "Repurpose", prompt: "Repurpose this into a social post.", workBlockId: "repurpose" },
  ],
  strategy_map: [
    { label: "Bottleneck", prompt: "What is the current bottleneck?", workBlockId: "current-bottleneck" },
    { label: "Focus first", prompt: "What should we focus on first?", workBlockId: "growth-focus" },
    { label: "Channel", prompt: "What channel should we prioritize?", workBlockId: "channel-priority" },
    { label: "90-day plan", prompt: "What is the 90-day plan?", workBlockId: "90-day-plan" },
  ],
  marketing_schedule: [
    { label: "This week", prompt: "What should I do this week?", workBlockId: "weekly-actions" },
    { label: "Checklist", prompt: "Give me a checklist.", workBlockId: "task-checklist" },
    { label: "Campaign", prompt: "What campaign should I launch?", workBlockId: "campaign-plan" },
    { label: "Follow-up", prompt: "How should leads be followed up?", workBlockId: "follow-up-process" },
  ],
  research: [
    { label: "Website", prompt: "What does the website say?", workBlockId: "website-findings" },
    { label: "Competitors", prompt: "What are competitors doing?", workBlockId: "competitor-notes" },
    { label: "Language", prompt: "What customer language should we use?", workBlockId: "customer-language" },
    { label: "Gaps", prompt: "What gaps are missing?", workBlockId: "gaps" },
  ],
  recommendation: [
    { label: "Tools", prompt: "What tools should I use?", workBlockId: "recommended-tools" },
    { label: "Avoid", prompt: "What should I avoid for now?", workBlockId: "avoid-for-now" },
    { label: "Setup", prompt: "How do I set it up?", workBlockId: "setup-steps" },
    { label: "Integrations", prompt: "What connects to what?", workBlockId: "integrations" },
  ],
};

function getWorkBlocks(kind: UtilityKind): WorkBlock[] {
  return utilityWorkBlockRegistry[kind];
}

function firstWorkBlockId(kind: UtilityKind) {
  return utilityWorkBlockRegistry[kind][0].id;
}

function getWorkBlock(kind: UtilityKind, blockId: WorkBlockId) {
  return utilityWorkBlockRegistry[kind].find((block) => block.id === blockId) ?? utilityWorkBlockRegistry[kind][0];
}

function getRoutedWorkBlock(kind: UtilityKind, prompt: string, fallbackBlockId: WorkBlockId) {
  const lower = normalizeIntent(prompt);
  const blocks = utilityWorkBlockRegistry[kind];
  const direct = blocks.find((block) => block.id === fallbackBlockId);
  const matched = blocks.find((block) => block.intentExamples.some((example) => lower.includes(normalizeIntent(example)))) ?? matchByKeywords(kind, lower);
  return matched ?? direct ?? blocks[0];
}

function normalizeIntent(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function matchByKeywords(kind: UtilityKind, lower: string) {
  const keywordMap: Partial<Record<UtilityKind, Array<[string[], WorkBlockId]>>> = {
    icp: [[ ["pain", "problem", "struggle"], "buyer-problems" ], [["trigger", "buy now", "why now"], "buying-triggers"], [["objection", "hesitation", "slow"], "objections"], [["find", "where", "channel"], "where-to-find-them"], [["next", "do"], "use"], [["customer", "target", "audience", "who"], "best-fit-customer"]],
    offer: [[ ["promise", "result"], "primary-promise" ], [["statement", "sentence"], "offer-statement"], [["proof", "trust", "testimonial"], "proof"], [["cta", "button", "next step"], "cta"], [["package", "pricing", "price"], "packages-pricing"], [["risk", "guarantee", "trial"], "risk-reversal"], [["sell", "offer"], "core-offer"]],
    message: [[ ["headline", "homepage", "hero"], "homepage-headline" ], [["one", "liner", "simple", "explain"], "one-liner"], [["different", "differentiator"], "differentiators"], [["proof", "trust"], "proof-points"], [["cta", "button"], "cta-copy"], [["faq", "objection", "hesitation"], "faq-objection-copy"], [["before", "after"], "before-after"]],
    content: [[ ["pillar", "topic"], "content-pillars" ], [["post", "social"], "post-ideas"], [["week", "publish"], "weekly-plan"], [["email", "subject"], "email-ideas"], [["blog", "seo", "search"], "blog-seo-ideas"], [["repurpose", "turn this"], "repurpose"]],
    strategy_map: [[ ["bottleneck", "stuck"], "current-bottleneck" ], [["focus", "priority"], "growth-focus"], [["channel"], "channel-priority"], [["funnel", "path"], "funnel-map"], [["90", "plan"], "90-day-plan"], [["position"], "positioning"], [["next", "action"], "use"]],
    marketing_schedule: [[ ["week"], "weekly-actions" ], [["checklist", "steps"], "task-checklist"], [["campaign", "launch"], "campaign-plan"], [["follow", "lead"], "follow-up-process"], [["calendar", "schedule"], "calendar"], [["progress", "stuck"], "progress-check-in"]],
    research: [[ ["website", "site"], "website-findings" ], [["competitor"], "competitor-notes"], [["market", "pattern"], "market-patterns"], [["language", "words"], "customer-language"], [["search", "questions", "topic"], "content-search-signals"], [["gap", "missing"], "gaps"]],
    recommendation: [[ ["current", "already"], "current-tools" ], [["tool", "recommend"], "recommended-tools"], [["setup", "set up"], "setup-steps"], [["cost", "budget"], "cost-fit"], [["connect", "integration"], "integrations"], [["avoid", "not ready"], "avoid-for-now"]],
  };
  const match = keywordMap[kind]?.find(([keywords]) => keywords.some((keyword) => lower.includes(keyword)));
  return match ? getWorkBlock(kind, match[1]) : null;
}

function renderWorkBlock({
  activeBlock,
  config,
  currentRecommendation,
  feedback,
  feedbackType,
  history,
  scopedHref,
  setFeedback,
  setFeedbackType,
  onImprove,
}: {
  activeBlock: WorkBlockId;
  config: UtilityConfig;
  currentRecommendation: Deliverable;
  feedback: string;
  feedbackType: string;
  history: MarketingAssetSummary[];
  scopedHref: (href: string) => string;
  setFeedback: (value: string) => void;
  setFeedbackType: (value: string) => void;
  onImprove: (event?: FormEvent<HTMLFormElement>) => void;
}) {
  if (activeBlock === "history") return <HistoryBlock history={history} />;
  if (activeBlock === "feed") {
    return (
      <form onSubmit={onImprove} className="grid gap-4">
        <p className="text-sm leading-6 text-slate-600">Add customer notes, objections, sales calls, reviews, campaign results, or market feedback.</p>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Information type</span>
          <select value={feedbackType} onChange={(event) => setFeedbackType(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">
            <option value="customer_note">Customer question or sales note</option>
            <option value="objection">Objection heard</option>
            <option value="review">Review or testimonial</option>
            <option value="campaign_result">Campaign result</option>
            <option value="competitor">Competitor example</option>
            <option value="new_offer">New service or offer detail</option>
            <option value="not_right">What feels off</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">{config.feedLabel}</span>
          <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder={config.feedPlaceholder} className="mt-2 min-h-32 w-full rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100" />
        </label>
        <button type="submit" className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
          <Sparkles size={18} aria-hidden="true" />
          Analyze and Improve
        </button>
      </form>
    );
  }
  if (activeBlock === "tests") {
    return (
      <div className="grid gap-3">
        {currentRecommendation.tests.map((test) => (
          <article key={test.title} className="rounded-md border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-950">{test.title}</h3>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
              <p><strong>Where:</strong> {test.where}</p>
              <p><strong>Measure:</strong> {test.measure}</p>
              <p><strong>Working signal:</strong> {test.signal}</p>
              <p><strong>Next move:</strong> {test.nextMove}</p>
            </div>
          </article>
        ))}
      </div>
    );
  }
  const block = getWorkBlock(config.kind, activeBlock);
  const blockOutput = getBlockOutputs(config.kind, activeBlock, currentRecommendation);
  return (
    <div className="grid gap-4">
      <div className="rounded-md bg-cyan-50 p-4">
        <p className="text-sm font-semibold text-cyan-950">{block.title}</p>
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-cyan-950">{blockOutput.primary}</p>
      </div>
      {blockOutput.items.length ? (
        <div className="grid gap-3">
          {blockOutput.items.map((item) => <p key={item} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item}</p>)}
        </div>
      ) : null}
      {activeBlock === "use" ? (
        <Link href={scopedHref(currentRecommendation.suggestedNextUtility.href)} className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
          {currentRecommendation.suggestedNextUtility.label}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function getQuickPrompts(kind: UtilityKind, activeBlock: WorkBlockId): QuickPrompt[] {
  const prompts = quickPromptRegistry[kind];
  const activePrompt = prompts.find((prompt) => prompt.workBlockId === activeBlock);
  return activePrompt ? [activePrompt, ...prompts.filter((prompt) => prompt.workBlockId !== activeBlock)].slice(0, 6) : prompts;
}

function buildSessionResponse(config: UtilityConfig, block: WorkBlock, deliverable: Deliverable, prompt: string) {
  const routedBlock = getRoutedWorkBlock(config.kind, prompt, block.id);
  return buildWorkBlockAsset(config.kind, routedBlock.id, deliverable);
}

function getBlockOutputs(kind: UtilityKind, activeBlock: WorkBlockId, deliverable: Deliverable) {
  const asset = buildWorkBlockAsset(kind, activeBlock, deliverable);
  return { title: getWorkBlock(kind, activeBlock).title, primary: asset, items: [] };
}

function buildWorkBlockAsset(kind: UtilityKind, blockId: WorkBlockId, deliverable: Deliverable) {
  const profile = buildAssetProfile(deliverable);
  const { businessName, target, problem, proof, channel } = profile;
  const audience = target || "small businesses that rely on inbound leads and need clearer follow-up";
  const topProblem = problem || "leads lose momentum before the next step is clear";
  const assets: Record<UtilityKind, Record<string, string>> = {
    icp: {
      "best-fit-customer": `${audience} that rely on inbound website leads but lose opportunities when prospects do not get fast, clear, trustworthy answers.`,
      "buyer-problems": bullets(["Website visitors leave before talking to anyone", "Leads go cold before follow-up", "Missed questions turn into missed revenue", "Generic chat tools create trust or compliance risk", "Owners cannot tell which leads are worth chasing"]),
      "buying-triggers": bullets(["Lead volume is increasing but booked calls are not", "The team is missing or delaying follow-up", "The owner wants better website conversion without hiring more staff", "Risk makes generic AI tools feel unsafe", "The business needs a cleaner handoff from website visitor to sales team"]),
      objections: bullets(["Will it give wrong answers?", "Will it sound like our business?", "Will it create compliance problems?", "Will setup take too much time?", "Will this actually capture better leads?"], true),
      "where-to-find-them": bullets(["WordPress agencies serving local businesses", "Home service owner communities", "CRM and lead management groups", "Industry associations for regulated services", "SEO and website consultants with under-converting clients"]),
      use: `Sharpen the offer around this audience:\n\n${audience}\n\nUse this first message:\n"Get prospects a fast, clear answer before the lead goes cold."`,
      feed: "Add a customer note, sales-call detail, objection, review, or lead-quality pattern.",
      history: "Open saved audience versions and compare what changed.",
    },
    offer: {
      "core-offer": `${businessName} gives ${audience} a simple way to turn website visitors and inbound questions into cleaner sales conversations.`,
      "primary-promise": "More qualified conversations from the leads the business is already getting.",
      "offer-statement": `${businessName} helps ${audience} answer prospect questions, capture better lead details, and create a cleaner handoff before opportunities go cold.`,
      proof: bullets([proof, "Fast response before the lead cools off", "Clear answers based on the business, not generic chatbot guesses", "Better lead details for the sales team"]),
      cta: `Talk to ${businessName.replace(/^Talk to /i, "")}\n\nGet a fast answer before the lead goes cold.`,
      "packages-pricing": bullets(["Starter: answer common website questions and capture lead details", "Growth: add handoff notes, follow-up prompts, and better routing", "Partner: support multiple client sites or locations"]),
      "risk-reversal": "Start with one high-value page or lead path. Review the answers, handoff, and lead quality before expanding.",
      use: `Homepage offer section:\n\n${businessName} helps you turn more website visitors into qualified conversations.\n\nProspects get fast, clear answers. Your team gets better lead details and a cleaner handoff.`,
      feed: "Add a customer objection, proof point, package idea, or sales note.",
      history: "Open saved offer versions and compare what changed.",
    },
    message: {
      "one-liner": `${businessName} helps ${audience} turn website visitors into better qualified conversations before leads go cold.`,
      "homepage-headline": `Turn more website visitors into qualified conversations.\n\nSubheadline:\n${businessName} answers prospect questions, captures lead details, and gives your team a cleaner handoff before the opportunity goes cold.`,
      differentiators: bullets(["Built around the business’s real offer and customer questions", "Designed for fast lead response, not generic chat", "Gives the team cleaner lead details", "Reduces trust risk with clearer, controlled answers"]),
      "proof-points": bullets([proof, "Clearer first response for prospects", "Cleaner lead handoff for the team", "Less missed revenue from slow follow-up"]),
      "cta-copy": `Primary CTA:\nTalk to ${businessName.replace(/^Talk to /i, "")}\n\nSupporting line:\nGet a fast answer before the lead goes cold.`,
      "faq-objection-copy": "Will it give wrong answers?\nIt should answer from your approved business information and route uncertain questions to your team.\n\nIs setup hard?\nStart with the highest-value questions and lead path first.\n\nWill my team use it?\nThe handoff should make follow-up easier, not add another dashboard.",
      "before-after": "Before:\nWebsite visitors ask questions, hesitate, and leave before your team can respond.\n\nAfter:\nProspects get a clear first answer and your team gets better context for follow-up.",
      use: `Website section:\n\nStop losing leads after the first question.\n\n${businessName} gives prospects quick answers and gives your team the details they need to follow up while interest is still fresh.`,
      history: "Open saved messaging versions and compare what changed.",
    },
    content: {
      "content-pillars": bullets(["Missed leads and slow follow-up", "Website questions prospects ask before buying", "Trust and risk in AI answering", "Better handoff from website to sales", "Lead quality, not just lead volume"]),
      "post-ideas": bullets(["The hidden cost of slow lead follow-up", "Five questions your website should answer before a prospect calls", "Why generic chatbots can hurt trust", "How to spot leads worth chasing", "What a clean sales handoff should include"]),
      "weekly-plan": bullets(["Monday: post about missed website questions", "Tuesday: collect 3 common prospect questions", "Wednesday: write one proof-backed answer", "Thursday: publish a lead handoff tip", "Friday: review replies, objections, and lead quality"]),
      "email-ideas": "Subject: Your website leads may be going cold\n\nMost prospects do not need a long explanation. They need a fast, clear answer and one obvious next step.\n\nIf your team is missing questions or following up late, start by fixing the first handoff from website visitor to sales conversation.",
      "blog-seo-ideas": bullets(["How to respond faster to website leads", "Best website chatbot for home service businesses", "How to qualify inbound leads before a sales call", "How to reduce missed calls and lost leads", "What questions should a service business website answer?"]),
      repurpose: bullets(["Post: Slow follow-up quietly kills good leads", "Email: The first answer matters more than another campaign", "Short video: Three website questions prospects need answered", "Checklist: Lead handoff basics for service teams", "Ad angle: Get prospects a clear answer before they leave"]),
      use: "Social post:\n\nA lead does not always go cold because they were not interested.\n\nSometimes they asked one question, waited too long, and moved on.\n\nFix the first response. Capture the right details. Give your team a cleaner handoff.",
      feed: "Add a customer question, content result, topic idea, or campaign note.",
      history: "Open saved content versions and compare what changed.",
    },
    strategy_map: {
      "current-bottleneck": topProblem,
      "growth-focus": "Fix the first website-to-sales handoff before adding more traffic.",
      "channel-priority": `${channel || "Website conversion"} should come first because the business already has visitors or leads that need a clearer next step.`,
      "funnel-map": bullets(["Visitor lands on website", "Visitor gets a clear answer to the first question", "Lead details are captured", "Team receives a clean handoff", "Follow-up happens before interest fades"]),
      "90-day-plan": bullets(["Days 1-30: clarify offer, CTA, and top prospect questions", "Days 31-60: improve lead capture and follow-up handoff", "Days 61-90: add content and partner channels around proven questions"]),
      positioning: `${businessName} should sit as the practical lead-response and website-conversion helper for service businesses that cannot afford slow or generic follow-up.`,
      use: "Do this first:\n\nFix the website CTA and first-response path.\n\nUse this CTA:\n\"Get a fast answer before the lead goes cold.\"",
      feed: "Add a business update, result, constraint, or new priority.",
      history: "Open saved strategy versions and compare what changed.",
    },
    marketing_schedule: {
      "weekly-actions": bullets(["Rewrite the homepage CTA", "List the top 5 prospect questions", "Write approved answers for those questions", "Create one follow-up message", "Review which leads are worth chasing"]),
      "task-checklist": bullets(["Pick one page or lead source", "Add one clear CTA", "Capture name, contact info, need, and urgency", "Route the lead to the right person", "Follow up within the same business day"]),
      "campaign-plan": bullets(["Launch one website CTA improvement", "Publish one post about missed leads", "Send one email about fast follow-up", "Ask one partner for feedback", "Review lead quality after one week"]),
      "follow-up-process": bullets(["Reply fast", "Confirm the prospect’s main question", "Capture the needed details", "Give one clear next step", "Mark whether the lead is worth chasing"]),
      calendar: bullets(["Monday: CTA and question list", "Tuesday: approved answers", "Wednesday: follow-up message", "Thursday: publish one post", "Friday: review leads and objections"]),
      "progress-check-in": bullets(["What changed: lead questions are clearer", "What is stuck: follow-up still depends on manual speed", "Next move: improve the first handoff before adding channels"]),
      use: "Today:\n\nUpdate the main website CTA to:\n\"Get a fast answer before the lead goes cold.\"\n\nThen make sure the contact path captures the prospect’s question, urgency, and contact info.",
      feed: "Add what got done, what did not, available time, or last week’s result.",
      history: "Open saved execution versions and compare what changed.",
    },
    research: {
      "website-findings": bullets(["The site needs to make the next step obvious", "Prospects need answers before they call or submit a form", "Trust and response speed matter more than clever copy", "Lead capture should gather enough context for follow-up"]),
      "competitor-notes": bullets(["Many competitors promise AI chat but sound generic", "Few explain lead handoff clearly", "Trust and control are likely underused messages", "Service businesses need practical setup, not AI hype"]),
      "market-patterns": bullets(["Owners want more leads without hiring more admin help", "Speed-to-lead matters", "Generic AI creates trust concerns", "Agencies need better client website conversion stories"]),
      "customer-language": bullets(["We miss too many calls", "People leave before we can answer", "I do not want a chatbot making things up", "I need better leads, not just more leads", "My team needs a cleaner handoff"]),
      "content-search-signals": bullets(["How do I respond faster to website leads?", "How do I stop missing calls?", "How do I qualify website leads?", "Can AI answer customer questions safely?", "What should a service business chatbot ask?"]),
      gaps: bullets(["Clear proof that answers stay accurate", "Simple setup explanation", "Specific lead handoff examples", "Industry-specific trust language", "Before/after lead handling story"]),
      use: "Turn this research into messaging:\n\n\"Get prospects a fast, trustworthy answer before the lead goes cold, and give your team a cleaner handoff.\"",
      feed: "Add reviews, competitor copy, sales notes, FAQs, objections, or market observations.",
      history: "Open saved research versions and compare what changed.",
    },
    recommendation: {
      "current-tools": bullets(["Website or CMS", "Contact form or booking path", "Email or CRM follow-up", "Analytics or lead source notes"]),
      "recommended-tools": bullets(["Website lead capture tool", "CRM or simple lead inbox", "Email/SMS follow-up tool", "Call tracking if missed calls are common"]),
      "setup-steps": bullets(["Start with one high-value website page", "Add approved answers to common questions", "Capture lead details and urgency", "Send the handoff to the right person", "Review lead quality weekly"]),
      "cost-fit": "Use the lightest tool that improves response speed and lead handoff. Avoid expensive automation until the offer, CTA, and follow-up path are clear.",
      integrations: bullets(["Website form to CRM", "Chat or question capture to email/SMS alert", "CRM to follow-up reminders", "Analytics to lead-source review"]),
      "avoid-for-now": bullets(["Complex marketing automation", "Paid ads before the CTA is clear", "Multiple new channels at once", "Tools that require heavy setup before proving lead quality"]),
      use: bullets(["Pick one website page", "Set one CTA", "Capture the question and urgency", "Send the handoff to the team", "Review leads after one week"]),
      feed: "Add a tool idea, channel question, current stack detail, or deployment note.",
      history: "Open saved tool stack versions and compare what changed.",
    },
  };
  return assets[kind][blockId] ?? assets[kind][firstWorkBlockId(kind)];
}

function buildAssetProfile(deliverable: Deliverable) {
  const titleMatch = deliverable.title.match(/^(.+?) (Audience|Offer|Messaging|Content|Strategy|Execution|Research|Tool Stack) HQ/);
  const matchedBusinessName = titleMatch?.[1] ?? "Talk to Fred";
  const businessName = matchedBusinessName === "the business" ? "Talk to Fred" : matchedBusinessName;
  const offerStatement = deliverable.copyPasteBlocks.find((block) => block.label.toLowerCase().includes("offer"))?.value;
  const audienceStatement = deliverable.copyPasteBlocks.find((block) => block.label.toLowerCase().includes("audience"))?.value;
  const rawTarget = cleanAssetPhrase(audienceStatement || deliverable.currentAsset.find((item) => item.label.toLowerCase().includes("customer"))?.value || "home service companies, regulated service businesses, and agencies");
  const target = /best-fit customers want|problem creating hesitation|the business should focus/i.test(rawTarget) ? "home service companies, regulated service businesses, and agencies" : rawTarget;
  return {
    businessName,
    target,
    offer: cleanAssetPhrase(offerStatement || deliverable.cmoRecommendation.recommendation || "the core offer"),
    problem: cleanAssetPhrase(deliverable.cmoRecommendation.customerProblem || "slow or inconsistent lead follow-up"),
    outcome: cleanAssetPhrase(deliverable.cmoRecommendation.outcome || "more qualified conversations and booked jobs"),
    proof: cleanAssetPhrase(deliverable.currentAsset.find((item) => item.label.toLowerCase().includes("proof"))?.value || "clear setup, approved answers, and cleaner lead handoff"),
    channel: cleanAssetPhrase(deliverable.currentAsset.find((item) => item.label.toLowerCase().includes("channel"))?.value || "website conversion"),
  };
}

function cleanAssetPhrase(value: string) {
  return value.replace(/^(Audience statement|Offer statement|Best-fit customer|Current bottleneck):\s*/i, "").replace(/\s+/g, " ").trim();
}

function bullets(items: string[], quote = false) {
  return items.map((item) => `* ${quote ? `“${item.replace(/^“|”$/g, "")}”` : item}`).join("\n");
}

function HistoryBlock({ history }: { history: MarketingAssetSummary[] }) {
  return (
    <div className="grid gap-3">
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
        <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">No saved versions yet. Save the current recommendation when it is ready to become part of this business’s history.</p>
      )}
    </div>
  );
}

function WorkBlockIcon({ icon }: { icon: WorkBlock["icon"] }) {
  if (icon === "target") return <Target size={18} aria-hidden="true" />;
  if (icon === "message") return <MessageSquare size={18} aria-hidden="true" />;
  if (icon === "mail") return <Mail size={18} aria-hidden="true" />;
  if (icon === "video") return <Video size={18} aria-hidden="true" />;
  if (icon === "test") return <FlaskConical size={18} aria-hidden="true" />;
  if (icon === "history") return <History size={18} aria-hidden="true" />;
  if (icon === "idea") return <Lightbulb size={18} aria-hidden="true" />;
  return <Sparkles size={18} aria-hidden="true" />;
}

function ChatBubble({ role, content }: { role: "assistant" | "user"; content: string }) {
  return (
    <div className={`rounded-lg p-4 ${role === "assistant" ? "bg-cyan-50 text-cyan-950" : "bg-slate-100 text-slate-800"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{role === "assistant" ? "Simple Marketing HQ" : "You"}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6">{content}</p>
    </div>
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

