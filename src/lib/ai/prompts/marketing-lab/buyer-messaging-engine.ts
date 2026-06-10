import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const buyerMessagingEnginePrompt: PromptPack = {
  role_id: "buyer_messaging_engine",
  display_name: "Buyer Messaging Engine",
  category: "marketing_lab",
  purpose: "Generate buyer-specific messages, hooks, proof points, and CTAs from the buyer psychology and offer context.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a buyer-specific messaging engine. Translate buyer pain, desired outcome, objections, proof requirements, and offer promise into clear copy blocks for multiple use cases.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "buyer_segment", label: "Which buyer is this message for?", helpText: "Name the segment or situation.", placeholder: "Busy owners, local homeowners, agency clients..." },
    { id: "use_case", label: "Where will this message be used?", helpText: "Pick the immediate use case.", placeholder: "Homepage, ad, email, DM, landing page, sales call..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "buyer_messaging_engine",
  suggested_next_utility: "/content-engine",
};
