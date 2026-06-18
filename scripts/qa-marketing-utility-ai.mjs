import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync("src/lib/ai/marketing-utility-contracts.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox, { filename: "marketing-utility-contracts.ts" });
const { marketingUtilityContracts, buildMarketingUtilityAnswer, getDefaultGuidedAction, validateMarketingUtilityAnswer } = sandbox.exports;

const context = {
  businessName: "Talk to Fred",
  website: "https://talktofred.com",
  industry: "AI website agent for service businesses",
  offer: "approved-content AI website agent that answers visitor questions, captures leads, and books calls",
  audience: "service businesses and agencies with lead-generating websites",
  buyerPain: "website visitors ask buying questions but leave or go cold when the business cannot answer instantly, safely, and consistently",
  outcome: "turn website questions into qualified leads with AI that only answers from approved content",
  proof: "approved content, safe answer guardrails, and clean lead handoff",
  channel: "website conversion",
  currentAsset: "Talk to Fred approved-content AI website agent",
  savedAssets: ["Offer HQ: approved-content AI website agent", "Audience HQ: service businesses and agencies"],
};

function assert(name, condition, detail = "") {
  if (!condition) {
    console.error(`FAIL: ${name}`);
    if (detail) console.error(detail);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${name}`);
  }
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

const forbiddenMain = /^(not enough leads|need more leads|need more traffic|improve marketing|create more content|run ads|build awareness|increase conversions|get more customers|better messaging|follow up more)\.?$/i;
let contractCount = 0;
let actionCount = 0;

for (const contract of Object.values(marketingUtilityContracts)) {
  assert(`${contract.utilityName} has work blocks`, contract.workBlocks.length > 0);
  for (const block of contract.workBlocks) {
    assert(`${contract.utilityId}/${block.workBlockId} has guided actions`, block.guidedActions.length > 0);
    contractCount += 1;
    const defaultAction = getDefaultGuidedAction(contract.utilityId, block.workBlockId);
    assert(`${contract.utilityId}/${block.workBlockId} has default action`, Boolean(defaultAction), block.defaultActionId ?? "missing defaultActionId");
    assert(`${contract.utilityId}/${block.workBlockId} default action exists in guided actions`, block.guidedActions.some((action) => action.actionId === block.defaultActionId), block.defaultActionId ?? "missing defaultActionId");
    if (defaultAction) {
      const defaultResult = buildMarketingUtilityAnswer({ utilityId: contract.utilityId, workBlockId: block.workBlockId, actionId: defaultAction.actionId, prompt: defaultAction.userFacingPrompt, context });
      const defaultFirstLine = defaultResult.content.split("\n").find(Boolean) ?? "";
      assert(`${contract.utilityId}/${block.workBlockId} default output is specific`, defaultResult.content.includes("Talk to Fred") || defaultResult.content.includes("approved-content") || defaultResult.content.includes("service businesses"), defaultResult.content);
      assert(`${contract.utilityId}/${block.workBlockId} default output is not generic`, !forbiddenMain.test(defaultFirstLine.trim()), defaultResult.content);
      assert(`${contract.utilityId}/${block.workBlockId} default output passes validation`, validateMarketingUtilityAnswer({ response: defaultResult.content, utilityId: contract.utilityId, workBlockId: block.workBlockId, actionId: defaultAction.actionId, context }).length === 0, defaultResult.content);
    }
    const outputs = [];
    for (const action of block.guidedActions) {
      actionCount += 1;
      const result = buildMarketingUtilityAnswer({ utilityId: contract.utilityId, workBlockId: block.workBlockId, actionId: action.actionId, prompt: action.userFacingPrompt, context });
      const firstLine = result.content.split("\n").find(Boolean) ?? "";
      outputs.push(normalize(result.content));
      assert(`${contract.utilityId}/${block.workBlockId}/${action.actionId} has specific output`, result.content.includes("Talk to Fred") || result.content.includes("approved-content") || result.content.includes("service businesses"), result.content);
      assert(`${contract.utilityId}/${block.workBlockId}/${action.actionId} is not generic`, !forbiddenMain.test(firstLine.trim()), result.content);
      assert(`${contract.utilityId}/${block.workBlockId}/${action.actionId} passes validation`, validateMarketingUtilityAnswer({ response: result.content, utilityId: contract.utilityId, workBlockId: block.workBlockId, actionId: action.actionId, context }).length === 0, result.content);
      assert(`${contract.utilityId}/${block.workBlockId}/${action.actionId} is answer-first length`, result.content.length <= 1400, result.content.length.toString());
    }
    const uniqueOutputs = new Set(outputs);
    assert(`${contract.utilityId}/${block.workBlockId} guided outputs are not identical`, uniqueOutputs.size === outputs.length, outputs.join("\n---\n"));
  }
}

const strategyActions = [
  ["find_bottleneck", "What is the current bottleneck?", /Current bottleneck:/, /not just raw lead volume|proof, trust, and conversion clarity/i],
  ["fix_first", "What should we fix first?", /Fix first:/, /demo|approved content|handoff/i],
  ["biggest_leak", "What is the biggest leak?", /Biggest leak:/, /trust leaks|conversion|revenue/i],
  ["what_to_ignore", "What should we ignore for now?", /Ignore for now:/, /more channels|ads|content|partner pushes/i],
];

for (const [actionId, prompt, labelPattern, contentPattern] of strategyActions) {
  const result = buildMarketingUtilityAnswer({ utilityId: "strategy_map", workBlockId: "current-bottleneck", actionId, prompt, context });
  assert(`Strategy Current Bottleneck ${actionId} label`, labelPattern.test(result.content), result.content);
  assert(`Strategy Current Bottleneck ${actionId} specific`, contentPattern.test(result.content), result.content);
  assert(`Strategy Current Bottleneck ${actionId} not not-enough-leads`, !/^.*not enough leads\.?\s*$/im.test(result.content), result.content);
}

const bottleneckOutputs = strategyActions.map(([actionId, prompt]) => buildMarketingUtilityAnswer({ utilityId: "strategy_map", workBlockId: "current-bottleneck", actionId, prompt, context }).content);
assert("Strategy Current Bottleneck buttons are distinct", new Set(bottleneckOutputs.map(normalize)).size === bottleneckOutputs.length);
assert("Contract coverage count", contractCount >= 70, `contracts=${contractCount}`);
assert("Guided action coverage count", actionCount >= 300, `actions=${actionCount}`);
