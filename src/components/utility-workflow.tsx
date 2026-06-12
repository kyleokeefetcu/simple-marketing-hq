"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, FlaskConical, History, Lightbulb, Mail, MessageSquare, Sparkles, Target, Video } from "lucide-react";
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

type WorkBlockId =
  | "current"
  | "themes"
  | "ideas"
  | "create"
  | "email"
  | "video"
  | "hooks"
  | "results"
  | "recommendation"
  | "feed"
  | "tests"
  | "use"
  | "history";

type WorkBlock = {
  id: WorkBlockId;
  title: string;
  subtitle: string;
  icon: "spark" | "target" | "message" | "mail" | "video" | "test" | "history" | "idea";
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
  const [activeBlock, setActiveBlock] = useState<WorkBlockId>(kind === "content" ? "current" : "current");
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
  const nextStep = getNextStepSuggestion(config, activeBlock, currentRecommendation);
  const assistantIntro = `I'm working inside ${config.navName} for this business. I'll use your current offer, audience, message, latest diagnostic, saved history, and the ${activeWorkBlock.title} work block. Ask me to create an asset, improve an idea, or tell you what to do next.`;

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

  function handleQuickPrompt(prompt: string) {
    const response = buildSessionResponse(config, activeWorkBlock, currentRecommendation, prompt);
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
                  activeBlock: detailView === "asset" ? "current" : detailView === "history" ? "history" : detailView === "tests" ? "tests" : "feed",
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
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{activeWorkBlock.title}</h2>
              <div className="mt-4 grid gap-3">
                <ChatBubble role="assistant" content={assistantIntro} />
                {sessionMessages.map((message, index) => (
                  <ChatBubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {getQuickPrompts(config.kind, activeBlock).map((prompt) => (
                  <button key={prompt} type="button" onClick={() => handleQuickPrompt(prompt)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSessionSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={sessionInput}
                  onChange={(event) => setSessionInput(event.target.value)}
                  placeholder={`Ask ${config.navName} to create, improve, or choose the next action...`}
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

        <section className="mt-5 rounded-lg border border-cyan-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Next best move</p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                <li>{nextStep.title}</li>
                <li><strong>Output:</strong> {nextStep.output}</li>
                <li><strong>Why:</strong> {nextStep.why}</li>
              </ul>
            </div>
            <button type="button" onClick={() => openWorkBlock(nextStep.blockId)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              {nextStep.button}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="mt-5">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI Working Session</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ask what to work on next.</h2>
            <div className="mt-4 grid gap-3">
              <ChatBubble role="assistant" content={assistantIntro} />
              {sessionMessages.map((message, index) => (
                <ChatBubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {getQuickPrompts(config.kind, activeBlock).map((prompt) => (
                <button key={prompt} type="button" onClick={() => handleQuickPrompt(prompt)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSessionSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={sessionInput}
                onChange={(event) => setSessionInput(event.target.value)}
                placeholder={`Ask ${config.navName} what to do next...`}
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

function getWorkBlocks(kind: UtilityKind): WorkBlock[] {
  if (kind === "content") {
    return [
      { id: "current", title: "Current Plan", subtitle: "Themes, CTA, priority.", icon: "spark" },
      { id: "themes", title: "Content Themes", subtitle: "Improve the angles.", icon: "target" },
      { id: "ideas", title: "Post Ideas", subtitle: "Ready topics.", icon: "message" },
      { id: "create", title: "Create Post", subtitle: "Draft one asset.", icon: "spark" },
      { id: "email", title: "Email Ideas", subtitle: "Topics or draft.", icon: "mail" },
      { id: "video", title: "Video Scripts", subtitle: "Short scripts.", icon: "video" },
      { id: "hooks", title: "Hooks", subtitle: "Scroll-stoppers.", icon: "idea" },
      { id: "results", title: "Campaign Results", subtitle: "Feed back notes.", icon: "target" },
      { id: "tests", title: "Tests", subtitle: "What to try.", icon: "test" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ];
  }

  const shared: Record<Exclude<UtilityKind, "content">, WorkBlock[]> = {
    icp: [
      { id: "current", title: "Best-Fit Customer", subtitle: "Current audience.", icon: "target" },
      { id: "themes", title: "Buyer Problems", subtitle: "What they feel.", icon: "idea" },
      { id: "ideas", title: "Buying Triggers", subtitle: "Why now.", icon: "spark" },
      { id: "hooks", title: "Objections", subtitle: "What slows yes.", icon: "message" },
      { id: "create", title: "Where to Find Them", subtitle: "Channel fit.", icon: "target" },
      { id: "feed", title: "New Info", subtitle: "Add customer notes.", icon: "spark" },
      { id: "use", title: "Use It Now", subtitle: "Apply the ICP.", icon: "idea" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ],
    offer: [
      { id: "current", title: "Current Offer", subtitle: "Offer and CTA.", icon: "spark" },
      { id: "themes", title: "Offer Angles", subtitle: "Ways to frame it.", icon: "idea" },
      { id: "create", title: "CTA", subtitle: "Next step copy.", icon: "message" },
      { id: "hooks", title: "Proof / Trust", subtitle: "Reduce risk.", icon: "target" },
      { id: "ideas", title: "Objections", subtitle: "Buyer hesitation.", icon: "message" },
      { id: "feed", title: "New Info", subtitle: "Add offer notes.", icon: "spark" },
      { id: "tests", title: "Tests", subtitle: "What to try.", icon: "test" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ],
    message: [
      { id: "current", title: "Current Message", subtitle: "Main copy.", icon: "message" },
      { id: "create", title: "Homepage Copy", subtitle: "Hero and opener.", icon: "spark" },
      { id: "hooks", title: "Headlines", subtitle: "Short options.", icon: "idea" },
      { id: "email", title: "CTAs", subtitle: "Low-friction asks.", icon: "target" },
      { id: "ideas", title: "Follow-Up Lines", subtitle: "Use after inquiry.", icon: "mail" },
      { id: "video", title: "Sales Script", subtitle: "Conversation copy.", icon: "message" },
      { id: "tests", title: "Tests", subtitle: "What to try.", icon: "test" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ],
    strategy_map: [
      { id: "current", title: "Current Priority", subtitle: "Do first.", icon: "spark" },
      { id: "themes", title: "Bottleneck", subtitle: "What is stuck.", icon: "target" },
      { id: "ideas", title: "What to Ignore", subtitle: "Avoid noise.", icon: "idea" },
      { id: "create", title: "Channel Order", subtitle: "Launch sequence.", icon: "message" },
      { id: "use", title: "Next 3 Actions", subtitle: "Move now.", icon: "spark" },
      { id: "hooks", title: "Risks", subtitle: "Watchouts.", icon: "target" },
      { id: "tests", title: "Tests", subtitle: "What to try.", icon: "test" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ],
    marketing_schedule: [
      { id: "current", title: "This Week’s Plan", subtitle: "Top priority.", icon: "spark" },
      { id: "create", title: "Today’s Task", subtitle: "One move.", icon: "target" },
      { id: "ideas", title: "Content to Publish", subtitle: "Use this week.", icon: "message" },
      { id: "email", title: "Follow-Up", subtitle: "Reply rhythm.", icon: "mail" },
      { id: "results", title: "Review Results", subtitle: "What happened.", icon: "idea" },
      { id: "feed", title: "Adjust Plan", subtitle: "Add updates.", icon: "spark" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ],
    research: [
      { id: "current", title: "Market Insights", subtitle: "Current read.", icon: "idea" },
      { id: "themes", title: "Customer Questions", subtitle: "What they ask.", icon: "message" },
      { id: "feed", title: "Reviews / Notes", subtitle: "Paste research.", icon: "spark" },
      { id: "create", title: "Competitors", subtitle: "Compare claims.", icon: "target" },
      { id: "ideas", title: "Objections", subtitle: "Buying friction.", icon: "message" },
      { id: "hooks", title: "Content Ideas", subtitle: "Use insights.", icon: "idea" },
      { id: "use", title: "Offer Improvements", subtitle: "Apply research.", icon: "spark" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ],
    recommendation: [
      { id: "current", title: "Recommended Tools", subtitle: "Best fit now.", icon: "spark" },
      { id: "themes", title: "Not Ready Yet", subtitle: "What to wait on.", icon: "idea" },
      { id: "email", title: "Cold Email", subtitle: "Readiness.", icon: "mail" },
      { id: "create", title: "Website / SEO", subtitle: "Readiness.", icon: "target" },
      { id: "hooks", title: "CRM / Booking", subtitle: "Follow-up fit.", icon: "message" },
      { id: "ideas", title: "Social / Content", subtitle: "Channel fit.", icon: "video" },
      { id: "feed", title: "Tool Notes", subtitle: "Add context.", icon: "spark" },
      { id: "history", title: "History", subtitle: "Saved versions.", icon: "history" },
    ],
  };

  return shared[kind as Exclude<UtilityKind, "content">];
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
  if (activeBlock === "history") {
    return <HistoryBlock history={history} />;
  }

  if (activeBlock === "feed" || activeBlock === "results") {
    return (
      <form onSubmit={onImprove} className="grid gap-4">
        <p className="text-sm leading-6 text-slate-600">Add raw information from the real world. Simple Marketing HQ will update the recommendation from it.</p>
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

  if (activeBlock === "use") {
    return (
      <div className="grid gap-3">
        {currentRecommendation.useItNow.map((item) => (
          <p key={item} className="flex gap-2 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} aria-hidden="true" />
            {item}
          </p>
        ))}
        <Link href={scopedHref(currentRecommendation.suggestedNextUtility.href)} className="mt-2 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
          {currentRecommendation.suggestedNextUtility.label}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (activeBlock === "recommendation") {
    return (
      <div className="grid gap-3">
        <RecommendationRow label="What we recommend" value={currentRecommendation.cmoRecommendation.recommendation} />
        <RecommendationRow label="Why" value={currentRecommendation.cmoRecommendation.why} />
        <RecommendationRow label="Customer problem" value={currentRecommendation.cmoRecommendation.customerProblem} />
        <RecommendationRow label="Outcome to emphasize" value={currentRecommendation.cmoRecommendation.outcome} />
        <RecommendationRow label="Next action" value={currentRecommendation.cmoRecommendation.nextAction} />
      </div>
    );
  }

  const blockOutputs = getBlockOutputs(activeBlock, currentRecommendation);
  return (
    <div className="grid gap-4">
      {activeBlock === "current" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {currentRecommendation.currentAsset.map((item) => (
            <InfoCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      ) : null}
      <div className="rounded-md bg-cyan-50 p-4">
        <p className="text-sm font-semibold text-cyan-950">{blockOutputs.title}</p>
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-cyan-950">{blockOutputs.primary}</p>
      </div>
      <div className="grid gap-3">
        {blockOutputs.items.map((item) => (
          <p key={item} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item}</p>
        ))}
      </div>
    </div>
  );
}

function getNextStepSuggestion(config: UtilityConfig, activeBlock: WorkBlockId, deliverable: Deliverable) {
  const blockId: WorkBlockId = config.kind === "content" ? "create" : activeBlock === "history" ? "current" : activeBlock;
  const label = config.kind === "content" ? "Create one problem-aware post from your current content theme." : getShortNextAction(config, deliverable);
  return {
    title: label,
    why: config.kind === "content"
      ? "Your message needs a simple proof point before pushing harder into channels."
      : getShortWhy(deliverable),
    output: config.kind === "content" ? "LinkedIn/Facebook post draft." : config.nextOutput,
    button: config.kind === "content" ? "Create Post" : `Open ${config.navName}`,
    blockId,
  };
}

function getShortNextAction(config: UtilityConfig, deliverable: Deliverable) {
  if (config.kind === "offer") return "Use this offer to create Messaging HQ.";
  if (config.kind === "message") return "Turn this message into Content HQ.";
  if (config.kind === "icp") return "Use this audience to sharpen the offer.";
  if (config.kind === "strategy_map") return "Turn the priority into this week’s plan.";
  if (config.kind === "marketing_schedule") return "Complete today’s first marketing task.";
  if (config.kind === "research") return "Turn the strongest insight into messaging.";
  if (config.kind === "recommendation") return "Check foundation readiness before choosing a tool.";
  return deliverable.actionSteps[0];
}

function getShortWhy(deliverable: Deliverable) {
  const bottleneck = deliverable.cmoRecommendation.customerProblem;
  if (bottleneck.length > 80) return "It matches the current bottleneck.";
  return `${bottleneck} is the current bottleneck.`;
}

function getQuickPrompts(kind: UtilityKind, activeBlock: WorkBlockId) {
  if (kind === "content") {
    if (activeBlock === "create") return ["Create a Facebook post", "Make this shorter", "Turn this into LinkedIn", "Add a CTA"];
    if (activeBlock === "email") return ["Turn this into an email", "Write 3 subject lines", "Make it warmer", "Add a follow-up"];
    if (activeBlock === "hooks") return ["Give me 5 hooks", "Make them sharper", "Make hooks less generic", "Use a pain-first angle"];
    if (activeBlock === "video") return ["Write a 30-second script", "Give me 3 video ideas", "Add opening text", "Make it simpler"];
    return ["What should I post this week?", "Create a Facebook post", "Give me 5 hooks", "What should I do next?"];
  }

  if (kind === "offer") return ["Improve this offer", "Handle objections", "Write a stronger CTA", "What should I do next?"];
  if (kind === "message") return ["Write homepage copy", "Give me 5 headlines", "Improve this CTA", "Make it clearer"];
  if (kind === "icp") return ["Who is the best-fit customer?", "What pain matters most?", "Where do I find them?", "What should I do next?"];
  if (kind === "strategy_map") return ["What should I ignore?", "What comes first?", "Give me next 3 actions", "What is the risk?"];
  if (kind === "marketing_schedule") return ["Plan this week", "What should I do today?", "Make this realistic", "Adjust the plan"];
  if (kind === "research") return ["Summarize these notes", "Find objections", "Turn this into content ideas", "What should I research next?"];
  return ["Which tool is next?", "What is not ready yet?", "Review channel readiness", "What should I do next?"];
}

function buildSessionResponse(config: UtilityConfig, block: WorkBlock, deliverable: Deliverable, prompt: string) {
  const lower = prompt.toLowerCase();
  const primary = deliverable.copyPasteBlocks[0]?.value ?? deliverable.cmoRecommendation.recommendation;
  const next = deliverable.actionSteps[0];

  if (config.kind === "content") {
    if (lower.includes("email")) {
      return `Use this email draft:\n\nSubject: The gap behind ${deliverable.cmoRecommendation.customerProblem}\n\nIf ${deliverable.cmoRecommendation.customerProblem} keeps showing up, the next step is not more noise. It is a clearer first decision.\n\nHere is the practical move: ${next}\n\nCTA: Reply with "next step" and I will point you to the first fix.`;
    }
    if (lower.includes("hook")) {
      return `Here are 5 hooks tied to the current message:\n\n1. ${deliverable.cmoRecommendation.customerProblem} is not always the real issue.\n2. The expensive part is waiting too long to fix the first gap.\n3. Before you add another channel, fix this first.\n4. Most leads do not need more information. They need a clearer next step.\n5. If people understand the problem but still do nothing, your CTA may be carrying too much risk.`;
    }
    if (lower.includes("post") || block.id === "create") {
      return `Use this post draft:\n\n${primary}\n\nThe mistake is trying to push more traffic before the first message is clear. Start with one useful proof point, one simple next step, and one reason the buyer should act now.\n\nNext action: publish this as a short post, then feed replies or questions back into Content HQ.`;
    }
    return `Recommended next content move: ${next}\n\nWhy: ${deliverable.whyThisWorks}\n\nUse this asset first:\n${primary}`;
  }

  if (block.id === "history") {
    return `Use History to decide whether to reuse, revise, or replace an older asset. Current recommendation: ${deliverable.summary}\n\nNext action: compare the latest saved version with what you are trying to do now.`;
  }

  return `Here is the working recommendation inside ${config.navName}:\n\n${primary}\n\nWhy it matters: ${deliverable.whyThisWorks}\n\nNext action: ${next}`;
}

function getBlockOutputs(activeBlock: WorkBlockId, deliverable: Deliverable) {
  const primary = deliverable.copyPasteBlocks[0]?.value ?? deliverable.cmoRecommendation.recommendation;
  const secondary = deliverable.copyPasteBlocks[1]?.value ?? deliverable.cmoRecommendation.nextAction;

  const map: Record<WorkBlockId, { title: string; primary: string; items: string[] }> = {
    current: {
      title: "Best current asset",
      primary,
      items: [deliverable.whyThisWorks, `Next action: ${deliverable.actionSteps[0]}`],
    },
    themes: {
      title: "Recommended themes",
      primary: `Build around: ${deliverable.cmoRecommendation.customerProblem}`,
      items: [`Outcome theme: ${deliverable.cmoRecommendation.outcome}`, "Proof theme: show one clear example or result.", "Risk theme: make the next step feel safe."],
    },
    ideas: {
      title: "Ideas to use",
      primary: secondary,
      items: deliverable.actionSteps,
    },
    create: {
      title: "Ready-to-use draft",
      primary,
      items: ["Use this as the first draft.", "Keep it short.", `End with: ${deliverable.cmoRecommendation.nextAction}`],
    },
    email: {
      title: "Email angle",
      primary: `Subject: The gap behind ${deliverable.cmoRecommendation.customerProblem}`,
      items: [primary, "CTA: Reply with “next step” if you want the first fix."],
    },
    video: {
      title: "Short video script",
      primary: `Open with: "${deliverable.cmoRecommendation.customerProblem} is not always the real issue."`,
      items: ["Show the problem in one sentence.", `Explain the next move: ${deliverable.actionSteps[0]}`, "Close with one simple CTA."],
    },
    hooks: {
      title: "Hooks",
      primary: `${deliverable.cmoRecommendation.customerProblem} is not always the real issue. The expensive part is waiting too long to fix the first gap.`,
      items: ["Before you add another channel, fix this first.", "Most leads do not need more information. They need a clearer next step.", "If people hesitate here, the CTA is probably carrying too much risk."],
    },
    results: {
      title: "Campaign result notes",
      primary: "Paste what happened, what people asked, what got clicks, what got replies, or what fell flat.",
      items: ["Use real feedback, not strategy language.", "Simple Marketing HQ will turn it into the next improvement."],
    },
    recommendation: {
      title: "CMO recommendation",
      primary: deliverable.cmoRecommendation.recommendation,
      items: [deliverable.cmoRecommendation.why, deliverable.cmoRecommendation.nextAction],
    },
    feed: {
      title: "New information",
      primary: "Add raw customer, campaign, competitor, or sales information.",
      items: ["The app will translate it into an improved recommendation.", "No marketing jargon needed."],
    },
    tests: {
      title: "Tests",
      primary: deliverable.tests[0]?.title ?? "Test the current recommendation.",
      items: deliverable.tests.map((test) => `${test.where}: watch ${test.measure}`),
    },
    use: {
      title: "Use it now",
      primary: deliverable.useItNow[0] ?? "Use this in the next utility.",
      items: deliverable.useItNow,
    },
    history: {
      title: "History",
      primary: "Open saved versions from this Business / Client.",
      items: [],
    },
  };

  return map[activeBlock];
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
