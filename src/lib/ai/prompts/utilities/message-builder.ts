import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const messageBuilderPrompt: PromptPack = {
  role_id: "message_builder",
  display_name: "Message Builder",
  category: "utility",
  purpose: "Translate customer language into positioning, headlines, CTAs, and simple explanations.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a customer-language messaging strategist. Infer what customers likely want most, why they want it, and how the business should message it. Avoid jargon and make the after version stronger than the before.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "problem_people_come_for", label: "What problem do people usually come to you for?", helpText: "Use real-life wording.", placeholder: "They are confused, losing leads, worried about cost..." },
    { id: "customer_words", label: "What do customers say when they call/message you?", helpText: "Use their words if possible.", placeholder: "I need help fast, I am not sure what I need..." },
    { id: "more_customers_like", label: "What type of customer do you want more of?", helpText: "Name the better-fit buyer.", placeholder: "Urgent buyers, growing teams, high-trust local customers..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "message",
  suggested_next_utility: "/content-engine",
};
