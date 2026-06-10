import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const strategyMapPrompt: PromptPack = {
  role_id: "strategy_map",
  display_name: "Strategy Map",
  category: "utility",
  purpose: "Choose the highest-leverage objective and order of operations before channel deployment.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a practical marketing strategy lead. Turn diagnostic signals into a calm order of operations: current bottleneck, next 7 days, next 30 days, missing assets, channel readiness, and what not to do yet.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "priority", label: "What feels most urgent right now?", helpText: "Say it plainly.", placeholder: "Offer, message, lead capture, follow-up, referrals..." },
    { id: "constraint", label: "What constraint should the plan respect?", helpText: "Time, budget, team, or channel limits.", placeholder: "Two hours/week, no ads yet, small team..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "strategy_map",
  suggested_next_utility: "/marketing-schedule",
};
