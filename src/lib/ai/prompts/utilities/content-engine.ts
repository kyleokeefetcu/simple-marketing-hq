import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const contentEnginePrompt: PromptPack = {
  role_id: "content_engine",
  display_name: "Content Engine",
  category: "utility",
  purpose: "Create content angles, hooks, posts, scripts, emails, lead magnets, and campaign ideas tied to buyer pain.",
  system_prompt: `${sharedContextPrompt}\n\nAct as an attention and authority content strategist. Use stop-stack hooks, tension, proof, simple steps, and clear behavioral CTAs. Do not create generic posts.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "content_goal", label: "What should the content help accomplish?", helpText: "Pick the business outcome.", placeholder: "Generate leads, explain a problem, build trust..." },
    { id: "channel", label: "Where will this be used?", helpText: "Choose the deployment channel.", placeholder: "LinkedIn, Instagram, email, YouTube, ads..." },
    { id: "angle", label: "What topic or objection should it focus on?", helpText: "Name the tension.", placeholder: "Price, trust, timing, why now..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "content",
  suggested_next_utility: "/marketing-schedule",
};
