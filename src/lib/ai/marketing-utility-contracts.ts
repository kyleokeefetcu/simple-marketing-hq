export type MarketingUtilityId = "icp" | "offer" | "message" | "content" | "strategy_map" | "marketing_schedule" | "research" | "recommendation";

export type MarketingUtilityContext = {
  businessName: string;
  website?: string;
  industry?: string;
  offer?: string;
  audience?: string;
  buyerPain?: string;
  outcome?: string;
  proof?: string;
  channel?: string;
  currentAsset?: string;
  savedAssets?: string[];
};

export type GuidedActionContract = {
  actionId: string;
  buttonLabel: string;
  userFacingPrompt: string;
  expertTask: string;
  mustAnswer: string;
  outputFormat: string;
  forbiddenAnswerPatterns: string[];
  minimumSpecificityRules: string[];
};

export type WorkBlockContract = {
  workBlockId: string;
  label: string;
  expertFrame: string;
  primaryDecision: string;
  guidedActions: GuidedActionContract[];
};

export type MarketingUtilityContract = {
  utilityId: MarketingUtilityId;
  utilityName: string;
  expertRole: string;
  utilityJob: string;
  businessRoleRules: string[];
  answerStyle: string[];
  forbiddenGenericAnswers: string[];
  workBlocks: WorkBlockContract[];
};

const forbiddenGenericAnswers = [
  "Not enough leads",
  "Need more leads",
  "Need more traffic",
  "Improve marketing",
  "Create more content",
  "Run ads",
  "Build awareness",
  "Increase conversions",
  "Get more customers",
  "Better messaging",
  "Follow up more",
];

const roleRules = [
  "Keep the app user, selected business, selected business buyer/customer, and buyer's end customer/visitor separate.",
  "Buyer means the selected business's buyer/customer, not the Simple Marketing HQ account owner.",
  "For Talk to Fred: selected business = Talk to Fred; buyer = service businesses/agencies with lead-generating websites; end visitor = the buyer's website visitor; product = approved-content AI website agent.",
  "For Talk to Fred, never state the buyer problem as only 'not enough leads'. Use the sharper role-specific issue: website visitors ask buying questions but leave or go cold when the business cannot answer instantly, safely, and consistently.",
];

const answerStyle = [
  "Lead with the answer.",
  "Keep the visible answer short and labeled.",
  "Use selected business context in every guided answer.",
  "Do not bury the decision under education or frameworks.",
  "Use deeper reasoning only as secondary detail when useful.",
];

function action(actionId: string, buttonLabel: string, userFacingPrompt: string, mustAnswer: string, outputFormat: string, expertTask = mustAnswer): GuidedActionContract {
  return {
    actionId,
    buttonLabel,
    userFacingPrompt,
    expertTask,
    mustAnswer,
    outputFormat,
    forbiddenAnswerPatterns: forbiddenGenericAnswers,
    minimumSpecificityRules: [
      "Mention the selected business or its specific offer/buyer context.",
      "Do not use a forbidden generic answer as the full answer.",
      "Return a different decision than the other guided actions in the same work block.",
    ],
  };
}

const strategyBlocks: WorkBlockContract[] = [
  {
    workBlockId: "current-bottleneck",
    label: "Current Bottleneck",
    expertFrame: "World-class growth strategist diagnosing the single biggest constraint between current attention and revenue.",
    primaryDecision: "Find what is actually stuck right now underneath the symptom.",
    guidedActions: [
      action("find_bottleneck", "Find bottleneck", "What is the current bottleneck?", "the one current growth bottleneck", "One sentence, then 2 supporting bullets"),
      action("what_is_stuck", "What is stuck", "What is stuck?", "the stuck mechanism/process in plain language", "What is stuck: [answer] plus 2 bullets"),
      action("biggest_leak", "Biggest leak", "What is the biggest leak?", "where prospects, trust, attention, or revenue are leaking", "Biggest leak: [answer] plus 2 bullets"),
      action("fix_first", "Fix first", "What should we fix first?", "the first practical fix to remove the bottleneck", "Fix first: [answer] plus 3 action bullets"),
      action("what_to_ignore", "What to ignore", "What should we ignore for now?", "what the owner should not prioritize yet", "Ignore for now: [answer] plus 2 bullets explaining why"),
    ],
  },
  block("growth-focus", "Growth Focus", "Growth operator choosing the most important near-term growth objective.", "Choose the one growth focus that best matches foundation and current constraint.", [
    ["main_priority", "Main priority", "What should we focus on first?", "the main priority"],
    ["best_growth_move", "Best growth move", "What is the best growth move?", "the best growth move"],
    ["next_revenue_lever", "Revenue lever", "What is the next revenue lever?", "the next revenue lever"],
    ["move_fastest", "Fastest move", "What will move fastest?", "what will move fastest"],
    ["what_should_wait", "What should wait", "What should wait?", "what should wait"],
  ]),
  block("channel-priority", "Channel Priority", "Channel strategist deciding which marketing channel should come first.", "Choose the first channel based on readiness, buyer behavior, offer clarity, proof, and speed to revenue.", [
    ["first_channel", "First channel", "What channel should we prioritize?", "the first channel"],
    ["why_this_channel", "Why this channel", "Why this channel?", "why this channel fits"],
    ["channel_to_avoid", "Channel to avoid", "What channel should we avoid?", "the channel to avoid"],
    ["fastest_test", "Fastest test", "What is the fastest channel test?", "the fastest test"],
    ["next_channel", "Next channel", "What channel comes next?", "the next channel after foundation"],
  ]),
  block("funnel-map", "Funnel Map", "Conversion architect mapping the simple path from attention to lead/sale.", "Map the simplest funnel path and identify missing conversion steps.", [
    ["simple_funnel_path", "Simple path", "What is the simple funnel path?", "the simple funnel path"],
    ["entry_point", "Entry point", "What is the entry point?", "the entry point"],
    ["conversion_step", "Conversion step", "What is the conversion step?", "the conversion step"],
    ["follow_up_step", "Follow-up", "What is the follow-up step?", "the follow-up step"],
    ["weakest_point", "Weakest point", "What is the weakest funnel point?", "the weakest funnel point"],
  ]),
  block("90-day-plan", "90-Day Plan", "90-day marketing operator creating a realistic sequence of action.", "Create a simple prioritized 30/60/90-day plan.", [
    ["first_30_days", "First 30 days", "What should we do in the first 30 days?", "first 30 days"],
    ["next_60_days", "Next 60 days", "What should we do next?", "next 60 days"],
    ["final_90_days", "Final 90 days", "What should the final 90 days include?", "final 90 days"],
    ["this_week", "This week", "What should we do this week?", "what to do this week"],
    ["not_yet", "Not yet", "What should we not do yet?", "what not to do yet"],
  ]),
  block("positioning", "Positioning", "Positioning strategist clarifying how the business should be understood in the market.", "Define the market position, category, buyer, differentiation, and simple message.", [
    ["market_position", "Market position", "What is the market position?", "the market position"],
    ["category", "Category", "What category should this sit in?", "the category"],
    ["differentiation", "Differentiation", "What makes this different?", "the differentiation"],
    ["buyer_promise", "Buyer promise", "What is the buyer-facing promise?", "the buyer-facing promise"],
    ["positioning_risk", "Positioning risk", "What is the positioning risk?", "the positioning risk"],
  ]),
  block("use", "Use It Now", "Action coach turning strategy into owner-ready next actions.", "Give the owner the few actions to take now without creating a complex marketing plan.", [
    ["do_today", "Do today", "What should I do today?", "what to do today"],
    ["do_this_week", "Do this week", "What should I do this week?", "what to do this week"],
    ["easiest_win", "Easiest win", "What is the easiest win?", "the easiest win"],
    ["owner_action", "Owner action", "What should the owner do?", "the owner action"],
    ["delegate_or_automate", "Delegate/automate", "What should be delegated or automated?", "what to delegate or automate"],
  ]),
  block("feed", "New Info", "Marketing strategist incorporating new business updates into the current plan.", "Use new information to update strategy, not restart everything.", [
    ["what_changed", "What changed", "What changed?", "what changed"],
    ["strategy_impact", "Strategy impact", "What is the strategy impact?", "the strategy impact"],
    ["update_recommendation", "Update recommendation", "What should we update?", "the update recommendation"],
    ["risk_opportunity", "Risk/opportunity", "What is the risk or opportunity?", "the risk or opportunity"],
    ["save_to_training", "Save?", "Should this be saved to AI training?", "whether to save to AI training"],
  ]),
  block("history", "History", "Strategy historian reviewing saved versions and changes over time.", "Compare previous saved outputs and explain what changed, improved, and should remain consistent.", [
    ["previous_summary", "Previous summary", "Summarize the previous version.", "previous version summary"],
    ["what_changed", "What changed", "What changed?", "what changed"],
    ["what_to_keep", "What to keep", "What should we keep?", "what to keep"],
    ["what_to_replace", "What to replace", "What should we replace?", "what to replace"],
    ["best_current", "Best current", "What is the best current version?", "the best current version"],
  ]),
];

const utilityContracts: MarketingUtilityContract[] = [
  utility("icp", "Audience HQ", "Audience strategist", "Clarify who the business should focus on and why.", [
    simpleBlock("best-fit-customer", "Best-Fit Customer", ["define_best_fit_customer", "Define best-fit customer"], ["tighten_audience", "Tighten the audience"], ["who_not", "Who not to target"], ["best_signs", "Best customer signs"], ["priority_segment", "Priority segment"]),
    simpleBlock("buyer-problems", "Buyer Problems", ["top_pain", "Top pain points"], ["biggest_frustration", "Biggest frustration"], ["cost_not_fixing", "Cost of not fixing"], ["pain_words", "Pain in their words"], ["problem_solution", "One problem, one solution"], ["pain_to_copy", "Turn pain into copy"]),
    simpleBlock("buying-triggers", "Buying Triggers", ["why_now", "Why they buy now"], ["trigger_events", "Trigger events"], ["urgency_signs", "Urgency signs"], ["what_changed", "What changed"], ["start_looking", "When they start looking"]),
    simpleBlock("objections", "Objections", ["top_objections", "Top objections"], ["trust_blockers", "Trust blockers"], ["price_concerns", "Price concerns"], ["risk_concerns", "Risk concerns"], ["answer_objections", "Answer objections"]),
    simpleBlock("where-to-find-them", "Where To Find Them", ["best_channels", "Best channels"], ["online_communities", "Online communities"], ["partner_channels", "Partner channels"], ["search_topics", "Search topics"], ["local_channels", "Local channels"]),
    simpleBlock("feed", "New Info", ["add_note", "Add note"], ["extract_signal", "Extract signal"], ["update_audience", "Update audience"], ["new_pattern", "New pattern"], ["save_signal", "Save signal"]),
    simpleBlock("use", "Use It Now", ["homepage_section", "Homepage section"], ["sales_email", "Sales email"], ["ad_angle", "Ad angle"], ["offer_statement", "Offer statement"], ["content_ideas", "Content ideas"]),
    simpleBlock("history", "History", ["previous_summary", "Previous summary"], ["what_changed", "What changed"], ["what_to_keep", "What to keep"], ["what_to_replace", "What to replace"], ["best_current", "Best current"]),
  ]),
  utility("offer", "Offer HQ", "Offer strategist", "Build and refine the business's core offer.", [
    simpleBlock("core-offer", "Core Offer", ["define_offer", "Define the offer"], ["simplify_offer", "Simplify the offer"], ["what_they_get", "What they get"], ["who_for", "Who it is for"], ["make_clearer", "Make it clearer"], ["offer_options", "Offer options"]),
    simpleBlock("primary-promise", "Primary Promise", ["main_promise", "Main promise"], ["stronger_promise", "Stronger promise"], ["outcome", "Outcome they want"], ["before_after", "Before and after"], ["specific", "Make it specific"]),
    ...["offer-statement", "proof", "cta", "packages-pricing", "risk-reversal", "feed", "use", "history"].map((id) => simpleBlock(id, titleize(id), ...defaultActionsFor(id))),
  ]),
  utility("message", "Messaging HQ", "Messaging strategist", "Turn offer and audience into clear buyer-facing words.", ["one-liner", "homepage-headline", "differentiators", "proof-points", "cta-copy", "faq-objection-copy", "before-after", "use", "history"].map((id) => simpleBlock(id, titleize(id), ...defaultActionsFor(id)))),
  utility("content", "Content HQ", "Content strategist", "Turn strategy into practical publishable content.", ["content-pillars", "post-ideas", "weekly-plan", "email-ideas", "blog-seo-ideas", "repurpose", "use", "feed", "history"].map((id) => simpleBlock(id, titleize(id), ...defaultActionsFor(id)))),
  utility("strategy_map", "Strategy HQ", "Strategic growth team", "Choose what to fix first, what to ignore, and what sequence to follow.", strategyBlocks),
  utility("marketing_schedule", "Execution HQ", "Execution operator", "Turn strategy into concrete weekly actions.", ["weekly-actions", "task-checklist", "campaign-plan", "follow-up-process", "calendar", "progress-check-in", "use", "feed", "history"].map((id) => simpleBlock(id, titleize(id), ...defaultActionsFor(id)))),
  utility("research", "Research HQ", "Market researcher", "Convert website, customer, and market signals into usable insights.", ["website-findings", "competitor-notes", "market-patterns", "customer-language", "content-search-signals", "gaps", "use", "feed", "history"].map((id) => simpleBlock(id, titleize(id), ...defaultActionsFor(id)))),
  utility("recommendation", "Tool Stack HQ", "Tool stack strategist", "Recommend only the tools that fit the next practical action.", ["current-tools", "recommended-tools", "setup-steps", "cost-fit", "integrations", "avoid-for-now", "use", "feed", "history"].map((id) => simpleBlock(id, titleize(id), ...defaultActionsFor(id)))),
];

function utility(utilityId: MarketingUtilityId, utilityName: string, expertRole: string, utilityJob: string, workBlocks: WorkBlockContract[]): MarketingUtilityContract {
  return { utilityId, utilityName, expertRole, utilityJob, businessRoleRules: roleRules, answerStyle, forbiddenGenericAnswers, workBlocks };
}

function block(workBlockId: string, label: string, expertFrame: string, primaryDecision: string, actionDefs: Array<[string, string, string, string]>): WorkBlockContract {
  return {
    workBlockId,
    label,
    expertFrame,
    primaryDecision,
    guidedActions: actionDefs.map(([actionId, buttonLabel, prompt, mustAnswer]) => action(actionId, buttonLabel, prompt, mustAnswer, `${buttonLabel}: [answer] plus 2-3 specific bullets`, mustAnswer)),
  };
}

function simpleBlock(workBlockId: string, label: string, ...actionDefs: Array<[string, string]>): WorkBlockContract {
  return block(workBlockId, label, `${label} expert`, `Produce the ${label.toLowerCase()} decision for this business.`, actionDefs.map(([actionId, buttonLabel]) => [actionId, buttonLabel, `${buttonLabel}.`, `${buttonLabel.toLowerCase()} decision`]));
}

function defaultActionsFor(workBlockId: string): Array<[string, string]> {
  if (workBlockId === "history") return [["previous_summary", "Previous summary"], ["what_changed", "What changed"], ["what_to_keep", "What to keep"], ["what_to_replace", "What to replace"], ["best_current", "Best current"]];
  if (workBlockId === "feed") return [["what_changed", "What changed"], ["impact", "Impact"], ["update", "Update"], ["risk_opportunity", "Risk/opportunity"], ["save", "Save?"]];
  if (workBlockId === "use") return [["do_today", "Do today"], ["do_this_week", "Do this week"], ["easiest_win", "Easiest win"], ["owner_action", "Owner action"], ["delegate", "Delegate/automate"]];
  return [["primary", "Primary answer"], ["make_clearer", "Make it clearer"], ["use_now", "Use it now"], ["examples", "Examples"], ["what_to_avoid", "What to avoid"]];
}

function titleize(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export const marketingUtilityContracts = Object.fromEntries(utilityContracts.map((contract) => [contract.utilityId, contract])) as Record<MarketingUtilityId, MarketingUtilityContract>;

export function getMarketingUtilityContract(utilityId: MarketingUtilityId) {
  return marketingUtilityContracts[utilityId];
}

export function getWorkBlockContract(utilityId: MarketingUtilityId, workBlockId: string) {
  return getMarketingUtilityContract(utilityId)?.workBlocks.find((blockContract) => blockContract.workBlockId === workBlockId);
}

export function getGuidedActionContract(utilityId: MarketingUtilityId, workBlockId: string, actionId: string) {
  return getWorkBlockContract(utilityId, workBlockId)?.guidedActions.find((guidedAction) => guidedAction.actionId === actionId);
}

export function getGuidedActions(utilityId: MarketingUtilityId, workBlockId: string) {
  return getWorkBlockContract(utilityId, workBlockId)?.guidedActions ?? [];
}

export function assertGuidedActionContract(utilityId: MarketingUtilityId, workBlockId: string, actionId: string) {
  const contract = getGuidedActionContract(utilityId, workBlockId, actionId);
  if (!contract) throw new Error(`Missing AI contract for ${utilityId}/${workBlockId}/${actionId}`);
  return contract;
}

export function buildMarketingUtilityAnswer(input: { utilityId: MarketingUtilityId; workBlockId: string; actionId?: string; prompt: string; context: MarketingUtilityContext; previousAssistant?: string }) {
  const utilityContract = getMarketingUtilityContract(input.utilityId);
  const workBlockContract = getWorkBlockContract(input.utilityId, input.workBlockId);
  const guidedAction = input.actionId ? assertGuidedActionContract(input.utilityId, input.workBlockId, input.actionId) : inferManualAction(input.prompt, workBlockContract);
  if (!utilityContract || !workBlockContract) throw new Error(`Missing AI contract for ${input.utilityId}/${input.workBlockId}/${input.actionId ?? "manual"}`);

  const context = normalizeUtilityContext(input.context);
  const response = input.utilityId === "strategy_map" ? buildStrategyAnswer(workBlockContract, guidedAction, context) : buildGeneralAnswer(utilityContract, workBlockContract, guidedAction, context);
  const flags = validateMarketingUtilityAnswer({ response, utilityId: input.utilityId, workBlockId: input.workBlockId, actionId: guidedAction.actionId, context, previousAssistant: input.previousAssistant });
  if (!flags.length) return { content: response, qualityFlags: [] };
  const repaired = repairUtilityAnswer(workBlockContract, guidedAction, context, flags);
  return { content: repaired, qualityFlags: validateMarketingUtilityAnswer({ response: repaired, utilityId: input.utilityId, workBlockId: input.workBlockId, actionId: guidedAction.actionId, context, previousAssistant: input.previousAssistant }) };
}

function inferManualAction(prompt: string, workBlockContract?: WorkBlockContract): GuidedActionContract {
  const normalizedPrompt = normalize(prompt);
  const matched = workBlockContract?.guidedActions.find((guidedAction) => normalizedPrompt.includes(normalize(guidedAction.buttonLabel)) || normalize(guidedAction.userFacingPrompt).includes(normalizedPrompt));
  return matched ?? action("manual_question", "Answer", prompt, "answer the user's question inside the selected work block", "Answer: [direct answer] plus 2-3 specific bullets");
}

function buildStrategyAnswer(blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>) {
  if (blockContract.workBlockId === "current-bottleneck") return buildCurrentBottleneckAnswer(actionContract.actionId, context);
  const lead = leadForAction(actionContract.buttonLabel, context);
  return `${actionContract.buttonLabel}: ${lead}\n\n* Selected business: ${context.businessName}.\n* Buyer context: ${context.audience}.\n* Decision: ${actionContract.mustAnswer} for ${blockContract.label}, not a generic channel or lead-volume suggestion.`;
}

function buildCurrentBottleneckAnswer(actionId: string, c: Required<MarketingUtilityContext>) {
  const bottleneck = `${c.businessName} is not yet proving the safe conversion path clearly enough: how ${c.offer} turns visitor questions into qualified leads without risky or off-brand AI answers.`;
  if (actionId === "find_bottleneck") return `Current bottleneck: ${bottleneck}\n\n* This is not just raw lead volume; it is proof, trust, and conversion clarity between website interest and a qualified handoff.\n* The buyer needs to believe approved-content AI can answer safely before they trust it with live visitor questions.`;
  if (actionId === "what_is_stuck") return `What is stuck: prospects can understand the AI idea, but the safe handoff from website question to qualified lead is not concrete enough yet.\n\n* The stuck mechanism is the proof path: approved content → safe answer → captured lead → clean next step.\n* Until that path is visible, buyers may treat ${c.businessName} like a generic chatbot instead of a controlled lead-conversion system.`;
  if (actionId === "biggest_leak") return `Biggest leak: ${c.businessName || "the selected business"}'s buyer is losing trust before conversion because they cannot quickly see enough proof that ${c.offer || "the offer"} can safely turn website visitor questions into qualified opportunities.\n\n* Trust leaks if the approved-content mechanism is not visible before the CTA.\n* Revenue leaks if the visitor path does not connect questions to a clear next step.`;
  if (actionId === "fix_first") return `Fix first: build a visible Talk to Fred proof/demo path that shows Fred answering from approved content and handing off a qualified lead.\n\n* Add a “try to push Fred out of bounds” demo or example.\n* Put approved-content guardrail proof beside the primary CTA.\n* Show the exact handoff the team receives after a visitor asks a buying question.`;
  if (actionId === "what_to_ignore") return `Ignore for now: chasing more channels before Talk to Fred’s core proof/demo/conversion path is clear.\n\n* More traffic will amplify confusion if buyers still cannot see how approved-content AI stays safe.\n* Wait on broad content, ads, or partner pushes until the offer, proof block, and first CTA are strong enough to convert existing attention.`;
  return `Current bottleneck: ${bottleneck}`;
}

function buildGeneralAnswer(utilityContract: MarketingUtilityContract, blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>) {
  const answer = leadForAction(actionContract.buttonLabel, context);
  return `${actionContract.buttonLabel}: ${answer}\n\n* ${utilityContract.utilityName} decision: ${actionContract.mustAnswer}.\n* Business context: ${context.businessName} sells ${context.offer} to ${context.audience}.\n* Use this now: turn this into the next ${blockContract.label.toLowerCase()} asset, then save it if it matches the current business reality.`;
}

function leadForAction(label: string, c: Required<MarketingUtilityContext>) {
  const lower = label.toLowerCase();
  if (lower.includes("ignore") || lower.includes("avoid") || lower.includes("wait")) return `do not prioritize more channels or generic activity until ${c.businessName}'s core proof, offer, and conversion path are clearer.`;
  if (lower.includes("fix") || lower.includes("first")) return `fix the highest-friction buyer moment first: prove how ${c.offer} solves ${c.buyerPain}.`;
  if (lower.includes("leak") || lower.includes("gap")) return `the leak is where buyer trust drops before they see a safe, specific path to ${c.outcome}.`;
  if (lower.includes("channel")) return `${c.channel} should come first only after the offer proof and CTA make the next step obvious.`;
  if (lower.includes("proof") || lower.includes("trust")) return `show proof that ${c.businessName} can deliver ${c.outcome} without creating new risk for ${c.audience}.`;
  if (lower.includes("cta") || lower.includes("button")) return `use a CTA that invites a low-risk proof moment tied to ${c.outcome}.`;
  if (lower.includes("who") || lower.includes("customer") || lower.includes("audience") || lower.includes("buyer")) return `${c.audience} with urgent pain around ${c.buyerPain}.`;
  if (lower.includes("post") || lower.includes("content") || lower.includes("email")) return `create content from the buyer's real question: how to get ${c.outcome} without adding risk or complexity.`;
  if (lower.includes("today")) return `today, write one clear proof-backed answer to the buyer's most important question about ${c.offer}.`;
  if (lower.includes("week")) return `this week, tighten the offer proof, CTA, and follow-up path around ${c.buyerPain}.`;
  return `${c.businessName} should make ${c.offer} easier for ${c.audience} to trust, understand, and act on.`;
}

function repairUtilityAnswer(blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>, flags: string[]) {
  return `${actionContract.buttonLabel}: ${leadForAction(actionContract.buttonLabel, context)}\n\n* Repair note: the first answer failed quality checks (${flags.join("; ")}).\n* Specific decision: ${actionContract.mustAnswer}.\n* Next useful move: make this ${blockContract.label.toLowerCase()} asset concrete enough to save to AI training.`;
}

export function validateMarketingUtilityAnswer(input: { response: string; utilityId: MarketingUtilityId; workBlockId: string; actionId?: string; context: MarketingUtilityContext; previousAssistant?: string }) {
  const flags: string[] = [];
  const response = input.response.trim();
  const firstLine = response.split("\n").find(Boolean) ?? "";
  if (!response || response.length < 120) flags.push("Output is too short for guided utility AI.");
  if (response.length > 1400) flags.push("Output is too long for answer-first utility UX.");
  forbiddenGenericAnswers.forEach((phrase) => {
    if (normalize(firstLine) === normalize(phrase)) flags.push(`Output starts with forbidden generic answer: ${phrase}`);
  });
  if (/^\s*(not enough leads|need more leads|need more traffic|get more customers)\.?\s*$/i.test(firstLine)) flags.push("Output is only a generic phrase.");
  if (/\. to\b|from your business needs|\[.+?\]|placeholder|tbd/i.test(response)) flags.push("Output contains broken or placeholder language.");
  if (input.previousAssistant && normalize(input.previousAssistant) === normalize(response)) flags.push("Output duplicates the previous assistant response.");
  if (input.context.businessName && !normalize(response).includes(normalize(input.context.businessName))) flags.push("Output does not mention selected business context.");
  if (/Talk to Fred/i.test(input.context.businessName || "") && /^.*not enough leads.*$/im.test(response) && !/visitor questions|approved content|qualified leads|booked calls/i.test(response)) flags.push("Talk to Fred role separation failed.");
  return flags;
}

function normalizeUtilityContext(context: MarketingUtilityContext): Required<MarketingUtilityContext> {
  const businessName = context.businessName || "Talk to Fred";
  return {
    businessName,
    website: context.website || "Website not confirmed",
    industry: context.industry || "Service business marketing",
    offer: context.offer || "approved-content AI website agent",
    audience: roleSafeAudience(context.audience),
    buyerPain: roleSafeBuyerPain(context.buyerPain),
    outcome: context.outcome || "turn website questions into qualified leads with AI that only answers from approved content",
    proof: context.proof || "approved content, safe answer guardrails, and clean lead handoff",
    channel: context.channel || "website conversion",
    currentAsset: context.currentAsset || "current working asset not saved yet",
    savedAssets: context.savedAssets || [],
  };
}

function roleSafeAudience(value?: string) {
  if (!value || /best-fit customers|the business|problem creating hesitation/i.test(value)) return "service businesses and agencies with lead-generating websites";
  return value;
}

function roleSafeBuyerPain(value?: string) {
  if (!value || /^\s*(not enough leads|more leads)\s*\.?\s*$/i.test(value)) return "website visitors ask buying questions but leave or go cold when the business cannot answer instantly, safely, and consistently";
  return value;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
