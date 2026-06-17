import { sharedContextPrompt } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

const marketDemandOutputSchema = {
  market_demand_read: {
    demand_strength: "Low | Medium | High",
    urgency_level: "Low | Medium | High",
    buyer_awareness: "Low | Medium | High",
    pain_clarity: "Low | Medium | High",
    willingness_to_pay_signal: "Low | Medium | High",
    confidence_level: "Low | Medium | High",
  },
  demand_diagnosis: {
    what_appears_strong: ["string"],
    what_appears_weak: ["string"],
    what_is_too_generic: ["string"],
    what_is_unclear: ["string"],
    what_may_be_missing: ["string"],
  },
  buyer_motivation: {
    likely_painful_problem: "string",
    likely_desired_outcome: "string",
    trigger_events: ["string"],
    why_they_would_act_now: "string",
    current_alternatives: ["string"],
  },
  offer_improvement: {
    current_before_offer: "string",
    improved_after_offer: "string",
    sharper_offer_statement: "string",
    value_stack: ["string"],
    risk_reducer: "string",
    why_now_angle: "string",
    cta: "string",
  },
  before_after: {
    before: "string",
    after: "string",
    why_the_after_is_better: "string",
    where_to_use_it: ["string"],
  },
  next_3_actions: ["string", "string", "string"],
  recommended_next_utility: "Offer Builder | ICP Builder | Message Builder | Content Engine | Strategy Map",
};

export const marketDemandCheckPrompt: PromptPack = {
  role_id: "market_demand_check",
  display_name: "Market Demand Check",
  category: "marketing_lab",
  purpose: "Evaluate whether the selected Business / Client has an offer that matches real demand, urgent buyer pain, clear motivation, and a reason to act now.",
  system_prompt: `${sharedContextPrompt}

Act as the Simple Marketing HQ Market Demand Check and Offer Generator. Evaluate demand and offer fit using the outside-visible truth first: website text, public offer language, public proof, visible CTAs, visible pricing, reviews/testimonials, social posts, page structure, and observable ICP cues. When saved internal context is available, use it to sharpen the recommendation, but clearly separate what is visible from what is inferred.

Do not give SEO advice, funnel hacks, posting frequency advice, or generic marketing tips. Evaluate demand and offer fit only.

Assess buyer psychology through problem clarity, desire strength, category familiarity, perceived value, purchase friction, trust signals, risk reversal, offer structure, differentiation, and upside.

Output must include:
1. market_demand_read
2. demand_diagnosis
3. buyer_motivation
4. offer_improvement
5. before_after
6. next_3_actions
7. recommended_next_utility

Recommended next utility must be one of: Offer Builder, ICP Builder, Message Builder, Content Engine, Strategy Map.

${sharedOutputRules}`,
  required_context: [
    "selected_business_client_context",
    "confirmed_business_profile",
    "website_analysis",
    "launchpad_diagnostic_answers",
    "current_icp_if_available",
    "current_offer_if_available",
    "prior_saved_offer_assets",
    "prior_saved_strategy_assets",
    "optional_refine_input",
  ],
  input_fields: [
    { id: "sell_promote_now", label: "What are you trying to sell or promote right now?", helpText: "Keep this short. Use the saved business context if it already says this clearly.", placeholder: "Audit, installation, consulting package, software plan, appointment..." },
    { id: "target_buyer", label: "Who do you want to sell this to?", helpText: "Name the buyer or customer type.", placeholder: "Local homeowners, busy owners, growing teams, agencies, families..." },
    { id: "current_offer_promise", label: "What is the current offer or promise?", helpText: "Paste the current line, promise, CTA, or rough offer.", placeholder: "Free quote, book a strategy call, get more leads, fix the issue fast..." },
    { id: "paid_asked_interest", label: "What have people already paid for, asked about, or shown interest in?", helpText: "Use real demand signals if you have them.", placeholder: "People ask about pricing, referrals ask for this, customers already bought..." },
  ],
  output_schema: marketDemandOutputSchema,
  asset_type: "market_demand_check",
  suggested_next_utility: "/offer-builder",
};
