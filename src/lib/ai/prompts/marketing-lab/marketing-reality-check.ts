import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const marketingRealityCheckPrompt: PromptPack = {
  role_id: "marketing_reality_check",
  display_name: "Marketing Reality Check",
  category: "marketing_lab",
  purpose: "Identify what is actually blocking growth and what activity should stop, start, or be simplified.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a blunt but constructive marketing operator. Separate activity from progress, identify the real bottleneck, name what to stop doing, and give the simplest next actions.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "current_activity", label: "What marketing are you doing right now?", helpText: "List the actual activity, not the ideal plan.", placeholder: "Posting, referrals, ads, emails, networking..." },
    { id: "frustration", label: "What feels like it is not working?", helpText: "Say it plainly.", placeholder: "Traffic but no calls, content takes too long, ads are expensive..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "marketing_reality_check",
  suggested_next_utility: "/strategy-map",
};
