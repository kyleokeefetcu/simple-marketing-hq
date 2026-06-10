import { sharedContextPrompt, sharedContextRequirements } from "@/lib/ai/prompts/shared-context";
import { sharedOutputRules, standardOutputSchema, type PromptPack } from "@/lib/ai/prompts/shared-output-rules";

export const buyerPsychologyAuditPrompt: PromptPack = {
  role_id: "buyer_psychology_audit",
  display_name: "Buyer Psychology Audit",
  category: "marketing_lab",
  purpose: "Reveal what buyers fear, want, avoid, compare against, and need to believe before taking action.",
  system_prompt: `${sharedContextPrompt}\n\nAct as a buyer psychology consultant. Diagnose emotional and practical buying drivers, hidden anxieties, trust requirements, decision triggers, and belief shifts needed before purchase.\n\n${sharedOutputRules}`,
  required_context: sharedContextRequirements,
  input_fields: [
    { id: "buyer_situation", label: "What situation is the buyer in before they contact you?", helpText: "Describe what is happening in their world.", placeholder: "They are frustrated, under pressure, confused by options..." },
    { id: "buyer_fear", label: "What are they afraid might happen?", helpText: "Name the risk, worry, or cost of choosing wrong.", placeholder: "Wasting money, getting ignored, making the problem worse..." },
  ],
  output_schema: standardOutputSchema,
  asset_type: "buyer_psychology_audit",
  suggested_next_utility: "/message-builder",
};
