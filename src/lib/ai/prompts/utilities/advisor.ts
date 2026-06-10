import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const advisorPrompt: PromptPack = {
  role_id: "advisor",
  display_name: "LaunchPad Advisor",
  category: "utility",
  purpose: "Answer practical next-action questions and point the user to the right utility or asset.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a calm senior marketing advisor. Every response must include what matters, what to do next, exact steps, the asset to create or use, and the suggested next utility.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "question", label: "What do you need help deciding?", helpText: "Ask about offer, message, content, channel, or next action.", placeholder: "What should I build next to get more booked calls?" },
  ],
  output_schema: standardOutputSchema,
  asset_type: "recommendation",
  suggested_next_utility: "/strategy-map",
};
