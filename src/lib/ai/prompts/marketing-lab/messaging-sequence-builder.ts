import { sharedContextPrompt } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

const messagingSequenceOutputSchema = {
  sequence_strategy: {
    buyer_stage: "string",
    goal_of_sequence: "string",
    primary_message_angle: "string",
    proof_needed: "string",
    objection_to_handle: "string",
    cta: "string",
  },
  sequence_map: [
    {
      step_number: "number",
      purpose: "string",
      message: "string",
      why_this_step_matters: "string",
      cta_or_next_move: "string",
    },
  ],
  copy_blocks: {
    email_subject_lines: ["string"],
    email_body_sections: ["string"],
    ad_hooks: ["string"],
    landing_page_sections: ["string"],
    follow_up_messages: ["string"],
    social_captions: ["string"],
    video_script_beats: ["string"],
  },
  before_after_sequence: {
    current_before_sequence: "string",
    improved_after_sequence: "string",
    why_the_after_is_better: "string",
  },
  objection_handling: [
    {
      likely_objection: "string",
      response: "string",
      where_it_belongs_in_sequence: "string",
    },
  ],
  next_3_actions: ["string", "string", "string"],
  recommended_next_utility: "Content Engine | Marketing Schedule | Strategy Map | Advisor",
};

export const messagingSequenceBuilderPrompt: PromptPack = {
  role_id: "messaging_sequence_builder",
  display_name: "Messaging Sequence Builder",
  category: "marketing_lab",
  purpose: "Create a structured messaging sequence that moves a buyer from attention to understanding to trust to action.",
  system_prompt: `${sharedContextPrompt}

Act as the Simple Marketing HQ Messaging Sequence Builder. Your job is to create a practical sequence the selected Business / Client can deploy through outside channels.

Use the Engagement -> Interaction -> Adoption sequence:
- Engagement earns attention through recognition.
- Interaction invites a small, safe next move.
- Adoption creates relief, confidence, and clear action.

Use selected business/client context, confirmed business profile, website analysis, diagnostic answers, latest ICP, latest offer, latest messaging asset, latest Problem Narrative, latest content asset, and optional refine input.

Do not generate random disconnected messages. The sequence must build logically from attention to understanding to trust to action. Do not add hype, scarcity, or unsupported claims. Use proof before asking for commitment. Make each step do one job.

Output must include:
1. sequence_strategy
2. sequence_map
3. copy_blocks
4. before_after_sequence
5. objection_handling
6. next_3_actions
7. recommended_next_utility

Recommended next utility must be one of: Content Engine, Marketing Schedule, Strategy Map, Advisor.

${sharedOutputRules}`,
  required_context: [
    "selected_business_client_context",
    "confirmed_business_profile",
    "website_analysis",
    "launchpad_diagnostic_answers",
    "latest_icp_asset",
    "latest_offer_asset",
    "latest_messaging_asset",
    "latest_problem_narrative",
    "latest_content_asset",
    "optional_refine_input",
  ],
  input_fields: [
    { id: "sequence_type", label: "What sequence do you want to build?", helpText: "Choose the format or campaign path.", placeholder: "email sequence, landing page sequence, ad-to-page sequence, social campaign sequence, follow-up sequence, video/script sequence, sales conversation sequence" },
    { id: "sequence_goal", label: "What are you trying to move the buyer toward?", helpText: "Name the next action.", placeholder: "Book a call, request a quote, reply, download, schedule, start a trial..." },
    { id: "sequence_buyer", label: "Who is this sequence for?", helpText: "Name the buyer or customer situation.", placeholder: "Busy owners, local homeowners, growing teams, agency clients..." },
    { id: "sequence_channel", label: "What channel will you use?", helpText: "Choose the deployment channel.", placeholder: "Email, landing page, ads, social, follow-up, video, sales conversation..." },
  ],
  output_schema: messagingSequenceOutputSchema,
  asset_type: "messaging_sequence",
  suggested_next_utility: "/marketing-schedule",
};
