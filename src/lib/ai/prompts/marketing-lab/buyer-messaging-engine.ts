import { sharedContextPrompt } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

const buyerMessagingOutputSchema = {
  messaging_strategy: {
    target_buyer: "string",
    buyer_pain: "string",
    desired_outcome: "string",
    key_belief_to_shift: "string",
    strongest_angle: "string",
    tone_recommendation: "string",
  },
  current_vs_improved: {
    current_before_message: "string",
    improved_after_message: "string",
    why_the_after_is_better: "string",
    where_to_use_it: ["string"],
  },
  core_message_assets: {
    positioning_statement: "string",
    homepage_headline: "string",
    subheadline: "string",
    simple_explanation: "string",
    offer_statement: "string",
    cta_options: ["string"],
    elevator_pitch: "string",
  },
  channel_versions: {
    website_copy: "string",
    ad_hook: "string",
    social_post: "string",
    email_opener: "string",
    follow_up_script: "string",
    short_video_hook: "string",
    sales_conversation_line: "string",
  },
  objection_responses: [
    {
      objection: "string",
      response: "string",
    },
  ],
  copy_paste_blocks: [
    {
      label: "string",
      value: "string",
    },
  ],
  next_3_actions: ["string", "string", "string"],
  recommended_next_utility: "Content Engine | Offer Builder | Strategy Map | Marketing Schedule",
};

export const buyerMessagingEnginePrompt: PromptPack = {
  role_id: "buyer_messaging_engine",
  display_name: "Buyer Messaging Engine",
  category: "marketing_lab",
  purpose: "Generate buyer-facing messaging that is clear, specific, practical, and ready to use across websites, ads, emails, social posts, follow-up scripts, and sales conversations.",
  system_prompt: `${sharedContextPrompt}

Act as the Simple Marketing HQ Buyer Messaging Engine. Your job is to produce finished buyer-facing messaging, not theory, frameworks, or generic advice. Every output must be copy/paste-ready and specific to the selected Business / Client, buyer, pain, offer, and desired action.

Use external and saved context only: confirmed business profile, diagnostic answers, website analysis, latest ICP, latest offer, latest Market Demand Check, latest Buyer Psychology Audit, and focused user input. You may infer buyer psychology, but do not present unsupported claims as fact.

Avoid generic phrases such as "grow your business", "take it to the next level", "we help businesses succeed", and "tailored solutions".

Sequence messaging by buyer state:
- Engagement: recognition and relevance
- Interaction: low-risk movement
- Adoption: relief, certainty, trust

Output must include:
1. messaging_strategy
2. current_vs_improved
3. core_message_assets
4. channel_versions
5. objection_responses
6. copy_paste_blocks
7. next_3_actions
8. recommended_next_utility

Recommended next utility must be one of: Content Engine, Offer Builder, Strategy Map, Marketing Schedule.

${sharedOutputRules}`,
  required_context: [
    "selected_business_client_context",
    "confirmed_business_profile",
    "launchpad_diagnostic_answers",
    "website_analysis",
    "latest_icp_asset",
    "latest_offer_asset",
    "latest_market_demand_check",
    "latest_buyer_psychology_audit",
    "focused_user_input",
  ],
  input_fields: [
    { id: "messaging_use", label: "What do you need messaging for?", helpText: "Choose the asset type or use case.", placeholder: "website, ad, email, social post, follow-up, sales script, landing page, general clarity" },
    { id: "sell_promote", label: "What are you trying to sell or promote?", helpText: "Keep this short and focused.", placeholder: "Audit, service package, product, consultation, trial, appointment..." },
    { id: "message_buyer", label: "Who is this message for?", helpText: "Name the buyer or customer type.", placeholder: "Busy owners, local homeowners, growing teams, agency clients..." },
    { id: "current_version", label: "What is the current version, if any?", helpText: "Paste the current headline, CTA, offer, email, or message.", placeholder: "Paste the current copy or leave blank if there is none..." },
  ],
  output_schema: buyerMessagingOutputSchema,
  asset_type: "buyer_messaging_output",
  suggested_next_utility: "/content-engine",
};
