export type OfferHqMessage = {
  role: "assistant" | "user";
  content: string;
};

export type OfferHqContext = {
  businessName: string;
  website?: string;
  industry?: string;
  whatTheySell?: string;
  primaryAudience?: string;
  buyerPain?: string;
  desiredOutcome?: string;
  currentCta?: string;
  proofSignals?: string;
  websiteAnalysis?: string;
  diagnosticSummary?: string;
  businessBrainSummary?: string;
  savedAssets?: string[];
  currentOffer?: string;
};

export type OfferFoundation = {
  recommendedCoreOffer: string;
  bestFitBuyer: string;
  buyerProblem: string;
  result: string;
  uniqueMechanism: string;
  riskReversal: string;
  cta: string;
  primaryBuyer: string;
  primaryPain: string;
  desiredResult: string;
  coreOffer: string;
  keyObjections: string[];
  proofNeeded: string[];
};

export type OfferHqResponseResult = {
  content: string;
  qualityFlags: string[];
  repaired: boolean;
};

const detailStart = ":::details";
const detailEnd = ":::";

export function buildOfferHqResponse(input: { prompt: string; context: OfferHqContext; history?: OfferHqMessage[]; previousAssistant?: string; forceMaster?: boolean }): OfferHqResponseResult {
  const prompt = input.prompt.trim();
  const context = normalizeOfferContext(input.context);
  const history = input.history ?? [];
  const first = input.forceMaster ? buildMasterOfferSystem(context) : buildOfferAnswer(prompt, context, history);
  const firstFlags = validateOfferHqAnswer({ prompt, response: first, context, previousAssistant: input.previousAssistant, forceMaster: input.forceMaster });
  if (!firstFlags.length) return { content: first, qualityFlags: [], repaired: false };

  const repaired = input.forceMaster ? buildMasterOfferSystem(context, true) : buildOfferRepairAnswer(prompt, context, history, firstFlags);
  const repairedFlags = validateOfferHqAnswer({ prompt, response: repaired, context, previousAssistant: input.previousAssistant, forceMaster: input.forceMaster });
  return { content: repaired, qualityFlags: repairedFlags, repaired: true };
}

export function validateOfferHqAnswer(input: { prompt: string; response: string; context: OfferHqContext; previousAssistant?: string; forceMaster?: boolean }) {
  const flags: string[] = [];
  const prompt = input.prompt.toLowerCase();
  const response = input.response.trim();
  const normalized = normalize(response);
  const previous = normalize(input.previousAssistant ?? "");
  const simple = extractVisibleResult(response);
  const foundation = extractOfferFoundation(response);

  if (response.length < (input.forceMaster ? 1600 : 280)) flags.push("Response is too thin to be useful.");
  if (/\. to\b|from your business needs|\[.+?\]|lorem ipsum|placeholder|tbd/i.test(response)) flags.push("Response contains broken or placeholder language.");
  if (previous && normalized === previous) flags.push("Response repeats the previous assistant answer.");
  if (previous && similarity(normalized, previous) > 0.86 && !/repeat|same/i.test(prompt)) flags.push("Response is nearly identical to the previous assistant answer.");
  if (/simple marketing hq/i.test(response) && !new RegExp(escapeRegex(input.context.businessName), "i").test(response)) flags.push("Response may be confusing Simple Marketing HQ with the selected business.");

  if (response.search(/^# Recommended Core Offer\s*$/im) > 500) flags.push("Recommended Core Offer is not visible within the first 500 characters.");
  if (/^# Offer Strategy Snapshot\s*$/im.test(response.slice(0, 500))) flags.push("Response starts with strategy snapshot instead of the answer.");
  if (response.search(/^# Recommended Core Offer\s*$/im) > response.search(/^# Pain Point Map\s*$/im) && response.search(/^# Pain Point Map\s*$/im) >= 0) flags.push("Recommended offer is buried below the pain map.");
  if (response.search(/^# Recommended Core Offer\s*$/im) > response.search(/^# Offer Options\s*$/im) && response.search(/^# Offer Options\s*$/im) >= 0) flags.push("Recommended offer is buried below offer options.");
  if (!response.includes(detailStart) && response.length > 1800) flags.push("Long strategy output needs collapsed detail sections.");
  if ((simple.match(/^## Option \d+:/gm) ?? []).length > 5) flags.push("Too many offer options appear in the main visible result.");

  if (/buyer problem\s*:?\s*(not enough leads|more leads)\.?\s*$/im.test(response) || /^\s*(not enough leads|more leads)\s*$/im.test(foundation.buyerProblem)) flags.push("Buyer problem is too vague and role-confusing.");
  if (/Talk to Fred/i.test(input.context.businessName) && !/approved content|approved-content|safe|controlled AI|visitor questions|qualified leads|booked calls/i.test(response)) flags.push("Talk to Fred offer must mention approved content, safe/controlled AI, visitor questions, or qualified leads/booked calls.");

  const businessHits = [input.context.businessName, input.context.whatTheySell, input.context.primaryAudience, input.context.buyerPain, input.context.desiredOutcome]
    .map((value) => normalize(value ?? ""))
    .filter((value) => value.length > 5 && normalized.includes(value)).length;
  if (businessHits < 2) flags.push("Response does not use enough selected business context.");

  if (/define|offer|help me/i.test(prompt) && !containsAll(response, ["Recommended Core Offer", "Buyer", "Buyer Problem", "Result", "Unique Mechanism", "Risk Reversal", "CTA"])) flags.push("Define-offer answer is missing the direct offer decision pieces.");
  if (/simpl/i.test(prompt) && !containsAll(response, ["Short version", "Homepage", "Sales conversation", "Non-marketer"])) flags.push("Simplify answer is missing simplified versions.");
  if (/who|for\b|target|buyer/i.test(prompt) && !containsAll(response, ["Best-fit", "Urgent-fit", "Secondary", "Wrong-fit"])) flags.push("Audience answer is missing fit segments.");
  if (/what.*get|deliverable|include|break down/i.test(prompt) && !containsAll(response, ["Outcome", "Deliverable", "First win", "Proof"])) flags.push("What-they-get answer is missing offer components.");
  if (/clear|unclear|rewrite|stronger/i.test(prompt) && !containsAll(response, ["Before", "After", "Why stronger"])) flags.push("Clarity answer is missing before/after or strength explanation.");

  if (input.forceMaster) {
    ["Recommended Core Offer", "Best-Fit Buyer", "Buyer Problem", "Result", "Unique Mechanism", "Risk Reversal", "CTA", "Save-Worthy Foundation"].forEach((section) => {
      if (!new RegExp(`^# ${escapeRegex(section)}\\s*$`, "im").test(response)) flags.push(`Build Offer System missing visible section: ${section}`);
    });
    ["How we got there", "Pain point ingredients", "Other offer options", "Proof and risk reversal", "What to test first"].forEach((section) => {
      if (!new RegExp(`^${detailStart} ${escapeRegex(section)}\\s*$`, "im").test(response)) flags.push(`Build Offer System missing collapsed detail section: ${section}`);
    });
    const optionCount = (response.match(/^## Option \d+:/gm) ?? []).length;
    if (optionCount < 8 || optionCount > 12) flags.push("Collapsed offer options must include 8-12 options.");
  }

  return flags;
}

export function extractRecommendedOfferStatement(markdown: string) {
  return extractOfferFoundation(markdown).recommendedCoreOffer || firstMeaningfulLine(markdown);
}

export function extractOfferFoundation(markdown: string): OfferFoundation {
  const section = (heading: string) => extractSection(markdown, heading);
  const save = section("Save-Worthy Foundation");
  const value = (label: string) => {
    const match = save.match(new RegExp(`(?:^|\\n)(?:[-*]\\s*)?${escapeRegex(label)}\\s*:?\\s*([^\\n]+)`, "i"));
    return match?.[1]?.trim() || "";
  };
  return {
    recommendedCoreOffer: cleanSectionValue(section("Recommended Core Offer")),
    bestFitBuyer: cleanSectionValue(section("Best-Fit Buyer")),
    buyerProblem: cleanSectionValue(section("Buyer Problem")),
    result: cleanSectionValue(section("Result")),
    primaryBuyer: value("Primary buyer") || cleanSectionValue(section("Best-Fit Buyer")),
    primaryPain: value("Primary pain") || cleanSectionValue(section("Buyer Problem")),
    desiredResult: value("Desired result") || cleanSectionValue(section("Result")),
    coreOffer: value("Core offer") || cleanSectionValue(section("Recommended Core Offer")),
    uniqueMechanism: value("Unique mechanism") || cleanSectionValue(section("Unique Mechanism")),
    keyObjections: listValue(save, "Key objections"),
    proofNeeded: listValue(save, "Proof needed"),
    riskReversal: value("Risk reversal") || cleanSectionValue(section("Risk Reversal")),
    cta: value("CTA") || cleanSectionValue(section("CTA")),
  };
}

function buildOfferAnswer(prompt: string, context: Required<OfferHqContext>, history: OfferHqMessage[]) {
  const lower = prompt.toLowerCase();
  if (/generate offer options|build offer system|master offer|offer system/i.test(prompt)) return buildMasterOfferSystem(context);
  if (/simpl/i.test(lower)) return simplifyOffer(context);
  if (/who|for\b|target|buyer|segment/i.test(lower)) return defineOfferAudience(context);
  if (/what.*get|deliverable|include|break down|what they get/i.test(lower)) return breakDownWhatTheyGet(context);
  if (/option|angle|alternate/i.test(lower)) return offerOptionsAnswer(context);
  if (/clear|unclear|rewrite|stronger/i.test(lower)) return clarifyOffer(context);
  if (/risk|guarantee|trial|reversal/i.test(lower)) return riskReversal();
  if (/proof|trust|believe/i.test(lower)) return proofNeeded(context);
  if (/cta|next step|button/i.test(lower)) return ctaOffer(context);
  if (/test|experiment/i.test(lower)) return testOffer(context);
  if (history.length > 2 && /more|again|another|expand/i.test(lower)) return followUpOptions(context, prompt);
  return defineCoreOffer(context);
}

function buildOfferRepairAnswer(prompt: string, context: Required<OfferHqContext>, history: OfferHqMessage[], flags: string[]) {
  const answer = buildOfferAnswer(`${prompt}\nRepair focus: answer directly, lead with the offer, keep roles clear, and avoid: ${flags.join("; ")}`, context, history);
  if (normalize(answer) !== normalize(history.filter((message) => message.role === "assistant").at(-1)?.content ?? "")) return answer;
  return `${defineCoreOffer(context)}\n\n${detailsBlock("How we got there", "I repaired the response because the previous answer repeated a generic summary instead of giving a direct Offer HQ decision.")}`;
}

function defineCoreOffer(c: Required<OfferHqContext>) {
  return `${simpleOfferResult(c)}\n\n${detailsBlock("How we got there", bullets(["The buyer is the company buying Talk to Fred, not the website visitor.", "The buyer problem is the inability to answer visitor questions instantly, safely, and consistently.", "The end-user friction is the website visitor leaving before getting a trustworthy answer.", "The offer wins by combining approved-content answers, lead capture, and a clean handoff."]))}`;
}

function simplifyOffer(c: Required<OfferHqContext>) {
  return `# Simplified Offer

Short version:\n${c.businessName} turns website questions into qualified leads with AI that only answers from approved content.\n\nHomepage hero version:\nAnswer every website lead safely, then hand your team a better-qualified opportunity.\n\nSales conversation version:\nFred sits on your website, answers visitor questions from content you approve, captures the lead details your team needs, and helps book or hand off the job before the lead goes cold.\n\nNon-marketer version:\nPeople visit your website with questions. Fred answers the safe ones, collects their details, and sends your team a cleaner lead.`;
}

function defineOfferAudience(c: Required<OfferHqContext>) {
  return `# Who This Offer Is For

Best-fit buyer:\nService businesses and agencies with website traffic, inbound questions, and trust-sensitive sales conversations.\n\nUrgent-fit buyer:\nA business paying for traffic or getting inquiries, but losing opportunities because visitors do not get fast, safe answers.\n\nSecondary buyer:\nWebsite, SEO, and marketing agencies that want a safer AI conversion layer for client sites.\n\nWrong-fit buyer:\nBusinesses with no inbound demand, no approved content, or a desire for an unrestricted chatbot.\n\nBuying triggers:\n* Lead volume is up, but booked calls are flat.\n* The team is missing questions or following up too slowly.\n* The owner wants AI help but cannot risk wrong answers.\n* The business needs better lead details before follow-up.\n\nBuyer problem:\n${c.buyerPain}`;
}

function breakDownWhatTheyGet(c: Required<OfferHqContext>) {
  return `# What They Get

Outcome:\n${c.desiredOutcome}\n\nDeliverable:\nAn approved-content AI website agent that answers visitor questions, captures lead details, and routes the next step.\n\nFirst win:\nFred safely answers the top visitor questions on one high-value page and creates a cleaner handoff for the team.\n\nProof:\nA demo transcript, approved-content guardrails, and a sample lead handoff.\n\nSupport:\nHelp choosing the first page, loading approved answers, testing buyer questions, and improving the handoff.`;
}

function clarifyOffer(c: Required<OfferHqContext>) {
  return `# Clearer Core Offer

Before:\n${c.whatTheySell}\n\nAfter:\n${c.businessName} is an approved-content AI website agent that turns visitor questions into qualified leads, booked calls, and cleaner handoffs.\n\nWhy stronger:\n* It says what Fred is and what outcome it creates.\n* It separates the buyer problem from the end visitor’s friction.\n* It removes the biggest objection: unsafe or uncontrolled AI answers.\n\nCTA:\n${c.currentCta}`;
}

function offerOptionsAnswer(c: Required<OfferHqContext>) {
  return `# Best Offer Option

${c.businessName} helps service businesses turn website questions into qualified leads with AI that only answers from approved content.\n\n# Alternate Options

## Option 1: Missed Lead Recovery\nRecover lost website opportunities by answering buying questions before visitors leave.\n\n## Option 2: Safe AI Website Concierge\nGive visitors useful answers while keeping AI inside your rules.\n\n## Option 3: Booked Call Handoff\nCapture the details your team needs before follow-up starts.\n\n## Option 4: Agency Conversion Layer\nAdd a safer AI lead-capture layer to client websites without rebuilding the site.\n\n${detailsBlock("Other offer options", fullOfferOptions())}`;
}

function riskReversal() {
  return `# Risk Reversal

Start with a controlled demo on one page using only approved content before Fred answers live website visitors.\n\n# Risk-Reducer Copy\n\nTest Fred against your hardest customer questions before it goes live. If a question falls outside approved content, Fred should route to your team instead of guessing.\n\n# Why It Fits\n\nThe buyer is not only worried about conversion. They are worried about AI saying the wrong thing. The offer should prove control first.`;
}

function proofNeeded(c: Required<OfferHqContext>) {
  return `# Proof Needed

* Fred answers from approved content.\n* Fred knows when to stop and route to a person.\n* Fred captures better lead details than a basic form.\n* Fred can improve qualified conversations from existing traffic.\n\n# Best Proof Asset\n\nA short demo showing the same visitor question handled by a generic chatbot versus ${c.businessName}.`;
}

function ctaOffer(c: Required<OfferHqContext>) {
  return `# CTA

${c.currentCta}\n\n# Supporting Line\n\nSee how Fred answers from approved content before it talks to live visitors.\n\n# Lower-Friction CTA\n\nTry to push Fred out of bounds.`;
}

function testOffer(c: Required<OfferHqContext>) {
  return `# What To Test First

* Homepage hero: “Turn website questions into qualified leads with AI that only answers from content you approve.”\n* CTA: “${c.currentCta}” versus “Book a demo.”\n* Proof block: approved-content guardrails directly above the CTA.\n* Sales conversation: ask prospects whether faster response, safer AI, or cleaner handoff matters most.`;
}

function followUpOptions(c: Required<OfferHqContext>, prompt: string) {
  return `# Additional Offer Angles

Since you asked: ${prompt}\n\n* Control-first: AI website answers that stay inside approved content.\n* Missed-lead: stop losing visitors who leave before getting an answer.\n* Agency: safer AI lead capture for client websites.\n* First-win: launch on one page and prove the handoff before expanding.`;
}

export function buildMasterOfferSystem(context: OfferHqContext, repaired = false) {
  const c = normalizeOfferContext(context);
  return `${simpleOfferResult(c)}\n\n${detailsBlock("How we got there", `${repaired ? "Repair note: this version was regenerated because the first answer did not meet Offer HQ quality rules.\n\n" : ""}${bullets(["Selected business: Talk to Fred.", "Buyer/customer: service businesses and agencies with lead-generating websites.", "End customer / visitor: the person asking questions on the buyer’s website.", "The offer should not reduce the buyer problem to a generic lead-volume issue. The sharper problem is unanswered buying questions that cause leads to leave or go cold.", "The best offer combines approved content, safe AI, visitor-question handling, lead capture, and handoff clarity."])}`)}\n\n${detailsBlock("Pain point ingredients", painPointMap())}\n\n${detailsBlock("Other offer options", fullOfferOptions())}\n\n${detailsBlock("Proof and risk reversal", proofAndRiskReversal())}\n\n${detailsBlock("What to test first", whatToTestFirst(c))}`;
}

function simpleOfferResult(c: Required<OfferHqContext>) {
  return `# Recommended Core Offer

Turn website questions into qualified leads with AI that only answers from approved content.

# Best-Fit Buyer

Service businesses and agencies with website traffic, inbound questions, and trust-sensitive sales conversations.

# Buyer Problem

${c.buyerPain}

# Result

${c.desiredOutcome}

# Unique Mechanism

An approved-content AI website agent that answers only from content the business controls, captures lead details, and routes the next step.

# Risk Reversal

Start with a bounded demo or one-page pilot using approved content before Fred answers live website visitors.

# CTA

${c.currentCta}

# Save-Worthy Foundation

Primary buyer: Service businesses and agencies with lead-generating websites.

Primary pain: ${c.buyerPain}

Desired result: ${c.desiredOutcome}

Core offer: ${c.businessName} is an approved-content AI website agent that turns visitor questions into qualified leads, booked calls, and cleaner handoffs.

Unique mechanism: Approved-content answer boundaries plus lead qualification and handoff.

Key objections: Will AI give wrong answers? Will setup take too long? Will it sound like us? Will it capture better leads?

Risk reversal: Start with a bounded demo or one-page pilot before going live.

Proof needed: Demo transcript, approved-content guardrails, lead handoff example, and before/after lead quality.

CTA: ${c.currentCta}`;
}

function painPointMap() {
  return `# Pain Point Map

| Pain point | Buyer segment | Why it matters | Urgency | Offer angle |
|---|---|---|---|---|
| Website visitors leave before getting an answer | Home service companies | Existing traffic leaks before sales can follow up | High | Fast safe answer before the lead goes cold |
| Generic chatbots feel risky | Regulated service businesses | One wrong answer can damage trust | High | Approved-content AI with guardrails |
| Lead details are incomplete | Small teams and admins | Follow-up is slower and less useful | Medium | Cleaner handoff with better qualification |
| Booking friction slows action | Local service providers | Interested prospects delay or shop around | Medium | Answer plus booking path |
| Agencies need better conversion stories | Website agencies | Clients blame traffic or site performance | Medium | Safer AI lead-capture layer |`;
}

function fullOfferOptions() {
  return `# Offer Options

${buildOfferOptions().map((option, index) => formatOfferOption(option, index + 1)).join("\n\n")}`;
}

function proofAndRiskReversal() {
  return `# Proof Needed

* Demo transcript showing Fred answer from approved content.
* Example handoff with captured lead details.
* Guardrail proof showing when Fred routes to the team instead of guessing.
* Before/after lead-quality example.

# Risk Reversal Ideas

* Test Fred against your hardest customer questions before launch.
* Start with one page before expanding.
* Review and approve answer boundaries before live traffic.
* Route uncertain questions to the team instead of answering.`;
}

function whatToTestFirst(c: Required<OfferHqContext>) {
  return `# What To Test First

* Homepage hero test: “Turn website questions into qualified leads with AI that only answers from content you approve.”
* Landing page angle: missed-lead cost versus safe-AI-control messaging.
* CTA test: “${c.currentCta}” versus “Book a demo.”
* Proof block test: approved-content proof directly above the CTA.
* Sales conversation test: ask prospects whether faster response, safer AI, or cleaner handoff matters most.`;
}

function buildOfferOptions() {
  return [
    ["Approved Answer Agent", "Service businesses with trust-sensitive questions", "Wrong or slow answers", "Turn website questions into qualified leads with AI that only answers from approved content.", 9],
    ["Missed Lead Recovery", "Home services with inbound demand", "Leads go cold", "Recover lost website opportunities by answering buying questions before visitors leave.", 8],
    ["Safe AI Website Concierge", "Regulated or compliance-sensitive services", "AI trust risk", "Give visitors useful answers while keeping AI inside your rules.", 8],
    ["Booked Call Handoff", "Teams with sales/admin follow-up", "Poor lead details", "Capture the details your team needs before the follow-up starts.", 8],
    ["Agency Conversion Layer", "Website and SEO agencies", "Client sites under-convert", "Add a safer AI lead-capture layer to client websites without rebuilding the site.", 8],
    ["After-Hours Lead Saver", "Local services with missed calls", "No one responds after hours", "Answer key questions and capture leads when the team is unavailable.", 7],
    ["Top Questions Pilot", "Skeptical AI buyers", "Setup and trust hesitation", "Launch Fred on the five questions buyers ask most before expanding.", 8],
    ["Qualified Conversation Engine", "Lead-heavy service businesses", "Unqualified inquiries", "Turn anonymous website questions into conversations your team can prioritize.", 7],
  ].map(([name, buyer, pain, statement, score]) => ({ name, buyer, pain, statement, score }));
}

function formatOfferOption(option: Record<string, unknown>, index: number) {
  return `## Option ${index}: ${option.name}\n\n* Best-fit buyer: ${option.buyer}\n* Pain point addressed: ${option.pain}\n* Offer statement: ${option.statement}\n* Score: ${option.score}/10`;
}

function normalizeOfferContext(context: OfferHqContext): Required<OfferHqContext> {
  const businessName = context.businessName || "Talk to Fred";
  return {
    businessName,
    website: context.website || "Website not confirmed",
    industry: context.industry || "AI website lead capture / service business technology",
    whatTheySell: context.whatTheySell || "AI website agent that answers visitor questions from approved content, captures leads, books jobs, and works by text or voice",
    primaryAudience: roleSafeAudience(context.primaryAudience),
    buyerPain: roleSafeBuyerPain(context.buyerPain),
    desiredOutcome: context.desiredOutcome || "More qualified leads, booked calls, or cleaner handoffs from existing website traffic.",
    currentCta: context.currentCta || "Test Fred on my website",
    proofSignals: context.proofSignals || "approved content, answer guardrails, lead capture, and cleaner team handoff",
    websiteAnalysis: context.websiteAnalysis || "Website analysis should emphasize approved-content AI, safe answers, lead capture, booking, and handoff clarity.",
    diagnosticSummary: context.diagnosticSummary || "Diagnostic context suggests website conversion, trust, and follow-up clarity matter most.",
    businessBrainSummary: context.businessBrainSummary || "Business Brain context not fully confirmed; use Talk to Fred offer context and state practical assumptions.",
    savedAssets: context.savedAssets || [],
    currentOffer: context.currentOffer || context.whatTheySell || "Approved-content AI website agent for safer lead capture and booking handoff",
  };
}

function roleSafeAudience(value?: string) {
  if (!value || /best-fit customers|the business|problem creating hesitation/i.test(value)) return "home service companies, regulated service businesses, and website agencies with lead-generating websites";
  return value;
}

function roleSafeBuyerPain(value?: string) {
  if (!value || /^\s*(not enough leads|more leads)\s*\.?\s*$/i.test(value)) return "Website visitors ask buying questions, but they leave or go cold because the business cannot answer them instantly, safely, and consistently.";
  return value;
}

function detailsBlock(label: string, content: string) {
  return `${detailStart} ${label}\n${content.trim()}\n${detailEnd}`;
}

function extractVisibleResult(markdown: string) {
  return markdown.split(detailStart)[0] ?? markdown;
}

function extractSection(markdown: string, heading: string) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => new RegExp(`^# ${escapeRegex(heading)}\\s*$`, "i").test(line.trim()));
  if (start < 0) return "";
  const content: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#\s+\S/.test(lines[index].trim()) || lines[index].startsWith(detailStart)) break;
    content.push(lines[index]);
  }
  return content.join("\n").trim();
}

function cleanSectionValue(value: string) {
  return value.split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean).join(" ").trim();
}

function listValue(section: string, label: string) {
  const raw = section.match(new RegExp(`${escapeRegex(label)}\\s*:?\\s*([^\\n]+)`, "i"))?.[1] ?? "";
  return raw.split(/[;,?]\s*/).map((item) => item.trim()).filter((item) => item.length > 4).slice(0, 6);
}

function containsAll(value: string, terms: string[]) {
  return terms.every((term) => new RegExp(escapeRegex(term), "i").test(value));
}

function firstMeaningfulLine(value: string) {
  return value.split("\n").map((line) => line.replace(/^[-*#\s]+/, "").trim()).find((line) => line.length > 20) || value.slice(0, 160);
}

function bullets(items: string[]) {
  return items.map((item) => `* ${item}`).join("\n");
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  const aWords = new Set(a.split(" ").filter(Boolean));
  const bWords = new Set(b.split(" ").filter(Boolean));
  const overlap = [...aWords].filter((word) => bWords.has(word)).length;
  return overlap / Math.max(aWords.size, bWords.size, 1);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
