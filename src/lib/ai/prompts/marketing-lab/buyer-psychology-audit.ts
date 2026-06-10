import { sharedContextPrompt } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

const buyerPsychologyOutputSchema = {
  buyer_psychology_summary: {
    what_the_buyer_likely_understands: "string",
    what_the_buyer_likely_doubts: "string",
    what_the_buyer_likely_wants: "string",
    what_the_buyer_may_be_confused_by: "string",
    confidence_level: "Low | Medium | High",
  },
  current_state_read: {
    current_message: "string",
    current_promise: "string",
    current_cta: "string",
    current_trust_signals: ["string"],
    current_friction_points: ["string"],
  },
  psychology_findings: {
    emotional_drivers: ["string"],
    logical_drivers: ["string"],
    risk_fear_points: ["string"],
    urgency_signals: ["string"],
    missing_belief_shift: "string",
    trust_gaps: ["string"],
    clarity_gaps: ["string"],
  },
  before_after_improvements: [
    {
      type: "headline | CTA | offer_explanation | proof_trust | opening_message",
      before: "string",
      after: "string",
      why_the_after_is_better: "string",
      where_to_use_it: ["string"],
    },
  ],
  top_3_changes: ["string", "string", "string"],
  next_3_actions: ["string", "string", "string"],
  recommended_next_utility: "Message Builder | Offer Builder | Content Engine | Strategy Map",
};

export const buyerPsychologyAuditPrompt: PromptPack = {
  role_id: "buyer_psychology_audit",
  display_name: "Buyer Psychology Audit",
  category: "marketing_lab",
  purpose: "Evaluate a website, landing page, offer, or message through buyer psychology so the business can see what buyers understand, doubt, trust, and need before acting.",
  system_prompt: `${sharedContextPrompt}

Act as the Simple Marketing HQ Buyer Psychology Audit. Evaluate the selected website, page, offer, or message through buyer psychology. This is not a website scanner and not a harsh teardown. It is a consultant-grade buyer psychology read that helps the user see what buyers likely notice, misunderstand, trust, doubt, want, avoid, and need before they take action.

Use the saved website analysis, confirmed profile, diagnostic answers, ICP, offer, and messaging assets first. If a specific page URL or message is provided, focus there. Do not make unsupported claims. If confidence is low, state what needs to be confirmed.

Evaluate through these lenses:
- ICP and buyer identity
- Buyer psychology pillars: relevance, pain recognition, curiosity, specific promise, clarity, credibility, risk reversal, value stack, quick win, emotional relief, empowerment, transformation
- Customer journey friction
- Offer clarity and risk
- Brand perception and emotional tone
- Buyer trust journey: logic/proof, safety/empathy, identity fit
- Identity shift
- Emotional buying arc
- Behavioral economics: loss aversion, social proof, framing, cognitive fluency, choice architecture
- Problem/promise/product alignment

Output must include:
1. buyer_psychology_summary
2. current_state_read
3. psychology_findings
4. before_after_improvements
5. top_3_changes
6. next_3_actions
7. recommended_next_utility

Recommended next utility must be one of: Message Builder, Offer Builder, Content Engine, Strategy Map.

${sharedOutputRules}`,
  required_context: [
    "selected_business_client_context",
    "confirmed_business_profile",
    "full_website_analysis",
    "specific_page_url_if_provided",
    "launchpad_diagnostic_answers",
    "current_icp_if_available",
    "current_offer_if_available",
    "current_messaging_assets_if_available",
    "focused_user_input",
  ],
  input_fields: [
    { id: "review_target", label: "What page, offer, or message do you want reviewed?", helpText: "Paste a page URL, headline, CTA, offer, or message. You can also use saved website analysis.", placeholder: "Homepage, pricing page, service page, offer line, ad, email..." },
    { id: "buyer_action", label: "What should this page/message help the buyer do?", helpText: "Name the action you want the buyer to take.", placeholder: "Book a call, request a quote, reply, start a trial, schedule..." },
    { id: "intended_buyer", label: "Who is the intended buyer?", helpText: "Name the buyer or customer type.", placeholder: "Local homeowners, busy owners, growing teams, agency clients..." },
  ],
  output_schema: buyerPsychologyOutputSchema,
  asset_type: "buyer_psychology_audit",
  suggested_next_utility: "/message-builder",
};
