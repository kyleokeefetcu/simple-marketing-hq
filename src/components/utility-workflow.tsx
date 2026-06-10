"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  eyebrow: string;
  title: string;
  intro: string;
  questions: { id: string; label: string; placeholder: string; defaultValue?: string }[];
  nextHref: string;
  nextLabel: string;
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
  assessment: string;
  currentVersion: string;
  improvedVersion: string;
  whyBetter: string;
  sections: { title: string; items: string[] }[];
  actionSteps: string[];
  deploymentGuidance: string[];
  copyPasteBlocks: { label: string; value: string }[];
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
    eyebrow: "ICP Builder / Audience Match",
    title: "Define the customer your marketing should be built around.",
    intro: "Use saved diagnostic context plus a few clarifying answers to build a practical best-fit customer profile.",
    questions: [
      { id: "bestCustomer", label: "Who do you want more customers like?", placeholder: "Example: busy families, agency owners, CFOs, homeowners with urgent repairs..." },
      { id: "badFit", label: "Who is not a good fit?", placeholder: "Example: price shoppers, no urgency, too small, too complex, poor fit..." },
      { id: "trigger", label: "What makes them buy now?", placeholder: "Example: deadline, pain getting worse, missed opportunity, compliance issue..." },
    ],
    nextHref: "/offer-builder",
    nextLabel: "Build offer from this ICP",
  },
  offer: {
    kind: "offer",
    roleId: "offer_builder",
    assetType: "offer",
    eyebrow: "Offer Builder",
    title: "Turn what you sell into an offer people understand.",
    intro: "Clarify the customer outcome, reduce risk, and make the first step easier to say yes to.",
    questions: [
      { id: "currentOffer", label: "What are you currently offering or saying?", placeholder: "Example: free quote, strategy call, starter package, monthly service..." },
      { id: "outcome", label: "What outcome should the customer want most?", placeholder: "Example: avoid expensive surprises, get more booked calls, save time..." },
      { id: "riskReducer", label: "What can reduce hesitation?", placeholder: "Example: audit first, clear next step, guarantee, proof, no-pressure consult..." },
    ],
    nextHref: "/message-builder",
    nextLabel: "Turn this into messaging",
  },
  message: {
    kind: "message",
    roleId: "message_builder",
    assetType: "message",
    eyebrow: "Message Builder",
    title: "Say it in words customers understand.",
    intro: "Turn real customer problems and call/message language into a sharper headline, pitch, CTA, and before/after message comparison.",
    questions: [
      { id: "problemPeopleComeFor", label: "What problem do people usually come to you for?", placeholder: "Example: They are confused by their options, losing leads, worried about cost, under a deadline..." },
      { id: "customerWords", label: "What do customers say when they call/message you?", placeholder: "Example: I need help fast, I am not sure what I need, this keeps costing me time..." },
      { id: "moreCustomersLike", label: "What type of customer do you want more of?", placeholder: "Example: homeowners with urgent repairs, busy owners, high-trust buyers, growing teams..." },
    ],
    nextHref: "/content-engine",
    nextLabel: "Create content from this message",
  },
  content: {
    kind: "content",
    roleId: "content_engine",
    assetType: "content",
    eyebrow: "Content Engine",
    title: "Create useful content assets, not random posts.",
    intro: "Generate hooks, posts, emails, scripts, campaign ideas, and lead magnets tied to customer pain and your offer.",
    questions: [
      { id: "contentGoal", label: "What should the content help accomplish?", placeholder: "Generate leads, explain the problem, build trust, announce an offer..." },
      { id: "channel", label: "What channel is this for?", placeholder: "LinkedIn, Instagram, email, YouTube, ads, website, sales follow-up..." },
      { id: "angle", label: "Any topic or objection to focus on?", placeholder: "Price, trust, timing, urgency, hidden risk, why now..." },
    ],
    nextHref: "/marketing-schedule",
    nextLabel: "Put this into a weekly plan",
  },
  strategy_map: {
    kind: "strategy_map",
    roleId: "strategy_map",
    assetType: "strategy_map",
    eyebrow: "Strategy Map",
    title: "Decide what to build first.",
    intro: "Turn the diagnostic and utility work into an order of operations for the next 7 and 30 days.",
    questions: [
      { id: "priority", label: "What feels most urgent right now?", placeholder: "Offer, message, content, lead capture, follow-up, referrals, traffic..." },
      { id: "constraint", label: "What constraint should the plan respect?", placeholder: "Time, budget, team capacity, no ads yet, only one channel..." },
    ],
    nextHref: "/marketing-schedule",
    nextLabel: "Build the weekly rhythm",
  },
  marketing_schedule: {
    kind: "marketing_schedule",
    roleId: "marketing_schedule",
    assetType: "marketing_schedule",
    eyebrow: "Marketing Schedule",
    title: "Turn strategy into a weekly rhythm.",
    intro: "Create a simple operating week for content, campaign prep, follow-up, asset creation, and review.",
    questions: [
      { id: "hours", label: "How much time can you spend each week?", placeholder: "Example: 2 hours, 5 hours, one afternoon, 30 minutes per day..." },
      { id: "publishing", label: "What can you realistically publish or send?", placeholder: "Posts, emails, videos, follow-ups, landing page edits..." },
    ],
    nextHref: "/content-engine",
    nextLabel: "Create this week's content",
  },
  research: {
    kind: "research",
    roleId: "research_hub",
    assetType: "research",
    eyebrow: "Research Hub",
    title: "Research the customer before launching the channel.",
    intro: "Explore customer pains, objections, competitors, FAQs, offer angles, proof gaps, and content ideas.",
    questions: [
      { id: "researchTopic", label: "What do you want to understand better?", placeholder: "Audience pains, objections, competitor claims, FAQs, proof gaps..." },
      { id: "competitor", label: "Any competitor or alternative to compare against?", placeholder: "A competitor name, DIY, current provider, doing nothing..." },
    ],
    nextHref: "/message-builder",
    nextLabel: "Turn research into messaging",
  },
  recommendation: {
    kind: "recommendation",
    roleId: "buyer_messaging_engine",
    assetType: "recommendation",
    eyebrow: "Recommendations",
    title: "Choose outside tools only after the foundation is clear.",
    intro: "Get a focused channel/tool recommendation based on your offer, ICP, message, assets, and next bottleneck.",
    questions: [
      { id: "channelInterest", label: "What channel or tool are you considering?", placeholder: "Cold email, SEO, paid ads, social content, CRM, booking, website chat..." },
      { id: "readiness", label: "What asset do you already have ready?", placeholder: "Offer, landing page, email script, lead magnet, proof, follow-up workflow..." },
    ],
    nextHref: "/strategy-map",
    nextLabel: "Review launch order",
  },
};

export function UtilityWorkflow({ kind }: { kind: UtilityKind }) {
  const config = configs[kind];
  const [result] = useState<LaunchPadResult | null>(() => getStoredResult());
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [latestDiagnostic, setLatestDiagnostic] = useState<SavedDiagnosticSummary | null>(null);
  const [priorAssets, setPriorAssets] = useState<Partial<Record<MarketingAssetType, MarketingAssetSummary>>>({});
  const [answers, setAnswers] = useState<Record<string, string>>(() => Object.fromEntries(config.questions.map((question) => [question.id, question.defaultValue ?? ""])));
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [status, setStatus] = useState("Load or select a Business / Client to tailor this utility.");

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const context = useMemo<UtilityContext>(() => ({ result, business: selectedBusiness, latestDiagnostic, priorAssets }), [result, selectedBusiness, latestDiagnostic, priorAssets]);

  useEffect(() => {
    async function loadContext() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setStatus("Connect Supabase to load saved business context. You can still generate from local diagnostic context.");
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
        const [diagnostics, assetGroups] = await Promise.all([
          getSavedDiagnostics(supabase, nextBusinessId),
          Promise.all(assetTypes.map((assetType) => getMarketingAssets(supabase, nextBusinessId, assetType))),
        ]);
        const latestAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>> = {};
        assetGroups.forEach((assets, index) => {
          if (assets[0]) latestAssets[assetTypes[index]] = assets[0];
        });
        setLatestDiagnostic(diagnostics[0] ?? null);
        setPriorAssets(latestAssets);
        setStatus("Saved business context loaded.");
      } catch (error) {
        setStatus(`Could not load full context: ${(error as Error).message}`);
      }
    }

    void loadContext();
  }, []);

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    setDeliverable(null);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);

    const supabase = createBrowserSupabaseClient();
    if (!supabase || !businessId) return;

    try {
      const [diagnostics, assetGroups] = await Promise.all([
        getSavedDiagnostics(supabase, businessId),
        Promise.all(assetTypes.map((assetType) => getMarketingAssets(supabase, businessId, assetType))),
      ]);
      const latestAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>> = {};
      assetGroups.forEach((assets, index) => {
        if (assets[0]) latestAssets[assetTypes[index]] = assets[0];
      });
      setLatestDiagnostic(diagnostics[0] ?? null);
      setPriorAssets(latestAssets);
      setStatus("Switched business context.");
    } catch (error) {
      setStatus(`Could not switch context: ${(error as Error).message}`);
    }
  }

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeliverable(buildDeliverable(config, context, answers));
  }

  const generated = deliverable ?? buildPreviewDeliverable(config, context);
  const businessName = context.business?.name || result?.businessName || "Selected business";
  const assetTitle = `${businessName} ${config.eyebrow}`;
  const scopedHref = (href: string) => (selectedBusinessId ? `${href}?businessId=${selectedBusinessId}` : href);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href={scopedHref("/dashboard")} className="text-sm font-semibold text-cyan-800">
          Back to Command Center
        </Link>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{config.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">{config.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{config.intro}</p>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Step 1 - Context</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{businessName}</h2>
            <div className="mt-4 grid gap-3">
              <ContextRow label="Industry/category" value={result?.industryFit || result?.answers.industryLabel || "Not confirmed yet"} />
              <ContextRow label="What they sell" value={result?.answers.whatSelling || context.business?.services || "Not confirmed yet"} />
              <ContextRow label="Current audience" value={result?.answers.targetCustomer || context.business?.idealCustomer || "Not confirmed yet"} />
              <ContextRow label="Diagnostic bottleneck" value={context.latestDiagnostic?.biggestBottleneck || result?.biggestBottleneck || "Run or update the diagnostic"} />
              <ContextRow label="Latest recommended action" value={context.latestDiagnostic?.nextMove || result?.nextMove || "Choose one utility and generate a deliverable"} />
              {config.kind === "offer" ? (
                <ContextRow label="Latest Market Demand Check" value={context.priorAssets.market_demand_check?.summary || "Run Market Demand Check to sharpen this offer before deployment."} />
              ) : null}
              {config.kind === "message" ? (
                <>
                  <ContextRow label="Latest Buyer Psychology Audit" value={context.priorAssets.buyer_psychology_audit?.summary || "Run Buyer Psychology Audit to understand what buyers need to believe before they act."} />
                  <ContextRow label="Latest Problem Narrative" value={context.priorAssets.problem_narrative?.summary || "Run Problem Narrative Builder to clarify the customer problem before writing copy."} />
                  <ContextRow label="Latest Buyer Messaging Output" value={context.priorAssets.buyer_messaging_output?.summary || "Run Buyer Messaging Engine to generate ready-to-use copy for this business."} />
                </>
              ) : null}
              {config.kind === "content" ? (
                <>
                  <ContextRow label="Latest Problem Narrative" value={context.priorAssets.problem_narrative?.summary || "Run Problem Narrative Builder to create stronger content angles from the customer's real problem."} />
                  <ContextRow label="Latest Messaging Sequence" value={context.priorAssets.messaging_sequence?.summary || "Run Messaging Sequence Builder to turn campaign ideas into a logical message order."} />
                </>
              ) : null}
              {config.kind === "marketing_schedule" ? (
                <ContextRow label="Latest Messaging Sequence" value={context.priorAssets.messaging_sequence?.summary || "Run Messaging Sequence Builder to turn the schedule into ordered campaign steps."} />
              ) : null}
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700" htmlFor="business-context">
                Business / Client
              </label>
              <select
                id="business-context"
                value={selectedBusinessId}
                onChange={(event) => void handleBusinessChange(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
              >
                <option value="">Use local diagnostic context</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm leading-6 text-slate-600">{status}</p>
            </div>
          </article>

          <form onSubmit={handleGenerate} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Step 2 - Focus</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Answer 1-3 quick questions.</h2>
            <div className="mt-4 grid gap-4">
              {config.questions.map((question) => (
                <label key={question.id} className="block">
                  <span className="text-sm font-semibold text-slate-700">{question.label}</span>
                  <input
                    value={answers[question.id] ?? ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                    placeholder={question.placeholder}
                    className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
              ))}
            </div>
            <button type="submit" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              <Sparkles size={18} aria-hidden="true" />
              Generate deliverable
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-lg border border-cyan-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Generated deliverable</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{generated.title}</h2>
          {!deliverable ? <p className="mt-2 text-sm leading-6 text-slate-600">Preview shown. Answer the focus questions and generate to tailor this output.</p> : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <InfoCard title="Current-state assessment" value={generated.assessment} />
            <InfoCard title="Current / before" value={generated.currentVersion} />
            <InfoCard title="Improved / after" value={generated.improvedVersion} highlight />
          </div>

          <article className="mt-4 rounded-md bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-950">Why this is better</p>
            <p className="mt-2 text-sm leading-6 text-cyan-900">{generated.whyBetter}</p>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {generated.sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
              <div className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <p key={item} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {item}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Copy/paste-ready blocks</h2>
            <div className="mt-4 grid gap-3">
              {generated.copyPasteBlocks.map((block) => (
                <div key={block.label} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-500">{block.label}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-900">{block.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Do this next</h2>
            <div className="mt-4 grid gap-3">
              {generated.actionSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-slate-200 p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-cyan-900 text-sm font-semibold text-white">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">Use it here</h3>
            <div className="mt-3 grid gap-2">
              {generated.deploymentGuidance.map((item) => (
                <p key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} aria-hidden="true" />
                  {item}
                </p>
              ))}
            </div>
            <Link href={scopedHref(generated.suggestedNextUtility.href)} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              {generated.suggestedNextUtility.label}
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
              answers,
              business: context.business,
              latestDiagnostic: context.latestDiagnostic,
              launchpadResult: context.result,
              priorAssetTitles: Object.fromEntries(Object.entries(context.priorAssets).map(([key, asset]) => [key, asset?.title])),
            }}
            output={deliverable as unknown as Record<string, unknown>}
            prompt={{
              purpose: "Create a current-state assessment, improved deliverable, before/after comparison, action steps, deployment guidance, and suggested next utility.",
              utility: config.eyebrow,
              role_id: config.roleId,
            }}
          />
        ) : (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-1 text-cyan-800" size={22} aria-hidden="true" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Save history appears after generation.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Generate a tailored deliverable first, then save it to the selected Business / Client history.</p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function buildPreviewDeliverable(config: UtilityConfig, context: UtilityContext) {
  return buildDeliverable(config, context, {});
}

function buildDeliverable(config: UtilityConfig, context: UtilityContext, input: Record<string, string>): Deliverable {
  const industry = getIndustryProfile(context.result?.answers.industryCategory);
  const businessName = context.business?.name || context.result?.businessName || "the business";
  const sell = input.currentOffer || input.contentGoal || context.result?.answers.whatSelling || context.business?.services || "the core offer";
  const target = input.bestCustomer || input.moreCustomersLike || context.result?.answers.targetCustomer || context.business?.idealCustomer || "best-fit customers";
  const customerProblem = input.problemPeopleComeFor || input.customerWords || "";
  const outcome = input.outcome || context.result?.customerDesiredOutcome || inferCustomerWant(customerProblem, target);
  const problem = customerProblem || input.trigger || input.angle || context.result?.answers.marketingFrustration || context.result?.biggestBottleneck || "the problem that makes people hesitate";
  const channel = input.channel || input.channelInterest || context.result?.recommendedFirstChannel || industry.channels[0];
  const proof = context.result?.answers.trustFactor || industry.proof;
  const bottleneck = context.latestDiagnostic?.biggestBottleneck || context.result?.biggestBottleneck || "the foundation needs clearer priority";
  const nextMove = context.latestDiagnostic?.nextMove || context.result?.nextMove || "build one clear asset before adding more channel activity";
  const customerWords = input.customerWords || "They want the problem understood quickly, the next step made clear, and the risk of choosing wrong reduced.";
  const likelyWantMost = inferCustomerWant(problem, target);
  const whyTheyWantIt = `People usually do not want more information first. They want relief from ${problem.toLowerCase()} and a clear path toward ${likelyWantMost.toLowerCase()}.`;
  const howToMessageIt = `${businessName} helps ${target} fix ${problem} so they can get ${likelyWantMost} without guessing what to do next.`;

  switch (config.kind) {
    case "icp":
      return {
        title: `${businessName} best-fit customer profile`,
        summary: `Best-fit customer: ${target}. Buying trigger: ${problem}.`,
        assessment: `Current ICP clarity depends on whether the business can name who has the urgent problem, budget, authority, trust requirement, and reason to act now.`,
        currentVersion: context.result?.answers.primaryCustomer || "Audience is broad or only loosely defined.",
        improvedVersion: `${target} who are dealing with ${problem} and want ${outcome}. They are a strong fit when they have urgency, budget, decision authority, and respond to ${proof}.`,
        whyBetter: "It narrows the audience from a broad market to a buying situation. That makes offers, content, proof, channels, and follow-up easier to choose.",
        sections: [
          { title: "Best-fit customer", items: [`Buyer type: ${target}`, `Urgent pain: ${problem}`, `Desired outcome: ${outcome}`] },
          { title: "Bad-fit warning", items: [input.badFit || "Avoid buyers with low urgency, unclear budget, no decision authority, or poor fit for the core offer.", "Do not build campaigns around customers who need heavy convincing before they feel the pain."] },
          { title: "Buying triggers", items: [input.trigger || industry.triggers[0], industry.triggers[1], "A visible cost of waiting or doing nothing."] },
          { title: "Objections and proof", items: [industry.objections[0], industry.objections[1], `Proof needed: ${proof}`] },
          { title: "Channel fit", items: industry.channels.slice(0, 3) },
          { title: "Message angles", items: [`The hidden cost of ${problem}.`, `How ${target} can reach ${outcome} without extra confusion.`, `What to check before choosing a provider or tool.`] },
        ],
        actionSteps: ["Use the improved ICP as the filter for every offer and content idea.", "Remove one bad-fit audience from your next campaign.", "Open Offer Builder and tailor the offer to this buyer's trigger."],
        deploymentGuidance: ["Use the ICP in ad targeting and landing page copy.", "Use pains and objections as content topics.", "Use proof requirements near CTAs and sales follow-up."],
        copyPasteBlocks: [
          { label: "ICP statement", value: `${businessName} is best positioned for ${target} who need ${outcome} because ${problem}.` },
          { label: "Bad-fit filter", value: `Not a fit: ${input.badFit || "buyers without urgency, budget, authority, or trust in the process."}` },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
    case "offer":
      return {
        title: `${businessName} improved offer`,
        summary: `Improved offer: ${outcome} for ${target}.`,
        assessment: `The current offer should become more specific about the outcome, the buyer pain, the first step, and the reason to act now.`,
        currentVersion: input.currentOffer || context.result?.answers.currentOffer || sell,
        improvedVersion: `${outcome} for ${target}, starting with a simple first step that identifies ${problem} and shows the safest next move.`,
        whyBetter: "It shifts from a generic transaction to a specific outcome and buying reason. The customer can see why the offer matters now.",
        sections: [
          { title: "Offer diagnosis", items: [`Current bottleneck: ${bottleneck}`, `The offer should make ${outcome} feel specific, believable, and easier to start.`] },
          { title: "Value stack", items: [`Core: ${sell}`, `Fast-start: quick review or first step`, `Proof: ${proof}`, `Risk reducer: ${input.riskReducer || "clear process, no-pressure next step, or guarantee idea"}`] },
          { title: "Offer framing", items: [`Dream outcome: ${outcome}`, `Painful problem: ${problem}`, "Why now: waiting keeps the risk or missed opportunity alive."] },
          { title: "CTA options", items: ["Find the gap", "Start with a quick review", "Get the recommended next step"] },
        ],
        actionSteps: ["Replace the vague offer line with the improved offer.", "Add one proof point directly under the CTA.", "Use Message Builder to turn this into homepage and ad copy."],
        deploymentGuidance: ["Homepage hero CTA", "Landing page opener", "Ad hook", "Email subject line", "Sales follow-up opener"],
        copyPasteBlocks: [
          { label: "Short offer statement", value: `${businessName} helps ${target} get ${outcome} by solving ${problem} with ${sell}.` },
          { label: "CTA", value: input.riskReducer ? `Start with ${input.riskReducer}.` : "Start with a quick review and get the recommended next step." },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
    case "message":
      return {
        title: `${businessName} messaging kit`,
        summary: `Customer likely wants: ${likelyWantMost}.`,
        assessment: "The message should make the customer feel understood before it explains the product or service.",
        currentVersion: input.customerWords || context.result?.answers.homepageHeadline || "Generic service, product, or quote language.",
        improvedVersion: howToMessageIt,
        whyBetter: "It names the buyer, the problem, the desired result, and the reduced friction in one plain-language message.",
        sections: [
          { title: "Here is what your customers likely want most", items: [likelyWantMost, `Customer language to listen for: ${customerWords}`] },
          { title: "Here is why", items: [whyTheyWantIt, `The best message should connect ${problem} to a better outcome before it talks about features.`] },
          { title: "Here is how to message it", items: [howToMessageIt, `Short version: Fix ${problem} with a clearer next step.`] },
          { title: "Positioning statement", items: [`For ${target}, ${businessName} is the practical way to solve ${problem} and move toward ${likelyWantMost}.`] },
          { title: "Homepage copy", items: [`Headline: ${businessName} helps ${target} fix ${problem}.`, `Subheadline: Get ${likelyWantMost} with a clearer first step and less uncertainty.`, "CTA: Get the recommended next step."] },
          { title: "CTA options", items: ["Find the gap", "Get your next step", "Start with a quick review", "See what to fix first"] },
          { title: "Follow-up lines", items: [`The reason I am reaching out is that ${problem} can quietly get more expensive when it is ignored.`, `The next step is small: confirm the gap, then choose the right fix.`] },
        ],
        actionSteps: ["Use the improved headline where attention matters most.", "Put the CTA near one proof point.", "Open Content Engine to turn this into hooks and emails."],
        deploymentGuidance: [input.channel || "Homepage hero", "Landing page", "Email opener", "Sales script", "Short-form post text"],
        copyPasteBlocks: [
          { label: "Homepage headline", value: `${businessName} helps ${target} fix ${problem}.` },
          { label: "Customer-facing message", value: howToMessageIt },
          { label: "Elevator pitch", value: `We help ${target} who are dealing with ${problem}. The first step is simple: identify the gap, recommend the next move, and make it easier to get ${likelyWantMost}.` },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
    case "content":
      return {
        title: `${businessName} content and campaign ideas`,
        summary: `Content built for ${channel}: ${problem}.`,
        assessment: "Content should stop attention, raise a real pain, teach one useful idea, and move toward the next business action.",
        currentVersion: "Posting general tips or promotional updates without a clear buyer pain or next step.",
        improvedVersion: `Create ${channel} content around "${problem}" and connect it to ${outcome}, then invite the audience to take one small next step.`,
        whyBetter: "It turns content from filler into a sales-support asset tied to urgency, proof, and a clear action.",
        sections: [
          { title: "Content angles", items: [`The hidden cost of ${problem}`, `What ${target} should check before choosing help`, `Why ${outcome} starts with one clear first step`] },
          { title: "Stop-stack hooks", items: [`Visual: show the moment ${problem} becomes visible.`, `Text: "${problem} is not the real issue. The delay is."`, `Statement: Most people wait until this costs more than it should.`] },
          { title: "Short-form posts", items: [`3 signs ${target} should fix ${problem} now`, `The first question to ask before buying ${sell}`, `Why ${outcome} does not start with more traffic`] },
          { title: "Emails and scripts", items: [`Subject: The gap hiding behind ${problem}`, `Email opener: If ${problem} keeps showing up, the next step is not more noise. It is a clearer decision.`, `CTA: Reply with "next step" and I will point you to the first fix.`] },
          { title: "Lead magnet ideas", items: industry.leadMagnets.slice(0, 3) },
          { title: "Campaign idea", items: [`Run a 7-day education campaign around ${problem}, proof, risk, and the smallest next step.`] },
        ],
        actionSteps: ["Pick one hook and one email from this output.", "Publish or send the simplest version this week.", "Use Marketing Schedule to create the weekly rhythm."],
        deploymentGuidance: [channel, "Email follow-up", "Website section", "Sales enablement", "Retargeting/ad creative later"],
        copyPasteBlocks: [
          { label: "Post hook", value: `${problem} is not always the real problem. The expensive part is waiting too long to fix the first gap.` },
          { label: "Email", value: `Subject: The gap behind ${problem}\n\nIf ${problem} keeps showing up, the next step is not more noise. It is a clearer first decision. Start by identifying the gap, then choose the safest next move toward ${outcome}.` },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
    case "strategy_map":
      return {
        title: `${businessName} strategy map`,
        summary: `Highest-leverage objective: ${nextMove}.`,
        assessment: `The business should avoid adding channels until the next bottleneck is tied to an asset, owner, and timeline.`,
        currentVersion: input.priority || bottleneck,
        improvedVersion: `${nextMove}. Build the missing foundation asset first, then deploy through ${channel} when the message and follow-up are ready.`,
        whyBetter: "It creates an order of operations, so activity does not turn into scattered marketing work.",
        sections: [
          { title: "Current bottleneck", items: [bottleneck] },
          { title: "Highest-leverage objective", items: [nextMove] },
          { title: "Next 7 days", items: ["Clarify the offer", "Write the message", "Create one proof-backed content asset", "Add or improve the CTA"] },
          { title: "Next 30 days", items: ["Build a repeatable content and follow-up rhythm", "Prepare one campaign asset", "Review objections weekly"] },
          { title: "Missing assets", items: ["Offer statement", "ICP statement", "Proof point", "CTA", "Follow-up script"] },
          { title: "What not to do yet", items: ["Do not add new channels before the offer and message are clear.", "Do not publish broad content that does not support the bottleneck."] },
        ],
        actionSteps: ["Choose one missing asset.", "Build it in the matching utility.", "Use Marketing Schedule to assign the work this week."],
        deploymentGuidance: ["Weekly planning", "Team handoff", "Agency/client review", "Campaign prep"],
        copyPasteBlocks: [
          { label: "Strategy objective", value: nextMove },
          { label: "Order of operations", value: "ICP -> Offer -> Message -> Content -> Schedule -> Channel deployment." },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
    case "marketing_schedule":
      return {
        title: `${businessName} weekly marketing rhythm`,
        summary: `Weekly focus: ${nextMove}.`,
        assessment: "The schedule should create the foundation assets and review feedback, not just fill a calendar.",
        currentVersion: input.hours || "No clear weekly marketing rhythm yet.",
        improvedVersion: `Use ${input.hours || "a focused weekly block"} to build one foundation asset, publish one useful message, follow up with interested leads, and review what changed.`,
        whyBetter: "It turns marketing into a repeatable operating rhythm that a busy owner can actually follow.",
        sections: [
          { title: "Weekly rhythm", items: ["Monday: choose one customer pain and one offer angle.", "Tuesday: draft one post, hook, or email.", "Wednesday: refine CTA and proof.", "Thursday: publish or send.", "Friday: review leads, replies, objections, and next asset."] },
          { title: "Campaign prep", items: ["Offer headline", "ICP pain statement", "Proof point", "Lead magnet or CTA", "Follow-up script"] },
          { title: "Follow-up tasks", items: ["Reply to all active leads", "Send one useful proof point", "Invite the next small action"] },
          { title: "Review questions", items: ["What created conversations?", "What objection repeated?", "Where did people hesitate?", "What should improve next week?"] },
        ],
        actionSteps: ["Pick the weekly time block.", "Choose one content asset.", "Review results before adding another channel."],
        deploymentGuidance: [input.publishing || "Content channel", "Email follow-up", "Sales task list", "Weekly owner review"],
        copyPasteBlocks: [
          { label: "This week's plan", value: `Focus: ${nextMove}\nAsset: one proof-backed message\nReview: leads, replies, objections, and next action.` },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
    case "research":
      return {
        title: `${businessName} research brief`,
        summary: `Research focus: ${input.researchTopic || problem}.`,
        assessment: "Research should reveal customer language, objections, alternatives, proof gaps, and content angles.",
        currentVersion: input.researchTopic || "Research focus is not narrowed yet.",
        improvedVersion: `Research why ${target} struggle with ${problem}, what they compare against, and what proof they need before choosing ${sell}.`,
        whyBetter: "It turns research into usable marketing inputs instead of a pile of notes.",
        sections: [
          { title: "Audience pain research", items: [`They want ${outcome}.`, `They worry about ${industry.objections[0]}.`, `They start looking when ${industry.triggers[0]}.`] },
          { title: "Objection research", items: industry.objections.slice(0, 4) },
          { title: "Competitor positioning notes", items: [`Compare against: ${input.competitor || "doing nothing, DIY, or current provider"}.`, "Look for promises, proof, CTA clarity, and missing objections."] },
          { title: "FAQ ideas", items: ["How quickly can this help?", "What does it cost?", "Who is this best for?", "What happens after I inquire?"] },
          { title: "Content idea bank", items: [`Why ${problem} gets expensive`, `What to check before buying ${sell}`, `How to know if you are ready for ${outcome}`] },
          { title: "Proof gaps", items: [`Proof needed: ${proof}`, "Add a result, example, review, case story, or clear process step."] },
        ],
        actionSteps: ["Collect 5 customer phrases.", "Review 3 competitor pages.", "Turn repeated objections into message and content assets."],
        deploymentGuidance: ["Message Builder", "Content Engine", "Sales scripts", "Landing page FAQ", "Offer proof section"],
        copyPasteBlocks: [
          { label: "Research question", value: `What does ${target} believe about ${problem} before they are ready to buy ${sell}?` },
          { label: "FAQ seed", value: `How do I know if ${sell} is right for my situation?` },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
    case "recommendation":
      return {
        title: `${businessName} channel/tool recommendation`,
        summary: `Next channel/tool to consider: ${channel}.`,
        assessment: "Recommendations should come after the offer, message, proof, and follow-up are clear enough to launch.",
        currentVersion: input.channelInterest || "Considering channels before confirming foundation readiness.",
        improvedVersion: `Based on the current foundation, consider ${channel} only after the offer, ICP, message, CTA, proof, and follow-up asset are ready.`,
        whyBetter: "It prevents tool shopping and keeps the business focused on the channel most likely to benefit from the foundation work.",
        sections: [
          { title: "Recommended next channel/tool", items: [channel, `Best fit when the next move is: ${nextMove}`] },
          { title: "Foundation readiness", items: [`Offer: ${context.priorAssets.offer ? "saved" : "needs review"}`, `Message: ${context.priorAssets.message ? "saved" : "needs review"}`, `Content/campaign asset: ${context.priorAssets.content ? "saved" : "needs review"}`] },
          { title: "Do before deploying", items: ["Confirm ICP", "Sharpen offer", "Write message", "Prepare follow-up", "Add proof near CTA"] },
          { title: "Avoid for now", items: ["Do not add 5 tools at once.", "Do not spend on traffic before the CTA and follow-up are ready."] },
        ],
        actionSteps: ["Fill the missing foundation asset first.", "Use Strategy Map to confirm launch order.", "Then evaluate one external tool/channel."],
        deploymentGuidance: ["Tool selection", "Channel planning", "Partner referral", "Agency handoff"],
        copyPasteBlocks: [
          { label: "Recommendation", value: `Based on your foundation, the next channel/tool to consider is ${channel}. Do not deploy it until the offer, message, proof, CTA, and follow-up are ready.` },
        ],
        suggestedNextUtility: { label: config.nextLabel, href: config.nextHref },
      };
  }
}

function inferCustomerWant(problem: string, target: string) {
  const normalized = problem.toLowerCase();
  if (normalized.includes("lead") || normalized.includes("call") || normalized.includes("book")) return "more qualified conversations and booked calls";
  if (normalized.includes("time") || normalized.includes("busy") || normalized.includes("fast")) return "a faster answer and less wasted time";
  if (normalized.includes("cost") || normalized.includes("expensive") || normalized.includes("price")) return "confidence before spending money";
  if (normalized.includes("trust") || normalized.includes("scam") || normalized.includes("risk")) return "a provider they can trust";
  if (normalized.includes("confus") || normalized.includes("not sure") || normalized.includes("options")) return "clarity on the right next step";
  if (normalized.includes("urgent") || normalized.includes("deadline") || normalized.includes("emergency")) return "the problem handled quickly and correctly";
  return `${target} want a clear answer, less risk, and a next step they can trust`;
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function InfoCard({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <article className={`rounded-md p-4 ${highlight ? "bg-cyan-50" : "bg-slate-50"}`}>
      <p className={`text-sm font-semibold ${highlight ? "text-cyan-950" : "text-slate-500"}`}>{title}</p>
      <p className={`mt-2 text-sm leading-6 ${highlight ? "text-cyan-900" : "text-slate-800"}`}>{value}</p>
    </article>
  );
}
