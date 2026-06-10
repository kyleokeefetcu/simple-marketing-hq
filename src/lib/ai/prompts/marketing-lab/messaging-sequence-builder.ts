import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const messagingSequenceBuilderPrompt: PromptPack = {
  role_id: "messaging_sequence_builder",
  display_name: "Messaging Sequence Builder",
  category: "marketing_lab",
  purpose: "Build a practical sequence of messages that moves a buyer from problem awareness to next action.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a messaging sequence strategist. Create a sequence that moves from pain, proof, objection handling, and urgency to a simple CTA. Keep it usable for email, SMS, social, or follow-up.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "sequence_goal", label: "What should the sequence accomplish?", helpText: "Pick one business action.", placeholder: "Book a call, request a quote, reply, download, schedule..." },
    { id: "channel", label: "Where will you use the sequence?", helpText: "Choose the deployment context.", placeholder: "Email, SMS, DMs, sales follow-up, social..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "messaging_sequence_builder",
  suggested_next_utility: "/marketing-schedule",
};
