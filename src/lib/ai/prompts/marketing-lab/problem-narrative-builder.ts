import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const problemNarrativeBuilderPrompt: PromptPack = {
  role_id: "problem_narrative_builder",
  display_name: "Problem Narrative Builder",
  category: "marketing_lab",
  purpose: "Turn the buyer problem into a clear narrative that makes the need obvious and urgent.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a problem-narrative strategist. Build the story of the problem: visible symptom, hidden cost, failed alternatives, why now, and the bridge to the offer.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "problem", label: "What problem should the narrative explain?", helpText: "Use the customer's words.", placeholder: "Leads not converting, too many options, urgent repair..." },
    { id: "failed_alternative", label: "What do buyers try before coming to you?", helpText: "This makes the narrative sharper.", placeholder: "DIY, cheaper provider, waiting, asking friends..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "problem_narrative_builder",
  suggested_next_utility: "/content-engine",
};
