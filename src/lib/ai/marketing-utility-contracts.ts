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
  utility("recommendation", "Tool Stack HQ", "Tool stack strategist", "Recommend only the tools that fit the next practical action.", ["current-tools", "recommended-tools", "setup-steps", "cost-fit", "integrations", "avoid-for-now", "use", "feed", "history"].map((id) => simpleBlock(id, titleize(id), ...defaultActionsFor(id)))),
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

function buildFinishedUtilityAnswer(utilityContract: MarketingUtilityContract, blockContract: WorkBlockContract, actionContract: GuidedActionContract, context: Required<MarketingUtilityContext>) {
  const label = actionContract.buttonLabel.toLowerCase();
  const heading = actionContract.buttonLabel === "Primary answer" ? "" : actionContract.buttonLabel + "\n\n";
  const base = context.businessName + " already sells " + context.offer + " to " + context.audience + ".";
  const buyerNeed = "The buyer needs a clearer path from " + context.buyerPain + " to " + context.outcome + ".";

  if (/^(use|use-it-now)$/i.test(blockContract.workBlockId)) return blockContract.label + "\n\n" + heading + leadForAction(actionContract.buttonLabel, context);
  if (label.includes("avoid") || label.includes("ignore") || label.includes("wait")) return blockContract.label + "\n\n" + heading + "Avoid for now:\n\n1. Do not add more channels before the offer, proof, and CTA are clear.\n2. Do not use generic AI claims when the buyer needs approved-content trust.\n3. Do not distract from the existing product's core job: turning website questions into qualified opportunities.";
  if (label.includes("example")) return blockContract.label + "\n\n" + heading + "Examples:\n\n1. Website visitors get instant answers from approved content.\n2. The business captures the question, contact details, and urgency.\n3. The team receives a cleaner handoff for follow-up.\n4. Buyers see proof that AI stays safe, useful, and on-brand.";
  if (label.includes("clear")) return blockContract.label + "\n\n" + heading + "Clearer version:\n\n" + context.businessName + " helps " + context.audience + " turn website questions into qualified opportunities with approved-content AI.\n\n" + buyerNeed;
  if (label.includes("use")) return blockContract.label + "\n\n" + heading + "Ready-to-use version:\n\n" + context.businessName + " gives website visitors instant approved-content answers and gives the business cleaner lead details before the opportunity goes cold.";
  if (label.includes("save") || label.includes("update") || label.includes("impact") || label.includes("changed")) return blockContract.label + "\n\n" + heading + "Update:\n\n" + base + "\n\nThe useful signal is whether this improves trust, lead capture, or the handoff from visitor question to qualified follow-up.";
  if (label.includes("keep")) return blockContract.label + "\n\n" + heading + "Keep this:\n\nKeep the approved-content trust mechanism, the website-question problem, and the qualified-lead outcome visible in the asset.";
  if (label.includes("replace")) return blockContract.label + "\n\n" + heading + "Replace this:\n\nReplace generic AI or traffic language with specific proof that " + context.businessName + " answers from approved content and captures better lead context.";
  if (label.includes("current") || label.includes("summary")) return blockContract.label + "\n\n" + heading + "Current version:\n\n" + base + "\n\n" + buyerNeed;
  return blockContract.label + "\n\n" + heading + base + "\n\n" + buyerNeed + "\n\nStrong output:\nA short, specific asset that helps the buyer understand why approved-content answers are safer than a generic chatbot.";
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
