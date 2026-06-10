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
  buyer_psychology_summary?: {
    what_the_buyer_likely_understands: string;
    what_the_buyer_likely_doubts: string;
    what_the_buyer_likely_wants: string;
    what_the_buyer_may_be_confused_by: string;
    confidence_level: string;
  };
  current_state_read?: {
    current_message: string;
    current_promise: string;
    current_cta: string;
    current_trust_signals: string[];
    current_friction_points: string[];
  };
  psychology_findings?: {
    emotional_drivers: string[];
    logical_drivers: string[];
    risk_fear_points: string[];
    urgency_signals: string[];
    missing_belief_shift: string;
    trust_gaps: string[];
    clarity_gaps: string[];
  };
  before_after_improvements?: {
    type: string;
    before: string;
    after: string;
    why_the_after_is_better: string;
    where_to_use_it: string[];
  }[];
  top_3_changes?: string[];
  messaging_strategy?: {
    target_buyer: string;
    buyer_pain: string;
    desired_outcome: string;
    key_belief_to_shift: string;
    strongest_angle: string;
    tone_recommendation: string;
  };
  current_vs_improved?: {
    current_before_message: string;
    improved_after_message: string;
    why_the_after_is_better: string;
    where_to_use_it: string[];
  };
  core_message_assets?: {
    positioning_statement: string;
    homepage_headline: string;
    subheadline: string;
    simple_explanation: string;
    offer_statement: string;
    cta_options: string[];
    elevator_pitch: string;
  };
  channel_versions?: {
    website_copy: string;
    ad_hook: string;
    social_post: string;
    email_opener: string;
    follow_up_script: string;
    short_video_hook: string;
    sales_conversation_line: string;
  };
  objection_responses?: {
    objection: string;
    response: string;
  }[];
  problem_summary?: {
    plain_language_problem: string;
    buyer_before_state: string;
    buyer_desired_after_state: string;
    why_this_matters_now: string;
    confidence_level: string;
  };
  problem_narrative?: {
    short_version: string;
    medium_version: string;
    story_style_version: string;
    direct_response_version: string;
  };
  tension_points?: {
    what_is_frustrating: string;
    what_is_costly: string;
    what_is_confusing: string;
    what_is_being_delayed: string;
    what_buyers_may_not_realize_yet: string;
  };
  belief_shift?: {
    current_belief: string;
    new_belief: string;
    reason_to_believe: string;
    proof_needed: string;
  };
  before_after_message?: {
    before: string;
    after: string;
    why_the_after_is_better: string;
    where_to_use_it: string[];
  };
  content_angles?: {
    social_post_angles: string[];
    video_hooks: string[];
    email_angles: string[];
    ad_angles: string[];
    faq_angles: string[];
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
  copy_paste_blocks?: { label: string; value: string }[];
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
  "problem_narrative",
  "messaging_sequence_builder",
  "buyer_messaging_engine",
  "buyer_messaging_output",
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

        {generated.buyer_psychology_summary ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Buyer Psychology Summary</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {Object.entries(generated.buyer_psychology_summary).map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label.replace(/_/g, " ")}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generated.before_after_improvements?.length ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Before/After Improvements</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {generated.before_after_improvements.map((improvement) => (
                <article key={improvement.type} className="rounded-md border border-slate-200 p-4">
                  <h2 className="text-lg font-semibold capitalize text-slate-950">{improvement.type.replace(/_/g, " ")}</h2>
                  <div className="mt-3 grid gap-3">
                    <InfoCard title="Before" value={improvement.before} />
                    <InfoCard title="After" value={improvement.after} highlight />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{improvement.why_the_after_is_better}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Use it: {improvement.where_to_use_it.join(", ")}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {generated.messaging_strategy ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Messaging Strategy</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(generated.messaging_strategy).map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label.replace(/_/g, " ")}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generated.core_message_assets ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Core Message Assets</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {Object.entries(generated.core_message_assets).map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold capitalize text-slate-500">{label.replace(/_/g, " ")}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-900">{Array.isArray(value) ? value.join("\n") : value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generated.channel_versions ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Channel Versions</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {Object.entries(generated.channel_versions).map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold capitalize text-slate-500">{label.replace(/_/g, " ")}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generated.objection_responses?.length ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Objection Responses</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {generated.objection_responses.map((item) => (
                <article key={item.objection} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-500">{item.objection}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-900">{item.response}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {generated.problem_summary ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Problem Summary</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(generated.problem_summary).map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label.replace(/_/g, " ")}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generated.problem_narrative ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Problem Narrative</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {Object.entries(generated.problem_narrative).map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold capitalize text-slate-500">{label.replace(/_/g, " ")}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generated.tension_points || generated.belief_shift ? (
          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            {generated.tension_points ? (
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Tension Points</p>
                <div className="mt-4 grid gap-3">
                  {Object.entries(generated.tension_points).map(([label, value]) => (
                    <div key={label} className="rounded-md bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label.replace(/_/g, " ")}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}
            {generated.belief_shift ? (
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Belief Shift</p>
                <div className="mt-4 grid gap-3">
                  {Object.entries(generated.belief_shift).map(([label, value]) => (
                    <div key={label} className="rounded-md bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label.replace(/_/g, " ")}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}
          </section>
        ) : null}

        {generated.content_angles ? (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Content Angles</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(generated.content_angles).map(([label, values]) => (
                <article key={label} className="rounded-md border border-slate-200 p-4">
                  <p className="text-sm font-semibold capitalize text-slate-500">{label.replace(/_/g, " ")}</p>
                  <div className="mt-3 grid gap-2">
                    {values.map((value) => (
                      <p key={value} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-800">
                        {value}
                      </p>
                    ))}
                  </div>
                </article>
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
            {prompt.role_id === "buyer_psychology_audit" ? (
              <div className="mt-3 grid gap-3">
                <Link href={scopedHref("/message-builder")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-cyan-900 px-5 py-3 font-semibold text-cyan-900">
                  Send to Message Builder
                </Link>
                <Link href={scopedHref("/content-engine")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
                  Create content from this
                </Link>
              </div>
            ) : null}
            {prompt.role_id === "buyer_messaging_engine" ? (
              <div className="mt-3 grid gap-3">
                <Link href={scopedHref("/content-engine")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-cyan-900 px-5 py-3 font-semibold text-cyan-900">
                  Send to Content Engine
                </Link>
                <Link href={scopedHref("/strategy-map")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
                  Use in Strategy Map
                </Link>
              </div>
            ) : null}
            {prompt.role_id === "problem_narrative_builder" ? (
              <div className="mt-3 grid gap-3">
                <Link href={scopedHref("/content-engine")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-cyan-900 px-5 py-3 font-semibold text-cyan-900">
                  Send to Content Engine
                </Link>
                <Link href={scopedHref("/message-builder")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
                  Use in Message Builder
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

  if (prompt.role_id === "buyer_psychology_audit") {
    return buildBuyerPsychologyDeliverable(context, { businessName, offer, customer, bottleneck, outcome, primaryInput });
  }

  if (prompt.role_id === "buyer_messaging_engine") {
    return buildBuyerMessagingDeliverable(context, { businessName, offer, customer, bottleneck, outcome, primaryInput });
  }

  if (prompt.role_id === "problem_narrative_builder") {
    return buildProblemNarrativeDeliverable(context, { businessName, offer, customer, bottleneck, outcome, primaryInput });
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

function buildBuyerPsychologyDeliverable(
  context: {
    answers: Record<string, string>;
    result: LaunchPadResult | null;
    business: BusinessSummary | null;
    latestDiagnostic: SavedDiagnosticSummary | null;
    priorAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>>;
  },
  base: { businessName: string; offer: string; customer: string; bottleneck: string; outcome: string; primaryInput: string },
): LabDeliverable {
  const reviewTarget = context.answers.review_target || context.result?.websiteUrl || "saved website analysis";
  const buyerAction = context.answers.buyer_action || "take the next clear action";
  const intendedBuyer = context.answers.intended_buyer || base.customer;
  const currentMessage = context.result?.answers.homepageHeadline || context.result?.answers.messagingClarityNotes || base.primaryInput;
  const currentPromise = context.result?.answers.primaryCta || base.offer;
  const currentCta = context.result?.answers.primaryCta || "CTA needs review";
  const trustSignals = context.result?.answers.trustFactor ? [context.result.answers.trustFactor] : ["Visible proof needs review"];
  const confidence = context.result?.answers.websiteAnalysisSummary || context.answers.review_target ? "Medium" : "Low";
  const strongerMessage = `${base.businessName} helps ${intendedBuyer} move from ${base.bottleneck.toLowerCase()} to ${base.outcome} with a clearer, safer next step.`;

  return {
    title: `${base.businessName} Buyer Psychology Audit`,
    summary: `Buyer confidence read for ${reviewTarget}: ${strongerMessage}`,
    current_state_assessment: `${reviewTarget} should help ${intendedBuyer} understand the offer, trust the proof, and feel clear enough to ${buyerAction}.`,
    buyer_psychology_summary: {
      what_the_buyer_likely_understands: `${base.businessName} offers ${base.offer}.`,
      what_the_buyer_likely_doubts: "Whether this is specifically built for their situation, whether the proof is strong enough, and whether the next step is low-risk.",
      what_the_buyer_likely_wants: base.outcome,
      what_the_buyer_may_be_confused_by: "The exact promise, who it is best for, what happens after they click, or why they should act now.",
      confidence_level: confidence,
    },
    current_state_read: {
      current_message: currentMessage,
      current_promise: currentPromise,
      current_cta: currentCta,
      current_trust_signals: trustSignals,
      current_friction_points: [
        "Buyer may not see themselves quickly enough.",
        "The risk reducer may not be visible near the CTA.",
        "The emotional reason to act may need to be sharper.",
      ],
    },
    psychology_findings: {
      emotional_drivers: ["Relief", "Confidence", "Avoiding a costly mistake"],
      logical_drivers: ["Clear outcome", "Visible proof", "Specific next step"],
      risk_fear_points: ["Choosing wrong", "Wasting money", "Not knowing what happens next"],
      urgency_signals: [base.bottleneck, context.result?.recommendedFirstChannel || "The current opportunity may be lost if the next step stays unclear"],
      missing_belief_shift: `The buyer needs to believe ${base.offer} is a safer, clearer path to ${base.outcome}.`,
      trust_gaps: trustSignals[0] === "Visible proof needs review" ? ["Add specific testimonials, case examples, process proof, or credibility near the CTA."] : [`Make ${trustSignals[0]} easier to connect to the buyer's fear.`],
      clarity_gaps: ["Clarify who this is for.", "Clarify the promise.", "Clarify what happens after the CTA."],
    },
    before_after_improvements: [
      {
        type: "headline",
        before: currentMessage,
        after: strongerMessage,
        why_the_after_is_better: "It names the buyer, the stuck point, the desired outcome, and the safer path.",
        where_to_use_it: ["Homepage hero", "Landing page opener", "Message Builder"],
      },
      {
        type: "CTA",
        before: currentCta,
        after: "Get the recommended next step",
        why_the_after_is_better: "It lowers pressure and tells the buyer they will get direction, not just a sales pitch.",
        where_to_use_it: ["Hero CTA", "Service page CTA", "Follow-up email"],
      },
      {
        type: "proof_trust",
        before: trustSignals.join(", "),
        after: `Show proof that ${intendedBuyer} can trust the path from ${base.bottleneck.toLowerCase()} to ${base.outcome}.`,
        why_the_after_is_better: "Proof works harder when it answers the buyer's risk, not just the business's credibility.",
        where_to_use_it: ["Near CTA", "Offer section", "Sales follow-up"],
      },
    ],
    before_after: {
      before: currentMessage,
      after: strongerMessage,
      why_better: "The after version reduces confusion, increases identity fit, and gives the buyer a safer reason to act.",
      where_to_use: ["Message Builder", "Homepage", "Landing page", "Content Engine"],
    },
    sections: [
      {
        title: "Current-state read",
        items: [
          `Current message: ${currentMessage}`,
          `Current promise: ${currentPromise}`,
          `Current CTA: ${currentCta}`,
          `Current trust signals: ${trustSignals.join(", ")}`,
        ],
      },
      {
        title: "Psychology findings",
        items: [
          "Emotional driver: buyer wants relief and confidence.",
          "Logical driver: buyer needs proof, process clarity, and a specific next step.",
          `Missing belief shift: ${base.offer} must feel like the safer path to ${base.outcome}.`,
          "Top friction: uncertainty about fit, proof, and what happens next.",
        ],
      },
      {
        title: "Top 3 changes",
        items: [
          "Rewrite the opening message around the buyer's stuck point and desired outcome.",
          "Move proof closer to the CTA and connect it to buyer risk.",
          "Make the CTA feel like a low-risk next step.",
        ],
      },
    ],
    top_3_changes: [
      "Rewrite the opening message around buyer pain and desired outcome.",
      "Add risk-reducing proof near the CTA.",
      "Clarify what happens after the buyer takes action.",
    ],
    next_3_actions: [
      "Send the after message to Message Builder and turn it into homepage copy.",
      "Create one proof block that answers the buyer's biggest doubt.",
      "Use Content Engine to create a post or email from the buyer belief shift.",
    ],
    recommended_next_utility: "/message-builder",
    copy_paste_deliverables: [
      { label: "Buyer-facing message", value: strongerMessage },
      { label: "Belief shift", value: `The buyer needs to believe ${base.offer} is a safer, clearer path to ${base.outcome}.` },
      { label: "CTA", value: "Get the recommended next step" },
    ],
  };
}

function buildBuyerMessagingDeliverable(
  context: {
    answers: Record<string, string>;
    result: LaunchPadResult | null;
    business: BusinessSummary | null;
    latestDiagnostic: SavedDiagnosticSummary | null;
    priorAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>>;
  },
  base: { businessName: string; offer: string; customer: string; bottleneck: string; outcome: string; primaryInput: string },
): LabDeliverable {
  const useCase = context.answers.messaging_use || "general clarity";
  const offerToPromote = context.answers.sell_promote || base.offer;
  const buyer = context.answers.message_buyer || base.customer;
  const currentVersion = context.answers.current_version || context.result?.answers.homepageHeadline || "No clear current version provided.";
  const latestDemand = context.priorAssets.market_demand_check?.summary || "Use the latest demand read when available.";
  const latestPsychology = context.priorAssets.buyer_psychology_audit?.summary || "Use the latest buyer psychology read when available.";
  const pain = context.result?.answers.customerWords || base.bottleneck;
  const beliefShift = `${offerToPromote} is a safer, clearer path to ${base.outcome}.`;
  const improvedMessage = `${base.businessName} helps ${buyer} fix ${pain.toLowerCase()} and get ${base.outcome} without guessing what to do next.`;
  const ctas = ["Get the recommended next step", "See what to fix first", "Start with a quick review"];
  const copyBlocks = [
    { label: "Homepage headline", value: improvedMessage },
    { label: "Subheadline", value: `Get a clearer path, a safer first step, and a practical way to move forward with ${offerToPromote}.` },
    { label: "CTA options", value: ctas.join("\n") },
    { label: "Email opener", value: `If you are dealing with ${pain.toLowerCase()}, the next move should feel clear, not risky.` },
    { label: "Follow-up script", value: `Based on what you shared, the safest next step is to identify the gap first. Then we can point you toward the right fix.` },
  ];

  return {
    title: `${base.businessName} Buyer Messaging Output`,
    summary: `Buyer-ready messaging for ${useCase}: ${improvedMessage}`,
    current_state_assessment: `${base.businessName} needs messaging for ${useCase} that makes ${buyer} feel understood, reduces risk, and moves them toward a small next action.`,
    messaging_strategy: {
      target_buyer: buyer,
      buyer_pain: pain,
      desired_outcome: base.outcome,
      key_belief_to_shift: beliefShift,
      strongest_angle: `The safest next step from ${pain.toLowerCase()} to ${base.outcome}.`,
      tone_recommendation: "Plain, specific, calm, and direct. No hype.",
    },
    current_vs_improved: {
      current_before_message: currentVersion,
      improved_after_message: improvedMessage,
      why_the_after_is_better: "It names the buyer, the pain, the desired outcome, and the lower-risk next step.",
      where_to_use_it: [useCase, "Message Builder", "Content Engine", "Sales follow-up"],
    },
    core_message_assets: {
      positioning_statement: `${base.businessName} is for ${buyer} who need ${base.outcome} but are stuck with ${pain.toLowerCase()}.`,
      homepage_headline: improvedMessage,
      subheadline: `Get a clearer path, a safer first step, and a practical way to move forward with ${offerToPromote}.`,
      simple_explanation: `We help ${buyer} understand what is causing ${pain.toLowerCase()}, choose the right next step, and move toward ${base.outcome}.`,
      offer_statement: `${offerToPromote} for ${buyer} who want ${base.outcome} without unnecessary confusion or risk.`,
      cta_options: ctas,
      elevator_pitch: `We help ${buyer} who are dealing with ${pain.toLowerCase()}. The first step is simple: identify the gap, explain the next move, and make it easier to get ${base.outcome}.`,
    },
    channel_versions: {
      website_copy: `${improvedMessage}\n\nStart with a clear next step and see what to fix first.`,
      ad_hook: `${pain} is not the only problem. Not knowing the next step is what keeps it stuck.`,
      social_post: `If ${pain.toLowerCase()} keeps showing up, the answer is not more noise. Start with one clear next step toward ${base.outcome}.`,
      email_opener: `If you are dealing with ${pain.toLowerCase()}, the next move should feel clear, not risky.`,
      follow_up_script: `Based on what you shared, the safest next step is to identify the gap first. Then we can point you toward the right fix.`,
      short_video_hook: `Before you spend more time on ${pain.toLowerCase()}, check this first.`,
      sales_conversation_line: `The goal is not to pressure you. It is to show you the safest next step toward ${base.outcome}.`,
    },
    objection_responses: [
      {
        objection: "I am not sure this is the right fit.",
        response: "That is exactly why the first step is a quick review. You will see what is worth fixing before committing to anything bigger.",
      },
      {
        objection: "I do not want to waste money.",
        response: "The goal is to find the gap first, then choose the smallest useful next step.",
      },
      {
        objection: "I need to think about it.",
        response: "That makes sense. Start by checking whether this is the real problem or just a symptom.",
      },
    ],
    before_after: {
      before: currentVersion,
      after: improvedMessage,
      why_better: "It avoids vague claims and gives the buyer a specific reason to keep reading or respond.",
      where_to_use: [useCase, "Website", "Email", "Follow-up", "Sales conversation"],
    },
    sections: [
      {
        title: "Engagement messaging",
        items: [
          `${pain} is usually a sign that the next step is unclear.`,
          `Most ${buyer} do not need more noise. They need a safer first decision.`,
          `If ${pain.toLowerCase()} keeps happening, check the foundation before adding more activity.`,
        ],
      },
      {
        title: "Interaction messaging",
        items: [
          "Get the recommended next step.",
          "See what to fix first.",
          `Find the gap between ${pain.toLowerCase()} and ${base.outcome}.`,
        ],
      },
      {
        title: "Adoption messaging",
        items: [
          `After the first review, ${buyer} know what is wrong, why it matters, and what to do next.`,
          "No guessing. No oversized commitment. Just the next clear move.",
          `The process turns ${pain.toLowerCase()} into a practical path toward ${base.outcome}.`,
        ],
      },
      {
        title: "Context used",
        items: [latestDemand, latestPsychology, `Current offer: ${offerToPromote}`],
      },
    ],
    next_3_actions: [
      "Use the homepage headline and CTA in Message Builder.",
      "Send the ad hook and social post to Content Engine.",
      "Add the follow-up script to your sales or lead response process.",
    ],
    recommended_next_utility: "/content-engine",
    copy_paste_blocks: copyBlocks,
    copy_paste_deliverables: copyBlocks,
  };
}

function buildProblemNarrativeDeliverable(
  context: {
    answers: Record<string, string>;
    result: LaunchPadResult | null;
    business: BusinessSummary | null;
    latestDiagnostic: SavedDiagnosticSummary | null;
    priorAssets: Partial<Record<MarketingAssetType, MarketingAssetSummary>>;
  },
  base: { businessName: string; offer: string; customer: string; bottleneck: string; outcome: string; primaryInput: string },
): LabDeliverable {
  const problem = context.answers.customer_problem || context.result?.answers.customerWords || base.bottleneck;
  const audience = context.answers.problem_audience || base.customer;
  const useCase = context.answers.narrative_use || "content";
  const latestPsychology = context.priorAssets.buyer_psychology_audit?.summary || "Buyer psychology context should be confirmed with a saved audit when available.";
  const latestMessaging = context.priorAssets.buyer_messaging_output?.summary || "Buyer messaging context should be confirmed with a saved messaging output when available.";
  const beforeState = `${audience} are dealing with ${problem.toLowerCase()} and may be trying to solve it with scattered fixes, waiting, or a familiar but weak workaround.`;
  const afterState = `${audience} can see the real issue clearly, understand what needs to change, and take the next step toward ${base.outcome}.`;
  const shortNarrative = `The real problem is not effort. It is that ${problem.toLowerCase()} keeps the next decision unclear.`;
  const mediumNarrative = `${audience} usually do not get stuck because they are careless. They get stuck because ${problem.toLowerCase()} creates confusion, delay, and second-guessing. The longer it stays undefined, the harder it becomes to choose the right next step.`;
  const storyNarrative = `${audience} often start by trying the obvious fixes. They wait, search, ask around, compare options, or add more activity. Those moves make sense, but they do not fix the deeper issue: ${problem.toLowerCase()} has not been clearly defined. Once the problem is named, the path toward ${base.outcome} becomes easier to evaluate.`;
  const directNarrative = `If ${problem.toLowerCase()} keeps showing up, the next move is not more noise. Define the real problem first, then choose the fix that moves ${audience} toward ${base.outcome}.`;
  const copyBlocks = [
    { label: "Short problem statement", value: shortNarrative },
    { label: "Website opener", value: `${mediumNarrative}\n\nThat is why ${base.businessName} starts by making the real problem clear before recommending the next step.` },
    { label: "Email opener", value: `If ${problem.toLowerCase()} keeps coming up, it may not be the only issue. It may be the sign that the real problem has not been named clearly enough yet.` },
    { label: "Video hook", value: `The problem is not that ${audience} are not trying. The problem is that ${problem.toLowerCase()} makes the next move hard to trust.` },
  ];

  return {
    title: `${base.businessName} Problem Narrative`,
    summary: `Problem narrative for ${useCase}: ${shortNarrative}`,
    current_state_assessment: `${base.businessName} needs a calm problem narrative that helps ${audience} recognize ${problem.toLowerCase()} without making the message feel exaggerated.`,
    problem_summary: {
      plain_language_problem: problem,
      buyer_before_state: beforeState,
      buyer_desired_after_state: afterState,
      why_this_matters_now: `If the problem stays vague, ${audience} may keep comparing options or delaying action instead of moving toward ${base.outcome}.`,
      confidence_level: context.result || context.priorAssets.buyer_psychology_audit || context.priorAssets.buyer_messaging_output ? "Medium" : "Low",
    },
    problem_narrative: {
      short_version: shortNarrative,
      medium_version: mediumNarrative,
      story_style_version: storyNarrative,
      direct_response_version: directNarrative,
    },
    tension_points: {
      what_is_frustrating: `${problem} keeps showing up even when ${audience} try reasonable fixes.`,
      what_is_costly: "Time, attention, trust, and decision momentum get spent on symptoms instead of the root issue.",
      what_is_confusing: `The buyer may not know whether they need ${base.offer}, a different approach, or simply a clearer first step.`,
      what_is_being_delayed: `Progress toward ${base.outcome}.`,
      what_buyers_may_not_realize_yet: `The issue may not be lack of effort. It may be that ${problem.toLowerCase()} has not been clearly owned and evaluated.`,
    },
    belief_shift: {
      current_belief: `I need to keep searching, comparing, or trying more things until ${problem.toLowerCase()} improves.`,
      new_belief: `I need to define the real problem first so the next step is easier to trust.`,
      reason_to_believe: `When ${problem.toLowerCase()} is clearly named, the right criteria become easier to see.`,
      proof_needed: `Show examples, buyer language, process proof, or specific outcomes that prove ${base.businessName} understands this problem deeply.`,
    },
    before_after_message: {
      before: base.primaryInput,
      after: directNarrative,
      why_the_after_is_better: "It respects the buyer's effort, names the stuck point, and creates urgency through clarity instead of hype.",
      where_to_use_it: [useCase, "Message Builder", "Content Engine", "Landing page", "Sales conversation"],
    },
    before_after: {
      before: base.primaryInput,
      after: directNarrative,
      why_better: "It turns a broad complaint into a believable problem narrative that buyers can recognize.",
      where_to_use: [useCase, "Website", "Email", "Social content", "Sales script"],
    },
    content_angles: {
      social_post_angles: [
        `The hidden reason ${problem.toLowerCase()} keeps coming back.`,
        `What ${audience} try before they realize the real problem is different.`,
        `Why more activity does not always solve ${problem.toLowerCase()}.`,
      ],
      video_hooks: [
        `The real enemy is not effort. It is an unclear problem.`,
        `Before you try to fix ${problem.toLowerCase()}, check this first.`,
        `Most ${audience} are solving the symptom, not the problem.`,
      ],
      email_angles: [
        `Subject: The problem behind ${problem}`,
        `Subject: Why the obvious fix may not be working`,
        `Subject: Name the problem before choosing the fix`,
      ],
      ad_angles: [
        `Still dealing with ${problem.toLowerCase()}? Start by finding the real gap.`,
        `The next step gets easier when the problem is clear.`,
        `Fix the decision problem before adding more activity.`,
      ],
      faq_angles: [
        `Why does ${problem.toLowerCase()} keep happening?`,
        `What should ${audience} check before choosing help?`,
        `How do you know if this is the real problem or just a symptom?`,
      ],
    },
    sections: [
      {
        title: "Problem discovery",
        items: [
          `Observed pain: ${problem}`,
          `Who feels it: ${audience}`,
          `Relevant context: ${latestPsychology}`,
          `Messaging context: ${latestMessaging}`,
        ],
      },
      {
        title: "Narrative backbone",
        items: [
          `The real enemy is not the buyer's effort. It is the unclear structure around ${problem.toLowerCase()}.`,
          `The cost is quiet erosion: time, trust, focus, and decision confidence.`,
          "The false solution is adding more activity before the problem is clearly defined.",
        ],
      },
      {
        title: "Where to use it",
        items: [
          `Use the short version in ${useCase}.`,
          "Use the story-style version in content or sales conversations.",
          "Use the direct-response version in ads, emails, and landing page openers.",
        ],
      },
    ],
    next_3_actions: [
      "Send the narrative to Content Engine and create one post, one email, and one video hook.",
      "Use Message Builder to turn the direct-response version into website copy.",
      "Use Offer Builder to make sure the offer clearly resolves the named problem.",
    ],
    recommended_next_utility: "/content-engine",
    copy_paste_blocks: copyBlocks,
    copy_paste_deliverables: copyBlocks,
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
        `Problem narrative: ${answers.customer_problem || context.bottleneck}.`,
        `Audience: ${answers.problem_audience || context.customer}.`,
        `Use case: ${answers.narrative_use || "content, website, email, or sales script"}.`,
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
