import { sharedContextPrompt } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

const problemNarrativeOutputSchema = {
  problem_summary: {
    plain_language_problem: "string",
    buyer_before_state: "string",
    buyer_desired_after_state: "string",
    why_this_matters_now: "string",
    confidence_level: "string",
  },
  problem_narrative: {
    short_version: "string",
    medium_version: "string",
    story_style_version: "string",
    direct_response_version: "string",
  },
  tension_points: {
    what_is_frustrating: "string",
    what_is_costly: "string",
    what_is_confusing: "string",
    what_is_being_delayed: "string",
    what_buyers_may_not_realize_yet: "string",
  },
  belief_shift: {
    current_belief: "string",
    new_belief: "string",
    reason_to_believe: "string",
    proof_needed: "string",
  },
  before_after_message: {
    before: "string",
    after: "string",
    why_the_after_is_better: "string",
    where_to_use_it: ["string"],
  },
  content_angles: {
    social_post_angles: ["string"],
    video_hooks: ["string"],
    email_angles: ["string"],
    ad_angles: ["string"],
    faq_angles: ["string"],
  },
  copy_paste_blocks: [
    {
      label: "string",
      value: "string",
    },
  ],
  next_3_actions: ["string", "string", "string"],
  recommended_next_utility: "Content Engine | Message Builder | Offer Builder | Strategy Map",
};

export const problemNarrativeBuilderPrompt: PromptPack = {
  role_id: "problem_narrative_builder",
  display_name: "Problem Narrative Builder",
  category: "marketing_lab",
  purpose: "Turn the customer's problem into a clear narrative that can power content, website copy, ads, emails, landing pages, and sales conversations.",
  system_prompt: `${sharedContextPrompt}

Act as the Simple Marketing HQ Problem Narrative Builder. Your job is to help the selected Business / Client explain the buyer's problem in a way that creates recognition, urgency, and trust without hype or fake drama.

Do not sell, pitch, or jump straight to tactics. Define the problem clearly first. Externalize the problem so the buyer is never framed as foolish or at fault. Respect buyer effort, explain why prior attempts may have failed, and stay with one clear problem.

Use selected business/client context, confirmed business profile, website analysis, diagnostic answers, latest ICP, latest offer, latest Buyer Psychology Audit, latest Buyer Messaging output, and optional refine input.

The output should answer:
- What problem does the buyer actually feel?
- What is the before state?
- What is the cost of staying there?
- What belief needs to change?
- What better future are they trying to reach?
- How should this be framed in a practical, believable way?

Write with calm, precise, direct language. Avoid overhyped pain amplification. Do not make unsupported claims. If confidence is low, name what needs confirmation.

Output must include:
1. problem_summary
2. problem_narrative
3. tension_points
4. belief_shift
5. before_after_message
6. content_angles
7. copy_paste_blocks
8. next_3_actions
9. recommended_next_utility

Recommended next utility must be one of: Content Engine, Message Builder, Offer Builder, Strategy Map.

${sharedOutputRules}`,
  required_context: [
    "selected_business_client_context",
    "confirmed_business_profile",
    "website_analysis",
    "launchpad_diagnostic_answers",
    "latest_icp_asset",
    "latest_offer_asset",
    "latest_buyer_psychology_audit",
    "latest_buyer_messaging_output",
    "optional_refine_input",
  ],
  input_fields: [
    { id: "customer_problem", label: "What customer problem do you want to explain?", helpText: "Use the buyer's words where possible.", placeholder: "They are confused by options, leads are not converting, the process feels risky..." },
    { id: "problem_audience", label: "Who experiences this problem?", helpText: "Name the buyer, customer, or situation.", placeholder: "Busy owners, local homeowners, growing teams, agency clients..." },
    { id: "narrative_use", label: "Where will this narrative be used?", helpText: "Choose the immediate use case.", placeholder: "website, ad, social content, email, sales script, landing page, video" },
  ],
  output_schema: problemNarrativeOutputSchema,
  asset_type: "problem_narrative",
  suggested_next_utility: "/content-engine",
};
