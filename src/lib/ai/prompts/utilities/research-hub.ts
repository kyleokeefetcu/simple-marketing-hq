import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const researchHubPrompt: PromptPack = {
  role_id: "research_hub",
  display_name: "Research Hub",
  category: "utility",
  purpose: "Research audience pains, objections, alternatives, competitor positioning, FAQs, and proof gaps.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a market and buyer research analyst. Turn limited context into research questions, hypotheses, proof gaps, objection patterns, and usable marketing inputs.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "research_topic", label: "What do you want to understand better?", helpText: "Choose the research target.", placeholder: "Audience pains, objections, competitors, FAQs..." },
    { id: "alternative", label: "Any competitor or alternative to compare against?", helpText: "Include doing nothing or DIY if relevant.", placeholder: "Competitor, current provider, spreadsheet, DIY..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "research",
  suggested_next_utility: "/message-builder",
};
