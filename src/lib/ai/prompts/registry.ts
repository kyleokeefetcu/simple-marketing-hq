import { advisorPrompt } from "@/lib/ai/prompts/utilities/advisor";
import { contentEnginePrompt } from "@/lib/ai/prompts/utilities/content-engine";
import { icpBuilderPrompt } from "@/lib/ai/prompts/utilities/icp-builder";
import { marketingSchedulePrompt } from "@/lib/ai/prompts/utilities/marketing-schedule";
import { messageBuilderPrompt } from "@/lib/ai/prompts/utilities/message-builder";
import { offerBuilderPrompt } from "@/lib/ai/prompts/utilities/offer-builder";
import { researchHubPrompt } from "@/lib/ai/prompts/utilities/research-hub";
import { strategyMapPrompt } from "@/lib/ai/prompts/utilities/strategy-map";
import { buyerMessagingEnginePrompt } from "@/lib/ai/prompts/marketing-lab/buyer-messaging-engine";
import { buyerPsychologyAuditPrompt } from "@/lib/ai/prompts/marketing-lab/buyer-psychology-audit";
import { marketDemandCheckPrompt } from "@/lib/ai/prompts/marketing-lab/market-demand-check";
import { marketingRealityCheckPrompt } from "@/lib/ai/prompts/marketing-lab/marketing-reality-check";
import { messagingSequenceBuilderPrompt } from "@/lib/ai/prompts/marketing-lab/messaging-sequence-builder";
import { problemNarrativeBuilderPrompt } from "@/lib/ai/prompts/marketing-lab/problem-narrative-builder";
import type { PromptPack, PromptRoleId } from "@/lib/ai/prompts/shared-output-rules";

export const promptRegistry: Record<PromptRoleId, PromptPack> = {
  icp_builder: icpBuilderPrompt,
  offer_builder: offerBuilderPrompt,
  message_builder: messageBuilderPrompt,
  content_engine: contentEnginePrompt,
  strategy_map: strategyMapPrompt,
  marketing_schedule: marketingSchedulePrompt,
  research_hub: researchHubPrompt,
  advisor: advisorPrompt,
  buyer_psychology_audit: buyerPsychologyAuditPrompt,
  marketing_reality_check: marketingRealityCheckPrompt,
  market_demand_check: marketDemandCheckPrompt,
  problem_narrative_builder: problemNarrativeBuilderPrompt,
  messaging_sequence_builder: messagingSequenceBuilderPrompt,
  buyer_messaging_engine: buyerMessagingEnginePrompt,
};

export const utilityPromptPacks = Object.values(promptRegistry).filter((prompt) => prompt.category === "utility");
export const marketingLabPromptPacks = Object.values(promptRegistry).filter((prompt) => prompt.category === "marketing_lab");

export function getPromptPack(roleId: PromptRoleId) {
  return promptRegistry[roleId];
}

export function isPromptRoleId(value: string): value is PromptRoleId {
  return value in promptRegistry;
}
