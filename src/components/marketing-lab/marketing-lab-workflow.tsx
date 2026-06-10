"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { ArrowRight, Beaker, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AssetSavePanel } from "@/components/asset-save-panel";
import { promptRegistry } from "@/lib/ai/prompts/registry";
import type { PromptPack, PromptRoleId } from "@/lib/ai/prompts/shared-output-rules";
import { getStoredResult, type LaunchPadResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getMarketingAssets, type MarketingAssetSummary, type MarketingAssetType } from "@/lib/supabase/assets";
import { getBusinesses, getSavedDiagnostics, type BusinessSummary, type SavedDiagnosticSummary } from "@/lib/supabase/diagnostics";

type LabDeliverable = {
  title: string;
  summary: string;
  current_state_assessment: string;
  market_demand_read?: {
    demand_strength: string;
    urgency_level: string;
    buyer_awareness: string;
    pain_clarity: string;
    willingness_to_pay_signal: string;
    confidence_level: string;
  };
  demand_diagnosis?: {
    what_appears_strong: string[];
    what_appears_weak: string[];
    what_is_too_generic: string[];
    what_is_unclear: string[];
    what_may_be_missing: string[];
  };
  buyer_motivation?: {
    likely_painful_problem: string;
    likely_desired_outcome: string;
    trigger_events: string[];
    why_they_would_act_now: string;
    current_alternatives: string[];
  };
  offer_improvement?: {
    current_before_offer: string;
    improved_after_offer: string;
    sharper_offer_statement: string;
    value_stack: string[];
    risk_reducer: string;
    why_now_angle: string;
    cta: string;
  };
  before_after: {
    before: string;
    after: string;
    why_better: string;
    where_to_use: string[];
  };
  sections: { title: string; items: string[] }[];
  next_3_actions: string[];
  recommended_next_utility: string;
  copy_paste_deliverables: { label: string; value: string }[];
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
  "marketing_reality_check",
  "market_demand_check",
  "problem_narrative_builder",
  "messaging_sequence_builder",
  "buyer_messaging_engine",
];

export function MarketingLabWorkflow({ roleId }: { roleId: PromptRoleId }) {
  const prompt = promptRegistry[roleId];
  const [result] = useState<LaunchPadResult | null>(() => getStoredResult());
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [latestDiagnostic, setLatestDiagnostic] = useState<SavedDiagnosticSummary | null>(null);
  const [priorAssets, setPriorAssets] = useState<Partial<Record<MarketingAssetType, MarketingAssetSummary>>>({});
  const [answers, setAnswers] = useState<Record<string, string>>(() => Object.fromEntries(prompt.input_fields.map((field) => [field.id, ""])));
  const [deliverable, setDeliverable] = useState<LabDeliverable | null>(null);
  const [status, setStatus] = useState("Load or select a Business / Client to tailor this audit.");

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const businessName = selectedBusiness?.name || result?.businessName || "Selected business";
  const scopedHref = (href: string) => (selectedBusinessId ? `${href}?businessId=${selectedBusinessId}` : href);

  const loadBusinessContext = useCallback(async (businessId: string) => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

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
  }, []);

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
          setStatus("Create or select a Business / Client to tailor this audit.");
          return;
        }

        window.localStorage.setItem("simple-marketing-hq:selected-business-id", nextBusinessId);
        await loadBusinessContext(nextBusinessId);
        setStatus("Saved business context loaded.");
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
    if (!businessId) return;

    try {
      await loadBusinessContext(businessId);
      setStatus("Switched business context.");
    } catch (error) {
      setStatus(`Could not switch context: ${(error as Error).message}`);
    }
  }

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeliverable(buildLabDeliverable(prompt, {
      answers,
      result,
      business: selectedBusiness,
      latestDiagnostic,
      priorAssets,
    }));
  }

  const generated = useMemo(
    () => deliverable ?? buildLabDeliverable(prompt, { answers: {}, result, business: selectedBusiness, latestDiagnostic, priorAssets }),
    [deliverable, latestDiagnostic, priorAssets, prompt, result, selectedBusiness],
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/marketing-lab" className="text-sm font-semibold text-cyan-800">
          Back to Marketing Lab
        </Link>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Marketing Lab</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">{prompt.display_name}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{prompt.purpose}</p>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Selected context</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{businessName}</h2>
            <div className="mt-4 grid gap-3">
              <ContextRow label="Industry/category" value={result?.industryFit || result?.answers.industryLabel || "Not confirmed yet"} />
              <ContextRow label="What they sell" value={result?.answers.whatSelling || selectedBusiness?.services || "Not confirmed yet"} />
              <ContextRow label="Current bottleneck" value={latestDiagnostic?.biggestBottleneck || result?.biggestBottleneck || "Run or update the diagnostic"} />
              <ContextRow label="Recommended first channel" value={result?.recommendedFirstChannel || "Run the updated diagnostic for this recommendation"} />
            </div>
            <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="lab-business">
              Business / Client
            </label>
            <select
              id="lab-business"
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
          </article>

          <form onSubmit={handleGenerate} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Focused input</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Answer the short audit questions.</h2>
            <div className="mt-4 grid gap-4">
              {prompt.input_fields.map((field) => (
                <label key={field.id} className="block">
                  <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{field.helpText}</span>
                  <input
                    value={answers[field.id] ?? ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
                    placeholder={field.placeholder}
                    className="mt-2 min-h-12 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
              ))}
            </div>
            <button type="submit" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              <Sparkles size={18} aria-hidden="true" />
              Generate audit
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-lg border border-cyan-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Structured output</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{generated.title}</h2>
          {!deliverable ? <p className="mt-2 text-sm leading-6 text-slate-600">Preview shown. Answer the audit questions and generate to tailor this output.</p> : null}
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <InfoCard title="Current-state assessment" value={generated.current_state_assessment} />
            <InfoCard title="Before" value={generated.before_after.before} />
            <InfoCard title="After" value={generated.before_after.after} highlight />
          </div>
          <article className="mt-4 rounded-md bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-950">Why this matters</p>
            <p className="mt-2 text-sm leading-6 text-cyan-900">{generated.before_after.why_better}</p>
          </article>
        </section>

        {generated.market_demand_read ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Market Demand Read</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(generated.market_demand_read).map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label.replace(/_/g, " ")}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

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
            <h2 className="text-xl font-semibold text-slate-950">Copy/paste-ready deliverables</h2>
            <div className="mt-4 grid gap-3">
              {generated.copy_paste_deliverables.map((block) => (
                <div key={block.label} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-500">{block.label}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-900">{block.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Next 3 actions</h2>
            <div className="mt-4 grid gap-3">
              {generated.next_3_actions.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-slate-200 p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-cyan-900 text-sm font-semibold text-white">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
            <Link href={scopedHref(generated.recommended_next_utility)} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Open recommended utility
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {prompt.role_id === "market_demand_check" ? (
              <div className="mt-3 grid gap-3">
                <Link href={scopedHref("/offer-builder")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-cyan-900 px-5 py-3 font-semibold text-cyan-900">
                  Send to Offer Builder
                </Link>
                <Link href={scopedHref("/message-builder")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
                  Use this in Message Builder
                </Link>
              </div>
            ) : null}
          </article>
        </section>

        {deliverable ? (
          <AssetSavePanel
            roleId={prompt.role_id}
            assetType={prompt.asset_type}
            title={`${businessName} ${prompt.display_name}`}
            summary={deliverable.summary}
            input={{ answers, business: selectedBusiness, latestDiagnostic, launchpadResult: result }}
            output={deliverable as unknown as Record<string, unknown>}
            prompt={{
              role_id: prompt.role_id,
              display_name: prompt.display_name,
              purpose: prompt.purpose,
              required_context: prompt.required_context,
              output_schema: prompt.output_schema,
            }}
          />
        ) : (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Beaker className="mt-1 text-cyan-800" size={22} aria-hidden="true" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Save history appears after generation.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Generate the audit first, then save it to the selected Business / Client history.</p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function buildLabDeliverable(
  prompt: PromptPack,
  context: {
    answers: Record<string, string>;
    result: LaunchPadResult | null;
    business: BusinessSummary | null;
    latestDiagnostic: SavedDiagnosticSummary | null;
    priorAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>>;
  },
): LabDeliverable {
  const businessName = context.business?.name || context.result?.businessName || "the business";
  const offer = context.result?.answers.whatSelling || context.business?.services || "the core offer";
  const customer = context.result?.answers.targetCustomer || context.business?.idealCustomer || "best-fit customers";
  const bottleneck = context.latestDiagnostic?.biggestBottleneck || context.result?.biggestBottleneck || "the foundation needs clearer priority";
  const outcome = context.result?.customerDesiredOutcome || "a clear answer, less risk, and a next step they can trust";
  const primaryInput = Object.values(context.answers).find((value) => value.trim()) || bottleneck;
  const recommendedUtility = prompt.suggested_next_utility;
  const savedAssetSignal = Object.values(context.priorAssets).some(Boolean) ? "Use the strongest saved asset as source material." : "Generate the first version and save it as the source asset.";

  if (prompt.role_id === "market_demand_check") {
    return buildMarketDemandDeliverable(prompt, context, { businessName, offer, customer, bottleneck, outcome, primaryInput });
  }

  return {
    title: `${businessName} ${prompt.display_name}`,
    summary: `${prompt.display_name}: ${primaryInput}`,
    current_state_assessment: `${businessName} is working from ${bottleneck.toLowerCase()}. The audit should connect ${offer} to what ${customer} need most: ${outcome}.`,
    before_after: {
      before: `The current foundation may be too broad: ${primaryInput}.`,
      after: `${businessName} should frame ${offer} around ${customer}, ${outcome}, and the next action that reduces hesitation.`,
      why_better: "It turns a broad marketing idea into a buyer-specific asset with a clearer reason to act.",
      where_to_use: ["Homepage", "Sales follow-up", "Content hooks", "Campaign brief"],
    },
    sections: [
      {
        title: "Consultant diagnosis",
        items: [
          `${prompt.purpose}`,
          `Business context: ${businessName} sells ${offer}.`,
          `Buyer context: ${customer} likely want ${outcome}.`,
        ],
      },
      {
        title: "What to improve",
        items: [
          "Make the buyer problem more specific.",
          "Connect proof to the hesitation that blocks action.",
          "Use one CTA that matches the buyer's readiness.",
        ],
      },
      {
        title: "Role-specific output",
        items: buildRoleSpecificItems(prompt.role_id, context.answers, { businessName, offer, customer, outcome, bottleneck }),
      },
    ],
    next_3_actions: [
      "Use the after version as the working direction for the next asset.",
      "Save this output to the selected Business / Client history.",
      `Open the recommended next utility and turn this into a deployable asset. ${savedAssetSignal}`,
    ],
    recommended_next_utility: recommendedUtility,
    copy_paste_deliverables: [
      {
        label: "Working message",
        value: `${businessName} helps ${customer} get ${outcome} by making ${offer} easier to understand and act on.`,
      },
      {
        label: "Next-action brief",
        value: `Current bottleneck: ${bottleneck}\nAudit focus: ${prompt.display_name}\nNext utility: ${recommendedUtility}`,
      },
    ],
  };
}

function buildMarketDemandDeliverable(
  prompt: PromptPack,
  context: {
    answers: Record<string, string>;
    result: LaunchPadResult | null;
    business: BusinessSummary | null;
    latestDiagnostic: SavedDiagnosticSummary | null;
    priorAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>>;
  },
  base: { businessName: string; offer: string; customer: string; bottleneck: string; outcome: string; primaryInput: string },
): LabDeliverable {
  const offerToCheck = context.answers.sell_promote_now || context.answers.current_offer_promise || base.offer;
  const targetBuyer = context.answers.target_buyer || base.customer;
  const currentPromise = context.answers.current_offer_promise || offerToCheck;
  const demandSignal = context.answers.paid_asked_interest || "No direct demand signal entered yet; use public proof, website language, reviews, and diagnostic signals.";
  const visibleProof = context.result?.answers.trustFactor || "visible proof needs review";
  const websiteCta = context.result?.answers.primaryCta || "CTA needs review";
  const demandStrength = demandSignal.toLowerCase().includes("paid") || demandSignal.toLowerCase().includes("bought") ? "High" : demandSignal.trim() ? "Medium" : "Low";
  const urgencyLevel = base.bottleneck.toLowerCase().includes("fast") || base.bottleneck.toLowerCase().includes("urgent") || context.result?.answers.customerNeedType === "fix_problem" ? "High" : "Medium";
  const buyerAwareness = context.result?.answers.customerWords || context.result?.answers.websiteAnalysisSummary ? "Medium" : "Low";
  const painClarity = context.result?.answers.customerWords || context.result?.answers.marketingFrustration ? "Medium" : "Low";
  const confidence = demandStrength === "High" && painClarity !== "Low" ? "High" : demandStrength === "Low" ? "Low" : "Medium";
  const sharperOffer = `${base.businessName} helps ${targetBuyer} solve ${base.bottleneck.toLowerCase()} and get ${base.outcome} with a clearer, lower-risk next step.`;
  const premiumOffer = `${base.businessName} creates a focused ${offerToCheck} plan for ${targetBuyer}, including diagnosis, proof, message, CTA, and follow-up direction.`;

  return {
    title: `${base.businessName} Market Demand Check`,
    summary: `Demand strength: ${demandStrength}. Offer direction: ${sharperOffer}`,
    current_state_assessment: `${base.businessName} should validate whether "${currentPromise}" is specific enough, urgent enough, and visible enough to make ${targetBuyer} act now.`,
    market_demand_read: {
      demand_strength: demandStrength,
      urgency_level: urgencyLevel,
      buyer_awareness: buyerAwareness,
      pain_clarity: painClarity,
      willingness_to_pay_signal: demandSignal.trim() ? "Medium" : "Low",
      confidence_level: confidence,
    },
    demand_diagnosis: {
      what_appears_strong: [
        `The offer has a starting buyer context: ${targetBuyer}.`,
        `The current demand signal is: ${demandSignal}.`,
      ],
      what_appears_weak: [
        `The current promise may need a sharper painful problem and clearer why-now angle.`,
        `Visible proof is currently: ${visibleProof}.`,
      ],
      what_is_too_generic: [
        currentPromise === offerToCheck ? `The offer "${currentPromise}" may be too broad without a named buyer, painful problem, and outcome.` : "The current offer language needs to connect the promise to a specific buyer situation.",
      ],
      what_is_unclear: [
        `CTA clarity: ${websiteCta}.`,
        "The buyer's current alternative and willingness-to-pay signal should be made more visible.",
      ],
      what_may_be_missing: [
        "Specific proof tied to the buyer's pain.",
        "A risk reducer that makes the first step feel safer.",
        "A clear mechanism that explains how the offer creates the result.",
      ],
    },
    buyer_motivation: {
      likely_painful_problem: base.bottleneck,
      likely_desired_outcome: base.outcome,
      trigger_events: [
        context.result?.answers.customerWords || "The problem becomes expensive, visible, or urgent.",
        "The current alternative stops working.",
        "The buyer needs a safer next step before committing.",
      ],
      why_they_would_act_now: `They would act now if ${offerToCheck} clearly reduces ${base.bottleneck.toLowerCase()} and feels lower-risk than waiting.`,
      current_alternatives: ["Doing nothing", "DIY", "Cheaper provider", "Asking peers", "Searching for another option"],
    },
    offer_improvement: {
      current_before_offer: currentPromise,
      improved_after_offer: sharperOffer,
      sharper_offer_statement: sharperOffer,
      value_stack: [
        `Core offer: ${offerToCheck}`,
        `Demand diagnosis for ${targetBuyer}`,
        "Clear next-step recommendation",
        `Proof layer: ${visibleProof}`,
        "Follow-up or CTA direction",
      ],
      risk_reducer: "Start with a focused check or review before asking the buyer to commit to a larger engagement.",
      why_now_angle: `Waiting keeps ${base.bottleneck.toLowerCase()} active and makes the buying decision feel harder.`,
      cta: "Start with a focused demand check",
    },
    before_after: {
      before: currentPromise,
      after: sharperOffer,
      why_better: "The after version names the buyer, the problem, the desired outcome, and the safer first step. That makes demand easier to understand and act on.",
      where_to_use: ["Offer Builder", "Homepage hero", "Sales follow-up", "Landing page CTA", "Message Builder"],
    },
    sections: [
      {
        title: "Market Demand Reality Check",
        items: [
          `Problem clarity and pain intensity: ${painClarity}. The problem must be specific enough for buyers to recognize themselves.`,
          `Audience specificity: ${targetBuyer}. The buyer should be obvious from the offer language.`,
          `Outcome and promise clarity: ${base.outcome}. Make this visible before asking for action.`,
          `Proof and traction signal: ${visibleProof}.`,
          `Purchase friction and risk: reduce hesitation with a smaller first step.`,
        ],
      },
      {
        title: "Offer Generator Output",
        items: [
          `Offer A - Highest-demand offer: ${sharperOffer}`,
          `Offer A format/scope: productized first-step review, demand check, or focused consultation. CTA: Start with a focused demand check.`,
          `Offer B - Premium or strategic alternative: ${premiumOffer}`,
          "Offer B format/scope: premium strategy package or implementation roadmap. CTA: Build the full offer plan.",
          "Suggested price range: validate against current category norms, buyer urgency, proof, and delivery scope before publishing.",
        ],
      },
    ],
    next_3_actions: [
      "Open Offer Builder and turn the sharper offer statement into the working offer.",
      "Add one proof point or demand signal near the CTA.",
      "Use Message Builder to turn the buyer pain and why-now angle into homepage or follow-up copy.",
    ],
    recommended_next_utility: "/offer-builder",
    copy_paste_deliverables: [
      { label: "Sharper offer statement", value: sharperOffer },
      { label: "CTA", value: "Start with a focused demand check" },
      { label: "Why-now angle", value: `Waiting keeps ${base.bottleneck.toLowerCase()} active and makes the buying decision feel harder.` },
    ],
  };
}

function buildRoleSpecificItems(roleId: PromptRoleId, answers: Record<string, string>, context: { businessName: string; offer: string; customer: string; outcome: string; bottleneck: string }) {
  switch (roleId) {
    case "buyer_psychology_audit":
      return [
        `Likely buyer fear: ${answers.buyer_fear || "choosing wrong, wasting money, or letting the problem get worse"}.`,
        `Buying belief to create: ${context.offer} is the safest next step toward ${context.outcome}.`,
        "Proof should reduce perceived risk before asking for commitment.",
      ];
    case "marketing_reality_check":
      return [
        `Current activity: ${answers.current_activity || "scattered marketing activity"}.`,
        `Reality check: fix ${context.bottleneck.toLowerCase()} before adding more channels.`,
        "Stop doing activity that does not support the next buyer action.",
      ];
    case "market_demand_check":
      return [
        `Demand signal: ${answers.evidence || "look for repeated questions, searches, referrals, and competitor proof"}.`,
        `Offer to test: ${answers.offer || context.offer}.`,
        "Strong demand requires urgency, active alternatives, and a reason to act now.",
      ];
    case "problem_narrative_builder":
      return [
        `Problem narrative: ${answers.problem || context.bottleneck}.`,
        `Failed alternative: ${answers.failed_alternative || "waiting, DIY, cheaper option, or doing nothing"}.`,
        "Show the cost of delay before introducing the solution.",
      ];
    case "messaging_sequence_builder":
      return [
        `Sequence goal: ${answers.sequence_goal || "move the buyer to the next small action"}.`,
        `Channel: ${answers.channel || "email, SMS, social, or follow-up"}.`,
        "Sequence order: pain, proof, objection, urgency, CTA.",
      ];
    case "buyer_messaging_engine":
      return [
        `Buyer segment: ${answers.buyer_segment || context.customer}.`,
        `Use case: ${answers.use_case || "homepage, ad, email, or sales follow-up"}.`,
        "Create message variants for pain, proof, objection, and CTA.",
      ];
    default:
      return ["Use the role prompt, saved context, focused input, and output rules to produce a usable marketing asset."];
  }
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
