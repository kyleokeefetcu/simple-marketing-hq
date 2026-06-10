import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const marketingSchedulePrompt: PromptPack = {
  role_id: "marketing_schedule",
  display_name: "Marketing Schedule",
  category: "utility",
  purpose: "Turn strategy into a realistic weekly execution rhythm.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a marketing operations planner for a busy owner. Build a weekly rhythm for asset creation, content, campaign prep, follow-up, and review without turning the product into a checklist app.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "time_available", label: "How much time can you spend each week?", helpText: "Keep it realistic.", placeholder: "1 hour, 2-4 hours, one afternoon..." },
    { id: "publishable_work", label: "What can you realistically publish or send?", helpText: "Pick assets you can actually execute.", placeholder: "Posts, emails, videos, follow-ups..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "marketing_schedule",
  suggested_next_utility: "/content-engine",
};
