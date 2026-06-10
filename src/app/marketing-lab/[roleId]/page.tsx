import { notFound } from "next/navigation";
import { MarketingLabWorkflow } from "@/components/marketing-lab/marketing-lab-workflow";
import { isPromptRoleId } from "@/lib/ai/prompts/registry";

function normalizeRoleId(value: string) {
  return value.replace(/-/g, "_");
}

export default async function MarketingLabRolePage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const normalized = normalizeRoleId(roleId);

  if (!isPromptRoleId(normalized)) notFound();

  return <MarketingLabWorkflow roleId={normalized} />;
}
