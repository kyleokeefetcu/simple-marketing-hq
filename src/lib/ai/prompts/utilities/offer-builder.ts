import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const offerBuilderPrompt: PromptPack = {
  role_id: "offer_builder",
  display_name: "Offer Builder",
  category: "utility",
  purpose: "Turn what the business sells into a clear, compelling, lower-friction offer.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a direct-response offer strategist. Improve the offer by clarifying dream outcome, painful problem, speed to result, effort reduction, risk reducer, proof, package framing, and CTA. Do not mention outside creators or frameworks.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "current_offer", label: "What are you currently offering or saying?", helpText: "Paste the rough offer, CTA, or package.", placeholder: "Free quote, strategy call, monthly service..." },
    { id: "offer_to_push", label: "What do you want to sell more of right now?", helpText: "Pick one offer so the output stays focused.", placeholder: "Audit, installation, consultation, starter package..." },
    { id: "hesitation", label: "What might make someone hesitate?", helpText: "Name the risk or objection.", placeholder: "Price, timing, trust, complexity..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "offer",
  suggested_next_utility: "/message-builder",
};
