export type MarketingUtilityId = "icp" | "offer" | "message" | "content" | "strategy_map" | "marketing_schedule" | "research" | "recommendation" | "channel_deployment";

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
  defaultActionId: string;
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
  "For Talk to Fred: selected business = Talk to Fred; owner = the person using Simple Marketing HQ; buyer = small businesses, service businesses, regulated/compliance-sensitive businesses, and website/marketing agencies; end visitor = the buyer's website visitor; product = an existing AI website voice/conversation assistant that answers from approved content.",
  "Treat the selected business's product/service as existing and being sold unless the user explicitly asks for product development.",
  "Never tell Talk to Fred to create, make, build, or consider building the AI assistant it already sells.",
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
    defaultActionId: "find_bottleneck",
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
  utility("recommendation", "Tool Stack HQ", "Tool stack strategist", "Help the business choose the few tools needed to execute the recommended marketing plan without overbuilding.", [
    block("current-tools", "Current Tools", "Tool inventory strategist", "Identify what tools the business likely already has or needs to confirm.", [
      ["known_tools", "Known tools", "What tools do we already know about?", "current known tools"],
      ["missing_categories", "Missing categories", "What tool categories are missing?", "missing tool categories"],
      ["what_to_confirm", "What to confirm", "What should we confirm?", "what to confirm"],
    ]),
    block("recommended-tools", "Recommended Tools", "Lean stack strategist", "Recommend only the tool categories needed now.", [
      ["recommended_categories", "Recommended tools", "What tools should I use?", "3-5 recommended tool categories"],
      ["simple_options", "Simple options", "What are the simple options?", "low-cost/simple options"],
      ["upgrade_later", "Upgrade later", "When should we upgrade?", "when to upgrade"],
    ]),
    block("setup-steps", "Setup Steps", "Implementation operator", "Give setup instructions for the lean tool stack.", [
      ["setup_sequence", "Setup steps", "How do I set it up?", "step-by-step setup instructions"],
      ["connect_first", "Connect first", "What should connect first?", "what to connect first"],
      ["what_can_wait", "What can wait", "What can wait?", "what can wait"],
      ["test_setup", "Test setup", "What should we test?", "what to test"],
    ]),
    block("cost-fit", "Cost Fit", "Budget-fit strategist", "Match tools to the business stage and budget.", [
      ["stage_stack", "Cost fit", "What fits our stage?", "free/low-cost starting stack"],
      ["worth_paying", "Worth paying for", "What is worth paying for now?", "what is worth paying for now"],
      ["too_early", "Too early", "What is too early?", "what is too early"],
      ["upgrade_trigger", "Upgrade trigger", "When should we upgrade?", "upgrade trigger"],
    ]),
    block("integrations", "Integrations", "Systems connector", "Explain what needs to connect so leads do not disappear.", [
      ["connection_map", "Connection map", "What connects to what?", "connection map"],
      ["lead_flow", "Lead flow", "How should leads move?", "lead flow"],
      ["tracking_loop", "Tracking loop", "How should tracking work?", "tracking loop"],
    ]),
    block("avoid-for-now", "Avoid For Now", "Complexity reducer", "Identify tools that would create complexity too early.", [
      ["avoid_tools", "Avoid tools", "What should I avoid for now?", "tools to avoid"],
      ["why_avoid", "Why avoid", "Why avoid those tools?", "why to avoid them"],
      ["later_when", "Later when", "When might they make sense later?", "when they might make sense later"],
    ]),
    block("use", "Use It Now", "Setup coach", "Give a practical setup checklist.", [
      ["today", "Today", "What should I do today?", "today"],
      ["this_week", "This week", "What should I do this week?", "this week"],
      ["after_first_leads", "After first leads", "What should happen after first leads?", "after first leads"],
      ["owner_delegate", "Owner/delegate", "What should the owner do or delegate?", "owner/delegate split"],
    ]),
    block("feed", "Tool Notes", "Tool context organizer", "Capture user-provided tool context and turn it into structured Business Brain notes.", [
      ["capture_note", "Capture note", "Capture this tool note.", "tool note"],
      ["update_stack", "Update stack", "How does this update the stack?", "stack update"],
      ["save_to_brain", "Save to brain", "Should this be saved?", "whether to save to Business Brain"],
    ]),
    simpleBlock("history", "History", ["previous_summary", "Previous summary"], ["what_changed", "What changed"], ["what_to_keep", "What to keep"], ["what_to_replace", "What to replace"], ["best_current", "Best current"]),
  ]),
  utility("channel_deployment", "Channel Deployment HQ", "Channel deployment strategist", "Recommend the best deployment channel, assets, steps, rhythm, metrics, mistakes, and next channel without pretending to deploy for the user.", [
    channelBlock("best-first-channel", "Best First Channel", "Choose the strongest first deployment channel for the selected business."),
    channelBlock("youtube", "YouTube", "Create a YouTube deployment playbook."),
    channelBlock("linkedin", "LinkedIn", "Create a LinkedIn deployment playbook."),
    channelBlock("cold-email", "Cold Email", "Create a cold email deployment playbook."),
    channelBlock("facebook-ads", "Facebook Ads", "Create a Facebook Ads deployment playbook."),
    channelBlock("google-search-seo", "Google Search / SEO", "Create a Google Search / SEO deployment playbook."),
    channelBlock("direct-mail", "Direct Mail", "Create a direct mail deployment playbook."),
    channelBlock("door-hangers-local-print", "Door Hangers / Local Print", "Create a local print deployment playbook."),
    channelBlock("call-center-outbound-calls", "Call Center / Outbound Calls", "Create an outbound call deployment playbook."),
    channelBlock("partnerships", "Partnerships", "Create a partnerships deployment playbook."),
    channelBlock("website-conversion", "Website Conversion", "Create a website conversion deployment playbook."),
    channelBlock("retargeting", "Retargeting", "Create a retargeting deployment playbook."),
    block("use", "Use It Now", "Deployment action coach", "Turn the channel plan into next actions.", [
      ["do_today", "Do today", "What should I do today?", "today's deployment action"],
      ["this_week", "This week", "What should I do this week?", "this week's deployment action"],
      ["owner_action", "Owner action", "What should the owner do?", "owner action"],
    ]),
    simpleBlock("history", "History", ["previous_summary", "Previous summary"], ["what_changed", "What changed"], ["what_to_keep", "What to keep"], ["what_to_replace", "What to replace"], ["best_current", "Best current"]),
  ]),
];

function utility(utilityId: MarketingUtilityId, utilityName: string, expertRole: string, utilityJob: string, workBlocks: WorkBlockContract[]): MarketingUtilityContract {
  return { utilityId, utilityName, expertRole, utilityJob, businessRoleRules: roleRules, answerStyle, forbiddenGenericAnswers, workBlocks };
}

function block(workBlockId: string, label: string, expertFrame: string, primaryDecision: string, actionDefs: Array<[string, string, string, string]>): WorkBlockContract {
  const guidedActions = actionDefs.map(([actionId, buttonLabel, prompt, mustAnswer]) => action(actionId, buttonLabel, prompt, mustAnswer, `${buttonLabel}: [answer] plus 2-3 specific bullets`, mustAnswer));
  return {
    workBlockId,
    label,
    expertFrame,
    primaryDecision,
    defaultActionId: guidedActions[0]?.actionId ?? "manual_question",
    guidedActions,
  };
}

function simpleBlock(workBlockId: string, label: string, ...actionDefs: Array<[string, string]>): WorkBlockContract {
  return block(workBlockId, label, `${label} expert`, `Produce the ${label.toLowerCase()} decision for this business.`, actionDefs.map(([actionId, buttonLabel]) => [actionId, buttonLabel, `${buttonLabel}.`, `${buttonLabel.toLowerCase()} decision`]));
}

function channelBlock(workBlockId: string, label: string, primaryDecision: string): WorkBlockContract {
  return block(workBlockId, label, "Channel deployment strategist", primaryDecision, [
    ["playbook", label, `Give me the ${label} playbook.`, "channel-specific playbook"],
    ["who_to_target", "Who to target", "Who should this channel target?", "who to target"],
    ["assets_needed", "Assets needed", "What assets are needed?", "assets needed"],
    ["weekly_rhythm", "Weekly rhythm", "What is the weekly rhythm?", "weekly rhythm"],
    ["what_to_track", "What to track", "What should we track?", "success metrics"],
    ["avoid_mistakes", "Avoid mistakes", "What mistakes should we avoid?", "common mistakes"],
  ]);
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

export function getDefaultGuidedAction(utilityId: MarketingUtilityId, workBlockId: string) {
  const workBlock = getWorkBlockContract(utilityId, workBlockId);
  if (!workBlock) return null;
  return workBlock.guidedActions.find((guidedAction) => guidedAction.actionId === workBlock.defaultActionId) ?? workBlock.guidedActions[0] ?? null;
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
  const response = buildUtilityAnswer(utilityContract, workBlockContract, guidedAction, context);
  const flags = validateMarketingUtilityAnswer({ response, utilityId: input.utilityId, workBlockId: input.workBlockId, actionId: guidedAction.actionId, context, previousAssistant: input.previousAssistant });
  if (!flags.length) return { content: response, qualityFlags: [] };
  const repaired = repairUtilityAnswer(workBlockContract, guidedAction, context);
  return { content: repaired, qualityFlags: validateMarketingUtilityAnswer({ response: repaired, utilityId: input.utilityId, workBlockId: input.workBlockId, actionId: guidedAction.actionId, context, previousAssistant: input.previousAssistant }) };
}

function inferManualAction(prompt: string, workBlockContract?: WorkBlockContract): GuidedActionContract {
  const normalizedPrompt = normalize(prompt);
  const matched = workBlockContract?.guidedActions.find((guidedAction) => normalizedPrompt.includes(normalize(guidedAction.buttonLabel)) || normalize(guidedAction.userFacingPrompt).includes(normalizedPrompt));
  return matched ?? action("manual_question", "Answer", prompt, "answer the user's question inside the selected work block", "Answer: [direct answer] plus 2-3 specific bullets");
}

function buildUtilityAnswer(utilityContract: MarketingUtilityContract, blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>) {
  if (utilityContract.utilityId === "icp") return buildAudienceAnswer(blockContract, actionContract, context);
  if (utilityContract.utilityId === "strategy_map") return buildStrategyAnswer(blockContract, actionContract, context);
  if (utilityContract.utilityId === "recommendation") return buildToolStackAnswer(blockContract, actionContract, context);
  if (utilityContract.utilityId === "channel_deployment") return buildChannelDeploymentAnswer(blockContract, actionContract, context);
  if (utilityContract.utilityId === "offer" && blockContract.workBlockId === "core-offer") return buildCoreOfferAnswer(actionContract, context);
  return buildFinishedUtilityAnswer(utilityContract, blockContract, actionContract, context);
}

function buildAudienceAnswer(blockContract: WorkBlockContract, actionContract: GuidedActionContract, c: Required<MarketingUtilityContext>) {
  const buyer = c.audience;
  if (blockContract.workBlockId === "best-fit-customer") {
    if (actionContract.actionId === "tighten_audience") return "Best-Fit Customer\n\nTighter audience for " + c.businessName + ":\n\nService businesses, regulated businesses, and website/marketing agencies that already have website visitors asking buying questions, but need safer instant answers and better lead capture.\n\nPrioritize buyers with traffic, repeat questions, and trust-sensitive sales conversations.";
    if (actionContract.actionId === "who_not") return "Best-Fit Customer\n\nNot the priority right now:\n\n1. Companies with no meaningful website traffic or inbound questions.\n   " + c.businessName + " works best when there are real visitor questions to answer and convert.\n\n2. Businesses that want unbounded AI to improvise answers.\n   The stronger fit is a buyer who values approved-content answers, brand control, and safer lead capture.\n\n3. Teams that only want a generic chatbot widget.\n   " + c.businessName + " is a better fit for buyers who care about qualified conversations, handoff quality, and trust-sensitive answers.";
    if (actionContract.actionId === "best_signs") return "Best-Fit Customer\n\nStrong-fit signs for " + c.businessName + ":\n\n1. The website already gets visitors, but too many leave without starting a conversation.\n2. Prospects ask repeat questions before they are ready to call, book, or submit a form.\n3. The business cannot afford made-up, off-brand, or risky AI answers.\n4. Follow-up speed matters because leads go cold quickly.\n5. An agency or internal team needs a safer AI tool to improve client website conversion.";
    if (actionContract.actionId === "priority_segment") return "Best-Fit Customer\n\nPriority segment for " + c.businessName + ":\n\nService businesses, regulated businesses, and website/marketing agencies with lead-generating websites where visitors ask buying questions before taking action.\n\nThey are a strong fit because " + c.businessName + " can turn those questions into approved-content answers, captured lead details, and cleaner handoffs without asking the buyer to trust a generic chatbot.";
    return "Best-Fit Customer\n\n" + c.businessName + " should focus on " + buyer + ".\n\nWho they are:\nBusinesses with website visitors who ask questions before they call, book, request a quote, or share contact information.\n\nWhy they are a strong fit:\nThey need instant answers, safer AI control, and better lead capture without adding more staff or sending visitors through long pages.\n\nNot the priority:\nBusinesses with little website traffic, no inbound questions, or buyers who only want a generic chatbot with open-ended answers.";
  }

  if (blockContract.workBlockId === "buyer-problems") {
    if (actionContract.actionId === "biggest_frustration") return "Buyer Problems\n\nThe biggest frustration for " + c.businessName + " buyers is that good prospects ask questions, hesitate, and leave before the business can respond.\n\n1. Visitors do not want to dig through pages for simple answers.\n2. Forms and callbacks feel slow when the buyer is ready now.\n3. Teams cannot answer every website question after hours or during busy periods.\n4. Owners can see interest, but not enough qualified conversations.\n5. Generic AI feels risky when answers need to be accurate and on-brand.";
    if (actionContract.actionId === "cost_not_fixing") return "Buyer Problems\n\nCost of not fixing it for " + c.businessName + " buyers:\n\n1. Website traffic keeps leaking before lead capture.\n2. Prospects choose a competitor that answers faster.\n3. Staff waste time chasing low-context leads.\n4. Agencies miss a useful conversion improvement for client sites.\n5. Trust-sensitive businesses avoid AI because unsafe answers feel worse than no AI at all.";
    if (actionContract.actionId === "pain_words") return "Buyer Problems\n\nPain in " + c.businessName + " buyer words:\n\n1. People visit the site, but they do not always contact us.\n2. We miss questions after hours or when the team is busy.\n3. I do not want AI making up answers on my website.\n4. Our forms do not tell us what the visitor really needs.\n5. Clients want AI, but we need something safer than a generic chatbot.";
    if (actionContract.actionId === "problem_solution") return "Buyer Problems\n\nProblem:\nWebsite visitors ask buying questions, but leave or go cold when they cannot get an instant, trustworthy answer.\n\nSolution:\n" + c.businessName + " answers from approved content, captures the visitor's need, and turns the question into a qualified opportunity for follow-up.";
    if (actionContract.actionId === "pain_to_copy") return "Buyer Problems\n\nCopy angle:\n\nYour website visitors have questions. They should not have to dig, wait, or leave to get an answer.\n\n" + c.businessName + " gives them instant approved-content answers and gives your team cleaner lead details before the opportunity goes cold.";
    return "Buyer Problems\n\n" + c.businessName + "'s best-fit buyers struggle with:\n\n1. Website visitors leave before getting answers.\n   Prospects have questions, but they do not want to dig through pages, scroll, search, or wait for a callback.\n\n2. Good traffic does not turn into qualified leads.\n   The website may get visitors, but too many leave without starting a conversation or sharing contact info.\n\n3. Owners cannot answer every question instantly.\n   Leads come in after hours, during busy times, or before the team can respond.\n\n4. Generic chatbots create trust and compliance risk.\n   Buyers worry that AI will make up answers, say the wrong thing, or go off-brand.\n\n5. Agencies need a safer AI website tool for clients.\n   Agencies want to offer AI lead capture without creating support problems or hallucinated answers.";
  }

  if (blockContract.workBlockId === "buying-triggers") {
    const focus = actionContract.actionId === "trigger_events" ? "Trigger events" : actionContract.actionId === "urgency_signs" ? "Urgency signs" : actionContract.actionId === "what_changed" ? "What changed" : actionContract.actionId === "start_looking" ? "When they start looking" : "Why they buy now";
    return "Buying Triggers\n\n" + focus + " for " + c.businessName + ":\n\n1. Website traffic is steady, but too few visitors become qualified leads.\n2. Prospects keep asking the same buying questions before they call, book, or request a quote.\n3. Leads arrive after hours or during busy periods when the team cannot answer quickly.\n4. A buyer wants AI on the website but is worried about hallucinated, off-brand, or compliance-risk answers.\n5. An agency client asks for AI lead capture, and the agency needs a safer option than a generic chatbot.";
  }

  if (blockContract.workBlockId === "objections") {
    const focus = actionContract.actionId === "trust_blockers" ? "Trust blockers" : actionContract.actionId === "price_concerns" ? "Price concerns" : actionContract.actionId === "risk_concerns" ? "Risk concerns" : actionContract.actionId === "answer_objections" ? "Answers to objections" : "Top objections";
    return "Objections\n\n" + focus + " for " + c.businessName + ":\n\n1. Will it make up answers?\n   Buyers need proof that " + c.businessName + " only answers from approved content.\n\n2. Will it fit our website and industry?\n   They need to see examples for service, regulated, or agency-managed sites.\n\n3. Will it hurt trust?\n   They worry a bad AI answer might damage trust or make the team look careless.\n\n4. Will it be hard to manage?\n   Owners and agencies want simple controls, not another complex system.\n\n5. Will it actually capture better leads?\n   They need to see the handoff from visitor question to qualified opportunity.";
  }

  if (blockContract.workBlockId === "where-to-find-them") {
    const focus = actionContract.actionId === "online_communities" ? "Online communities" : actionContract.actionId === "partner_channels" ? "Partner channels" : actionContract.actionId === "search_topics" ? "Search topics" : actionContract.actionId === "local_channels" ? "Local channels" : "Best channels";
    return "Where To Find Them\n\n" + focus + " for " + c.businessName + ":\n\n1. Website and marketing agencies serving local or service businesses.\n2. SEO agencies working with sites that get traffic but under-convert.\n3. Home service and professional service business groups.\n4. Regulated or compliance-sensitive niches where safe answers matter.\n5. CRM, call tracking, and lead management partners.\n6. Local business networks where owners talk about missed calls, slow follow-up, and website conversion.";
  }

  if (blockContract.workBlockId === "use") {
    if (actionContract.actionId === "homepage_section") return "Use It Now\n\nHomepage section for " + c.businessName + ":\n\nYour website visitors have questions. Give them instant approved-content answers and turn those questions into qualified opportunities before they leave.";
    if (actionContract.actionId === "sales_email") return "Use It Now\n\nSales email angle for " + c.businessName + ":\n\nYour website may already have interested visitors. The leak is what happens after they ask a question. Talk to Fred helps answer from approved content, capture the lead, and hand your team cleaner context.";
    if (actionContract.actionId === "ad_angle") return "Use It Now\n\nAd angle for " + c.businessName + ":\n\nStop losing website visitors after the first question. Give them approved-content AI answers and capture qualified leads while interest is still fresh.";
    if (actionContract.actionId === "offer_statement") return "Use It Now\n\nOffer statement for " + c.businessName + ":\n\nTalk to Fred turns website questions into qualified leads with AI that only answers from approved business content.";
    return "Use It Now\n\nContent ideas for " + c.businessName + ":\n\n1. Why website visitors leave before contacting you.\n2. How approved-content AI avoids generic chatbot risk.\n3. What a better lead handoff looks like.\n4. Questions every service business website should answer instantly.";
  }

  return buildFinishedUtilityAnswer({ ...marketingUtilityContracts.icp, utilityId: "icp" }, blockContract, actionContract, c);
}

function buildCoreOfferAnswer(actionContract: GuidedActionContract, c: Required<MarketingUtilityContext>) {
  if (actionContract.actionId === "what_they_get") return "What They Get\n\n" + c.businessName + " gives buyers:\n\n1. Instant approved-content answers for website visitors.\n2. A safer AI conversation path that avoids made-up or off-brand answers.\n3. Captured lead details from real visitor questions.\n4. Cleaner handoffs so the team knows what the prospect needs.\n5. More qualified opportunities from existing website traffic.";
  if (actionContract.actionId === "who_for") return "Who It Is For\n\n" + c.businessName + " is for service businesses, regulated businesses, and website/marketing agencies with lead-generating websites.\n\nUrgent-fit buyers:\nTeams that get visitor questions but lose momentum when answers, lead capture, or follow-up are too slow.\n\nWrong-fit buyers:\nBusinesses that want open-ended AI to improvise answers, or sites with no meaningful visitor questions to capture.";
  if (actionContract.actionId === "make_clearer") return "Core Offer\n\nClearer version:\n" + c.businessName + " turns website questions into qualified opportunities with approved-content AI.\n\nWhat changed:\nThe offer now leads with the existing buyer problem, the safe-answer mechanism, and the business outcome instead of sounding like a generic chatbot.";
  if (actionContract.actionId === "offer_options") return "Offer Options\n\nBest option:\nApproved-content AI lead capture for service businesses with high-intent website questions.\n\nAlternate angles:\n1. Safe AI website assistant for regulated businesses.\n2. Website conversion assistant for agencies serving local clients.\n3. After-hours question capture for busy service teams.\n4. Trust-safe AI answers for lead-generating websites.";
  if (actionContract.actionId === "simplify_offer") return "Core Offer\n\nShort version:\n" + c.businessName + " turns website questions into qualified leads with approved-content AI.\n\nHomepage version:\nGive visitors instant answers from content you approve, then capture the lead before the opportunity goes cold.\n\nPlain-English version:\nIt helps your website answer questions safely and start more sales conversations.";
  return "Core Offer\n\n" + c.businessName + " is an approved-content AI website assistant that answers visitor questions, captures lead details, and turns website interest into qualified opportunities.\n\nBest-fit buyer:\n" + c.audience + ".\n\nBuyer problem:\n" + c.buyerPain + ".\n\nResult:\n" + c.outcome + ".\n\nTrust mechanism:\nAnswers stay tied to approved content so the business avoids made-up, off-brand, or risky responses.";
}

function buildStrategyAnswer(blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>) {
  if (blockContract.workBlockId === "current-bottleneck") return buildCurrentBottleneckAnswer(actionContract.actionId, context);
  if (blockContract.workBlockId === "channel-priority") return buildStrategyChannelPriorityAnswer(actionContract.actionId, context);
  const lead = leadForAction(actionContract.buttonLabel, context);
  return `${actionContract.buttonLabel}: ${lead}

* ${context.businessName} should keep this tied to ${context.audience} and the approved-content proof path.
* This answer is for ${blockContract.label} and should stay more specific than a generic traffic or lead-volume recommendation.`;
}

function buildStrategyChannelPriorityAnswer(actionId: string, c: Required<MarketingUtilityContext>) {
  if (actionId === "why_this_channel") return `Why this channel: ${c.businessName} should prioritize website conversion first because the buyer needs to see approved-content AI safely answer visitor questions before trusting it with live leads.

* It uses existing website intent instead of chasing colder traffic.
* It creates proof for later outreach, partnerships, and paid tests.`;
  if (actionId === "channel_to_avoid") return `Channel to avoid: ${c.businessName} should avoid broad paid traffic until the approved-content demo, CTA, and lead handoff are clear.

* More clicks will not solve trust uncertainty.
* Spend should wait until the website can turn questions into qualified conversations.`;
  if (actionId === "fastest_test") return `Fastest test: show a short approved-content Fred demo to agencies and service businesses, then invite them to test one page.

* Track replies, demo clicks, and booked calls.
* Use the questions prospects ask to improve the proof block and CTA.`;
  if (actionId === "next_channel") return `Next channel: targeted cold email or partner outreach should come after ${c.businessName} has a clear website demo and lead handoff proof.

* Agencies need a concrete example they can picture for clients.
* Service businesses need to see the safe answer path before a sales call.`;
  return `First channel: ${c.businessName} should prioritize website conversion first, then use targeted outreach once the demo path proves approved-content AI can turn visitor questions into qualified leads.

* The buyer is ${c.audience}.
* The channel should prove safety, lead capture, CTA clarity, and handoff quality before scaling traffic.`;
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

function buildToolStackAnswer(blockContract: WorkBlockContract, actionContract: GuidedActionContract, c: Required<MarketingUtilityContext>) {
  const focused = (body: string) => blockContract.label + "\n\n" + actionContract.buttonLabel + " for " + c.businessName + ":\n\n" + body;
  if (blockContract.workBlockId === "current-tools" && actionContract.actionId === "missing_categories") return focused("Missing tool categories:\n\n1. Lead destination for captured Fred conversations.\n2. Source tracking for page and channel.\n3. Demo recording for approved-content proof.\n4. Same-day follow-up owner.");
  if (blockContract.workBlockId === "current-tools" && actionContract.actionId === "what_to_confirm") return focused("Confirm these before adding tools:\n\n1. Where captured leads land.\n2. Who follows up.\n3. Which CTA starts a demo or sales call.\n4. Which page or channel created the conversation.");
  if (blockContract.workBlockId === "recommended-tools" && actionContract.actionId === "simple_options") return focused("Simple starting options:\n\n1. CRM or spreadsheet for leads.\n2. Existing booking calendar.\n3. Basic website analytics.\n4. Loom-style demo recorder.\n5. Lightweight email outreach tool once targeting is clear.");
  if (blockContract.workBlockId === "recommended-tools" && actionContract.actionId === "upgrade_later") return focused("Upgrade only when:\n\n1. Fred conversations are producing qualified opportunities.\n2. Follow-up volume is too high for manual tracking.\n3. Channel tests are creating enough data to justify better attribution or automation.");
  if (blockContract.workBlockId === "setup-steps" && actionContract.actionId === "connect_first") return focused("Connect first:\n\n1. Fred conversation -> CRM, inbox, or spreadsheet.\n2. Lead destination -> same-day follow-up owner.\n3. Booking calendar -> demo CTA.\n\nLeave advanced automation until qualified conversations are flowing.");
  if (blockContract.workBlockId === "setup-steps" && actionContract.actionId === "what_can_wait") return focused("What can wait:\n\n1. Multi-step automation.\n2. Enterprise integrations.\n3. Paid attribution tooling.\n4. Multiple content tools.\n\nProve the demo, CTA, and handoff first.");
  if (blockContract.workBlockId === "setup-steps" && actionContract.actionId === "test_setup") return focused("Test this setup:\n\n1. Ask Fred a buying question.\n2. Confirm the approved-content answer.\n3. Submit lead details.\n4. Check the CRM/inbox handoff.\n5. Confirm follow-up happens the same day.");
  if (blockContract.workBlockId === "cost-fit" && actionContract.actionId === "worth_paying") return focused("Worth paying for now:\n\n1. CRM or booking if it prevents missed follow-up.\n2. Outreach tool once the target list is clear.\n3. Analytics if channel testing begins.\n\nDo not pay for complexity before the conversion path works.");
  if (blockContract.workBlockId === "cost-fit" && actionContract.actionId === "too_early") return focused("Too early:\n\n1. Expensive ad stack.\n2. Complex marketing automation suite.\n3. Multiple content tools.\n4. Enterprise integrations before demand is proven.");
  if (blockContract.workBlockId === "cost-fit" && actionContract.actionId === "upgrade_trigger") return focused("Upgrade trigger:\n\nUpgrade when Fred conversations create enough qualified leads that manual tracking, follow-up, or reporting starts causing missed opportunities.");
  if (blockContract.workBlockId === "integrations" && actionContract.actionId === "lead_flow") return focused("Lead flow:\n\nWebsite visitor question -> Fred approved-content answer -> captured lead details -> CRM/inbox -> same-day follow-up -> booked demo or sales call.");
  if (blockContract.workBlockId === "integrations" && actionContract.actionId === "tracking_loop") return focused("Tracking loop:\n\nTrack page, source, question, lead quality, follow-up status, and booked call. Review weekly to improve approved content and the demo CTA.");
  if (blockContract.workBlockId === "avoid-for-now" && actionContract.actionId === "why_avoid") return focused("Avoid them because they create setup work before the proof path is converting. " + c.businessName + " needs a clear demo, CTA, and lead handoff before more software.");
  if (blockContract.workBlockId === "avoid-for-now" && actionContract.actionId === "later_when") return focused("They may make sense later when qualified conversations are consistent, follow-up volume is growing, and the team needs automation or reporting to prevent missed opportunities.");
  if (blockContract.workBlockId === "use" && actionContract.actionId === "this_week") return focused("This week:\n\n1. Connect Fred conversations to one lead destination.\n2. Add the demo CTA.\n3. Track source and page.\n4. Set same-day follow-up.\n5. Review the top visitor questions.");
  if (blockContract.workBlockId === "use" && actionContract.actionId === "after_first_leads") return focused("After first leads:\n\n1. Check lead quality.\n2. Review the questions visitors asked.\n3. Update weak approved-content answers.\n4. Improve the CTA or handoff if follow-up is slow.");
  if (blockContract.workBlockId === "use" && actionContract.actionId === "owner_delegate") return focused("Owner/delegate split:\n\nOwner confirms the sales path, CTA, and follow-up promise. A teammate or agency can connect CRM, analytics, booking, and demo recording.");
  if (blockContract.workBlockId === "current-tools") return `Current Tools

${c.businessName} should inventory the tools that already touch the lead path.

Known or likely tools:
1. Website or CMS where Fred is installed or demonstrated.
2. Inbox, CRM, or spreadsheet where captured leads should land.
3. Calendar or sales call booking path.

Missing categories to confirm:
* Lead destination
* Source tracking
* Demo recording
* Same-day follow-up owner`;
  if (blockContract.workBlockId === "recommended-tools") return `Recommended Tools

${c.businessName} needs a lean stack that proves the AI assistant can turn website questions into qualified conversations.

1. CRM / lead tracker
   Use this to capture every Fred conversation, source, contact, and next step.

2. Booking calendar
   Use this to turn qualified website conversations into scheduled demos or sales calls.

3. Website analytics
   Use this to see which pages and channels produce the best Fred conversations.

4. Demo recording tool
   Use this to show agencies and business owners exactly how Fred answers from approved content.

5. Email/outreach tool
   Use this to test agency and service-business outreach without starting with paid ads.

Avoid for now:
Do not add a complex marketing automation stack until the demo path, CTA, and lead routing are clear.`;
  if (blockContract.workBlockId === "setup-steps") return `Setup Steps

${c.businessName} should set up the stack around one job: turning approved-content Fred conversations into visible, followed-up leads.

1. Connect Fred conversations to a lead destination.
   Route captured leads into a CRM, inbox, or spreadsheet so no conversation disappears.

2. Add one clear demo CTA.
   Use a simple CTA such as "See Fred answer from your website content."

3. Track source and page.
   Tag whether the lead came from homepage, pricing, guardrails, agency outreach, or content.

4. Set a follow-up rule.
   Every qualified Fred conversation should trigger a same-day email, call, or booking reminder.

5. Review weekly.
   Look at which questions visitors ask most and update approved content where answers are weak.`;
  if (blockContract.workBlockId === "cost-fit") return `Cost Fit

${c.businessName} should keep the tool stack lean until the core demo and lead path are converting.

Use now:
* existing website
* simple CRM or spreadsheet
* booking calendar
* analytics
* demo recorder

Worth paying for:
* CRM/booking if it reduces missed follow-up
* outreach tool once targeting is clear
* analytics if channel testing begins

Avoid for now:
* expensive ad stack
* complex automation suite
* multiple content tools
* enterprise integrations before demand is proven`;
  if (blockContract.workBlockId === "integrations") return `Integrations

${c.businessName} needs the lead path connected before adding more tools.

1. Website -> Fred conversation
   Visitor questions start the conversion path.

2. Fred conversation -> lead tracker
   Captured contact, question, urgency, and source must land somewhere visible.

3. Lead tracker -> follow-up
   Qualified conversations should trigger same-day email, call, or booking outreach.

4. Calendar -> booked calls
   The CTA should move qualified buyers into a demo or sales call.

5. Analytics -> weekly decision
   Track which page, channel, and question type creates the best opportunities.`;
  if (blockContract.workBlockId === "avoid-for-now") return `Avoid For Now

${c.businessName} should avoid tools that add complexity before the demo, CTA, and lead handoff are clear.

1. Enterprise automation suites
   Too much setup before the lead path is proven.

2. Multi-channel ad tooling
   Paid traffic will not fix a weak proof or demo path.

3. Too many content tools
   One clear demo and outreach path matters more than production volume.

4. Custom integrations for every edge case
   Wait until qualified conversations show which integrations buyers actually need.`;
  if (blockContract.workBlockId === "use") return `Use It Now

${c.businessName} should keep this setup simple and tied to qualified conversations.

Today:
1. Pick one lead destination for every Fred conversation.
2. Write one demo CTA tied to approved-content answers.

This week:
1. Connect source tracking.
2. Set a same-day follow-up rule.
3. Review the top visitor questions and update approved content.

Owner/delegate split:
The owner confirms the sales path; a teammate or agency can connect the tools.`;
  return buildFinishedUtilityAnswer({ ...marketingUtilityContracts.recommendation, utilityId: "recommendation" }, blockContract, actionContract, c);
}

function buildChannelDeploymentAnswer(blockContract: WorkBlockContract, actionContract: GuidedActionContract, c: Required<MarketingUtilityContext>) {
  const channel = blockContract.label;
  if (actionContract.actionId === "who_to_target") return `${channel} Targeting

${c.businessName} should target ${c.audience} that already have website visitors asking buying questions.

1. Prioritize buyers with traffic and slow or inconsistent answers.
2. Look for trust-sensitive categories where generic AI feels risky.
3. Avoid audiences with no website demand or no clear follow-up owner.`;
  if (actionContract.actionId === "assets_needed") return `${channel} Assets Needed

${c.businessName} needs these assets before using ${channel}:

1. Approved-content demo.
2. Clear offer statement.
3. Trust and guardrail proof block.
4. One CTA tied to testing Fred on website content.
5. Lead handoff path into CRM, inbox, or booking.`;
  if (actionContract.actionId === "weekly_rhythm") return `${channel} Weekly Rhythm

${c.businessName} should run one focused ${channel} test per week.

1. Publish or send one proof-backed asset.
2. Review replies, demo views, and booked calls.
3. Update approved answers from the questions buyers ask.`;
  if (actionContract.actionId === "what_to_track") return `${channel} Metrics

${c.businessName} should track qualified conversations, not vanity activity.

1. Demo clicks or views.
2. Replies from service businesses or agencies.
3. Booked calls.
4. Visitor questions captured.
5. Leads routed for same-day follow-up.`;
  if (actionContract.actionId === "avoid_mistakes") return `${channel} Mistakes To Avoid

${c.businessName} should avoid turning ${channel} into generic AI promotion.

1. Do not lead with vague automation claims.
2. Do not skip proof that answers stay inside approved content.
3. Do not drive traffic before the CTA and lead handoff are clear.`;
  if (blockContract.workBlockId === "use") {
    if (actionContract.actionId === "this_week") return `Use It Now

This week for ${c.businessName}:

1. Pick the first deployment channel.
2. Prep the approved-content demo asset.
3. Set one CTA for testing Fred on website content.
4. Decide what counts as a qualified conversation.
5. Review replies, booked calls, and captured questions.`;
    if (actionContract.actionId === "owner_action") return `Use It Now

Owner action for ${c.businessName}:

Confirm the offer, proof, CTA, and follow-up owner before any channel push.

* The owner should approve the demo promise.
* A teammate or agency can execute the channel steps.
* Keep the channel focused on qualified conversations, not vanity activity.`;
    return `Use It Now

Today for ${c.businessName}:

1. Choose the first channel.
2. Write the demo CTA.
3. Confirm where captured leads go.
4. Pick one metric: qualified conversations.`;
  }
  if (blockContract.workBlockId === "history") {
    if (actionContract.actionId === "what_changed") return `History

What changed for ${c.businessName}:

The current channel plan should stay tied to the approved-content demo, lead handoff, and buyer trust proof.

* Replace broad deployment ideas with focused channel tests.
* Keep the channel sequence based on qualified conversations.`;
    if (actionContract.actionId === "what_to_keep") return `History

What to keep for ${c.businessName}:

Keep the channel plan centered on website questions, approved-content answers, and qualified lead handoff.

* Keep demo proof.
* Keep one clear CTA.
* Keep weekly review of captured questions.`;
    if (actionContract.actionId === "what_to_replace") return `History

What to replace for ${c.businessName}:

Replace generic channel activity with channel tests that prove Fred can safely turn visitor questions into qualified leads.

* Replace broad traffic goals.
* Replace vague AI claims.
* Replace untracked activity.`;
    if (actionContract.actionId === "best_current") return `History

Best current version for ${c.businessName}:

Website conversion first, then targeted outreach once the demo and lead handoff are proven.

* This keeps deployment tied to trust and conversion.
* It avoids spending before the offer path is ready.`;
    return `History

Previous summary for ${c.businessName}:

Review saved channel plans against the current proof, CTA, and follow-up path before reusing them.`;
  }
  if (blockContract.workBlockId === "best-first-channel") return `Best First Channel

${c.businessName} should start with website conversion plus targeted agency/service-business outreach, not broad paid traffic.

Why this fits now:
* The buyer needs proof that approved-content AI can answer website questions safely.
* The best channel should let prospects see the product in action before a sales call.
* Outreach can target agencies and service businesses that already care about website leads.

Prepare first:
1. A short demo showing Fred answering from approved content.
2. A clear CTA: "See Fred answer from your website content."
3. A lead handoff path into CRM, inbox, or booking.

Track:
Demo views, replies, booked calls, qualified conversations, and questions that reveal buyer objections.`;
  if (blockContract.workBlockId === "cold-email") return `Cold Email Playbook

Who to target:
Website agencies, SEO agencies, and service businesses with lead-generating sites.

Subject angle:
Your client sites may be losing visitors after the first question.

Outreach promise:
${c.businessName} helps turn website questions into qualified leads with AI that only answers from approved content.

3-step sequence:
1. Send a specific website-question leak observation.
2. Show a short approved-answer demo.
3. Invite them to test Fred on one page.

Demo / CTA:
See Fred answer from your website content.

Compliance warning:
Do not lead with generic AI automation. Lead with safe answers, guardrails, and lead handoff quality.

Track:
Reply rate, demo clicks, booked calls, and qualified agency conversations.`;
  if (blockContract.workBlockId === "youtube") return `YouTube Playbook

Best content angle:
Show how website visitors ask buying questions and how approved-content AI answers without going off-brand.

5 video topics:
1. Why website visitors leave before contacting you.
2. Generic chatbot vs approved-content AI.
3. How Fred handles questions it should not answer.
4. What a qualified lead handoff looks like.
5. How agencies can add safer AI to client websites.

CTA:
Test Fred on your website content.

Weekly cadence:
One demo-style video each week, clipped into shorter posts.

Avoid:
Do not make broad AI thought-leadership videos before the demo proof is clear.`;
  if (blockContract.workBlockId === "website-conversion") return `Website Conversion Playbook

First job:
Make the website prove that ${c.businessName} answers visitor questions from approved content and captures qualified leads.

Assets needed:
1. Approved-content demo.
2. Guardrail proof block.
3. Clear CTA.
4. Example lead handoff.

Weekly rhythm:
Review visitor questions, update weak approved answers, and test one CTA or proof block.

Success metrics:
Started conversations, captured leads, booked demos, and qualified handoffs.`;
  return `${channel} Playbook

Best use for ${c.businessName}:
Use this channel only after the approved-content demo, CTA, and lead handoff are clear.

Who to target:
${c.audience}.

Assets needed:
1. Demo proof.
2. Clear offer statement.
3. Trust/safety explanation.
4. Follow-up path.

Weekly rhythm:
Run one focused test, review qualified conversations, and update the message from real buyer questions.

Avoid:
Do not use this channel to chase generic traffic before the conversion path is ready.`;
}

function buildFinishedUtilityAnswer(utilityContract: MarketingUtilityContract, blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>) {
  const label = actionContract.buttonLabel.toLowerCase();
  const heading = actionContract.buttonLabel === "Primary answer" ? "" : actionContract.buttonLabel + "\n\n";
  const base = context.businessName + " already sells " + context.offer + " to " + context.audience + ".";
  const buyerNeed = context.businessName + " should connect the buyer pain to a concrete outcome: " + context.buyerPain + " -> " + context.outcome + ".";

  if (/^(use|use-it-now)$/i.test(blockContract.workBlockId)) return blockContract.label + "\n\n" + heading + leadForAction(actionContract.buttonLabel, context);
  if (label.includes("avoid") || label.includes("ignore") || label.includes("wait")) return blockContract.label + "\n\n" + heading + "Avoid for now:\n\n1. Do not add more channels before the offer, proof, and CTA are clear.\n2. Do not use generic AI claims when the buyer needs approved-content trust.\n3. Do not distract from the existing product's core job: turning website questions into qualified opportunities.";
  if (label.includes("example")) return blockContract.label + "\n\n" + heading + "Examples:\n\n1. Website visitors get instant answers from approved content.\n2. The business captures the question, contact details, and urgency.\n3. The team receives a cleaner handoff for follow-up.\n4. Buyers see proof that AI stays safe, useful, and on-brand.";
  if (label.includes("clear")) return blockContract.label + "\n\n" + heading + "Clearer version:\n\n" + context.businessName + " helps " + context.audience + " turn website questions into qualified opportunities with approved-content AI.\n\n" + buyerNeed;
  if (label.includes("use")) return blockContract.label + "\n\n" + heading + "Ready-to-use version:\n\n" + context.businessName + " gives website visitors instant approved-content answers and gives the business cleaner lead details before the opportunity goes cold.";
  if (label.includes("save") || label.includes("update") || label.includes("impact") || label.includes("changed")) return blockContract.label + "\n\n" + heading + "Update:\n\n" + base + "\n\nThe useful signal is whether this improves trust, lead capture, or the handoff from visitor question to qualified follow-up.";
  if (label.includes("keep")) return blockContract.label + "\n\n" + heading + "Keep this:\n\nKeep the approved-content trust mechanism, the website-question problem, and the qualified-lead outcome visible in the asset.";
  if (label.includes("replace")) return blockContract.label + "\n\n" + heading + "Replace this:\n\nReplace generic AI or traffic language with specific proof that " + context.businessName + " answers from approved content and captures better lead context.";
  if (label.includes("current") || label.includes("summary")) return blockContract.label + "\n\n" + heading + "Current version:\n\n" + base + "\n\n" + buyerNeed;
  return blockContract.label + "\n\n" + heading + base + "\n\n" + buyerNeed + "\n\nMake this useful by naming the buyer, the pain, the asset to create, and the next practical step.";
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
  return `${c.businessName} helps ${c.audience} trust, understand, and act on ${c.offer}.`;
}

function repairUtilityAnswer(blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>) {
  const cleanAnswer = leadForAction(actionContract.buttonLabel, context);
  return blockContract.label + "\n\n" + cleanAnswer + "\n\n1. " + context.businessName + " already sells " + context.offer + ".\n2. Keep the answer focused on " + context.audience + ".\n3. Avoid generic advice and use the existing product, buyer pain, and trust mechanism.";
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
  if (/should make|should build|should create|could make|consider making|the selected business should/i.test(response)) flags.push("Output treats an existing product as a future build recommendation.");
  if (/(Audience HQ|Offer HQ|Messaging HQ|Strategy HQ|Content HQ|Execution HQ|Research HQ|Tool Stack HQ) decision|top pain points decision|Business context:/i.test(response)) flags.push("Output contains internal contract or meta commentary.");
  if (!/^(use|use-it-now)$/i.test(input.workBlockId) && /Use this now:/i.test(response)) flags.push("Output includes Use this now outside a Use It Now work block.");
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
    industry: context.industry || "AI website assistant for service businesses",
    offer: normalizeExistingOffer(context.offer),
    audience: roleSafeAudience(context.audience),
    buyerPain: roleSafeBuyerPain(context.buyerPain),
    outcome: context.outcome || "turn website questions into qualified leads with AI that only answers from approved content",
    proof: context.proof || "approved content, safe answer guardrails, and clean lead handoff",
    channel: context.channel || "website conversion",
    currentAsset: context.currentAsset || "current working asset not saved yet",
    savedAssets: context.savedAssets || [],
  };
}

function normalizeExistingOffer(value?: string) {
  if (!value || /best-fit customers|the business|problem creating hesitation/i.test(value)) return "approved-content AI website voice/conversation assistant";
  return value.replace(/^(make|build|create|consider making)\s+/i, "");
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
