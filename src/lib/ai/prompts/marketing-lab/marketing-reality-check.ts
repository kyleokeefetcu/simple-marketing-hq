import { sharedContextPrompt } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

const marketingRealityCheckOutputSchema = {
  reality_check_summary: {
    overall_read: "string",
    strongest_part: "string",
    weakest_part: "string",
    biggest_bottleneck: "string",
    confidence_level: "string",
  },
  what_is_working: {
    clear_items: ["string"],
    usable_assets: ["string"],
    strengths_to_keep: ["string"],
  },
  what_is_confusing: {
    unclear_message: "string",
    weak_offer: "string",
    vague_audience: "string",
    missing_proof: "string",
    weak_cta: "string",
    channel_foundation_mismatch: "string",
  },
  what_is_missing: {
    missing_icp_clarity: "string",
    missing_offer_clarity: "string",
    missing_proof: "string",
    missing_follow_up: "string",
    missing_content_angle: "string",
    missing_next_step: "string",
  },
  what_to_ignore_for_now: {
    low_priority_distractions: ["string"],
    channels_tools_not_ready_yet: ["string"],
    tasks_that_should_wait: ["string"],
  },
  highest_leverage_fix: {
    recommended_fix: "string",
    why_it_matters: "string",
    what_changes_if_fixed: "string",
  },
  before_after: {
    before_current_state: "string",
    after_sharper_version: "string",
    why_the_after_is_better: "string",
  },
  next_3_actions: ["string", "string", "string"],
  recommended_next_utility: "ICP Builder | Offer Builder | Message Builder | Content Engine | Strategy Map | Advisor",
};

export const marketingRealityCheckPrompt: PromptPack = {
  role_id: "marketing_reality_check",
  display_name: "Marketing Reality Check",
  category: "marketing_lab",
  purpose: "Give the business owner a direct, constructive audit of what is clear, confusing, missing, too generic, and worth fixing first in their marketing foundation.",
  system_prompt: `${sharedContextPrompt}

Act as the Simple Marketing HQ Marketing Reality Check. This is a direct, constructive, practical audit of the selected Business / Client's marketing foundation. It is a steering tool, not a takedown.

Do not mention source-pack names in user-facing output. Do not shame, hype, moralize, or speculate. Use only observable and saved context: selected business/client context, confirmed business profile, website analysis, diagnostic answers, latest ICP, latest offer, latest message, latest strategy asset, and focused user input.

Identify:
- what is actually holding the marketing back
- what looks unclear to a buyer
- what is missing from the foundation
- what is too generic
- what should be ignored for now
- what should be fixed first
- which Simple Marketing HQ utility should be used next

Tone must be clear, honest, useful, constructive, and business-owner friendly. Avoid abstract marketing jargon and overconfident claims without evidence. If confidence is low, say what needs confirmation.

Output must include:
1. reality_check_summary
2. what_is_working
3. what_is_confusing
4. what_is_missing
5. what_to_ignore_for_now
6. highest_leverage_fix
7. before_after
8. next_3_actions
9. recommended_next_utility

Recommended next utility must be one of: ICP Builder, Offer Builder, Message Builder, Content Engine, Strategy Map, Advisor.

${sharedOutputRules}`,
  required_context: [
    "selected_business_client_context",
    "confirmed_business_profile",
    "website_analysis",
    "launchpad_diagnostic_answers",
    "latest_icp_asset",
    "latest_offer_asset",
    "latest_message_asset",
    "latest_strategy_asset",
    "focused_user_input",
  ],
  input_fields: [
    { id: "check_focus", label: "What do you want checked?", helpText: "Choose the foundation area.", placeholder: "website, offer, messaging, content, overall marketing foundation, campaign idea" },
    { id: "improvement_goal", label: "What are you trying to improve?", helpText: "Name the business result or marketing problem.", placeholder: "More qualified calls, clearer offer, better website conversion, stronger content..." },
    { id: "tried_so_far", label: "What have you tried so far?", helpText: "List real activity, not the ideal plan.", placeholder: "Posting, referrals, ads, emails, networking, website edits..." },
  ],
  output_schema: marketingRealityCheckOutputSchema,
  asset_type: "marketing_reality_check",
  suggested_next_utility: "/strategy-map",
};
