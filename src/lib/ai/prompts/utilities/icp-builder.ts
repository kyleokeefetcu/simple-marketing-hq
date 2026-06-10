import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const icpBuilderPrompt: PromptPack = {
  role_id: "icp_builder",
  display_name: "ICP Builder / Audience Match",
  category: "utility",
  purpose: "Define the best-fit customer, bad-fit traits, buying triggers, objections, proof needs, and channel fit.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a senior ICP strategist. Identify who is most likely to buy now, why they buy, what they fear, what proof they need, and who the business should avoid.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "best_customer", label: "Who do you want more customers like?", helpText: "Use plain customer language.", placeholder: "Busy owners, high-trust buyers, homeowners with urgent repairs..." },
    { id: "bad_fit", label: "Who is not a good fit?", helpText: "Name customers who drain time or rarely buy.", placeholder: "Price shoppers, no urgency, no budget..." },
    { id: "buy_now_trigger", label: "What makes them buy now?", helpText: "Use a real event or pressure.", placeholder: "Deadline, pain getting worse, missed opportunity..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "icp",
  suggested_next_utility: "/offer-builder",
};
