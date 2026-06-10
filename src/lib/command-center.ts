import { getIndustryProfile, type LaunchPadResult } from "@/lib/launchpad";

export const commandCenterModules = [
  {
    slug: "diagnostic",
    title: "Diagnostic",
    href: "/diagnostic",
    body: "Start with intake across business, offer, audience, website, leads, sales process, content, follow-up, and goals.",
  },
  {
    slug: "growth-score",
    title: "Growth Score & Suggestions",
    href: "/growth-score",
    body: "Score the marketing foundation across ICP clarity, industry fit, offer clarity, message clarity, conversion readiness, proof, follow-up, and channel readiness.",
  },
  {
    slug: "icp-builder",
    title: "ICP Builder",
    href: "/icp-builder",
    body: "Define the best-fit customer, bad-fit traits, buying triggers, objections, proof needed, lead magnets, and channel fit.",
  },
  {
    slug: "offer-builder",
    title: "Offer Builder",
    href: "/offer-builder",
    body: "Shape the dream outcome, customer pain, value stack, speed-to-result, effort reduction, risk reversal, package frame, and CTA.",
  },
  {
    slug: "message-builder",
    title: "Message Builder",
    href: "/message-builder",
    body: "Turn the offer and ICP into a sharper homepage headline, elevator pitch, proof points, and follow-up scripts.",
  },
  {
    slug: "strategy-map",
    title: "Strategy Map",
    href: "/strategy-map",
    body: "Plan the next 7 days, next 30 days, missing assets, channel readiness, and review rhythm.",
  },
  {
    slug: "marketing-schedule",
    title: "Marketing Schedule",
    href: "/marketing-schedule",
    body: "Convert strategy and content into a simple weekly rhythm for creation, campaign prep, follow-up, and review.",
  },
  {
    slug: "research-hub",
    title: "Research Hub",
    href: "/research-hub",
    body: "Research audience pains, objections, competitors, FAQs, positioning angles, proof gaps, and content ideas.",
  },
  {
    slug: "content-engine",
    title: "Content Engine",
    href: "/content-engine",
    body: "Create authority content, short-form hooks, long-form outlines, lead magnet ideas, email sequences, and campaign assets.",
  },
  {
    slug: "advisor",
    title: "Advisor",
    href: "/advisor",
    body: "Get a calm next-action recommendation with why it matters, steps to execute, and the asset to build next.",
  },
  {
    slug: "recommendations",
    title: "Recommendations",
    href: "/recommendations",
    body: "Recommend outside tools and channels only after the foundation is clear enough for takeoff.",
  },
];

export function buildIcpStarter(result: LaunchPadResult | null) {
  const industry = getIndustryProfile(result?.answers.industryCategory);
  const bestFit = result?.answers.targetCustomer || "Best-fit customers are not defined yet. Start by naming the buyer segment, size, budget, location, and decision maker.";
  const profitable = result?.answers.profitableCustomer || "Prioritize customers with a real urgent problem, enough budget, and a clear reason to act now.";
  const badFit = result?.answers.hardestCustomer || "Avoid customers who lack budget, urgency, trust, or fit for your core offer.";
  const urgentProblem = result?.answers.urgentProblem || "Clarify the specific event or pain that makes this customer start looking for help.";
  const outcome = result?.customerDesiredOutcome || "a measurable outcome they care about";
  const alternative = result?.answers.currentAlternative || "DIY workarounds, cheaper providers, asking peers, spreadsheets, or doing nothing";
  const proof = result?.answers.trustFactor || industry.proof;
  const offer = result?.answers.whatSelling || "your core service or product";

  return {
    industry: industry.label,
    bestFitSummary: `${bestFit}. Best early focus: ${profitable}`,
    badFitWarning: badFit,
    topPains: [
      urgentProblem,
      `They want ${outcome}, but the current path is too slow, unclear, risky, or inconsistent.`,
      `Their current alternative is ${alternative}, which creates an opening for a clearer, lower-friction offer.`,
    ],
    buyingTriggers: industry.triggers.map((trigger) => `${trigger}: connect this to ${urgentProblem.toLowerCase()}.`),
    objections: [...industry.objections, "Will this be worth the time and money?"],
    messageAngles: [
      `Lead with the urgent problem: ${urgentProblem}.`,
      `Show the cost of staying with ${alternative}.`,
      `Position ${offer} as the simplest path to ${outcome}.`,
    ],
    leadMagnets: industry.leadMagnets,
    channels: industry.channels,
    offerAdjustments: [
      `Add proof near the CTA: ${proof}.`,
      "Make the first step smaller, clearer, and easier to say yes to.",
      "Name who the offer is best for and who it is not for.",
    ],
    nextActions: [
      "Write a one-sentence ICP: buyer type, urgent pain, trigger, desired outcome, and proof needed.",
      "Rewrite the offer headline so it speaks to that ICP and trigger.",
      "Create one lead magnet or authority asset from the top buying trigger.",
    ],
  };
}

export function buildOfferStarter(result: LaunchPadResult | null) {
  const business = result?.businessName ?? "Your business";
  const target = result?.answers.targetCustomer || "the customers you want most";
  const outcome = result?.customerDesiredOutcome || "a clearer path to the result they want";
  const offer = result?.answers.whatSelling || "your core service or product";
  const bottleneck = result?.biggestBottleneck || "the current marketing bottleneck";

  return {
    dreamOutcome: `${target} want ${outcome}.`,
    problem: `${business} needs the offer to make that outcome feel specific, believable, and easy to act on.`,
    offerStack: [
      `Core offer: ${offer}.`,
      "Fast-start step: make the first decision or booking step obvious.",
      "Proof layer: add one clear customer result, review, case example, or before/after.",
      "Risk reducer: explain what happens next and why the customer is not locked into a confusing process.",
    ],
    cta: "Book a quick fit call, request a quote, or start with the smallest useful next step.",
    whyNow: `Fixing this now matters because ${bottleneck.toLowerCase()}.`,
  };
}

export function buildStrategyMap(result: LaunchPadResult | null) {
  const nextMove = result?.nextMove ?? "Complete the LaunchPad Diagnostic so the command center can choose the first objective.";

  return {
    objective: nextMove,
    nextSevenDays: [
      "Clarify the offer in one sentence.",
      "Write the primary CTA and the proof point that supports it.",
      "Create one piece of authority content tied to the customer problem.",
    ],
    nextThirtyDays: [
      "Build a repeatable weekly content and follow-up rhythm.",
      "Prepare one lead magnet, offer page section, or campaign asset.",
      "Review lead response, objections, and conversion notes every week.",
    ],
    missingAssets: ["Offer stack", "Authority hook", "Follow-up script", "Simple campaign brief"],
    channelReadiness: "Prepare the foundation first, then choose the channel for takeoff.",
  };
}

export function buildAdvisorNextAction(result: LaunchPadResult | null) {
  const diagnosis = result?.biggestBottleneck ?? "The marketing foundation is not scored yet.";
  const action = result?.nextMove ?? "Run the LaunchPad Diagnostic and use the first result to build your offer starter.";

  return {
    diagnosis,
    action,
    why: "The next move should remove the bottleneck before more channel activity adds noise.",
    steps: [
      "Write the customer problem in plain language.",
      "Connect the offer to the outcome the customer wants.",
      "Add proof or a risk reducer near the CTA.",
      "Create one content asset that explains why this problem matters.",
    ],
    asset: "Starter offer stack plus one authority content hook.",
    next: "Move into the Content Engine after the offer is clear enough to explain.",
  };
}

export function buildToolRecommendations(result: LaunchPadResult | null) {
  const bottleneck = result?.biggestBottleneck ?? "";
  const leadSource = result?.answers.leadSource ?? "";
  const industry = getIndustryProfile(result?.answers.industryCategory);
  const needsFollowUp = bottleneck.toLowerCase().includes("follow-up");

  if (needsFollowUp) {
    return ["CRM or booking workflow", "Email/SMS follow-up sequence", `Proof asset: ${industry.proof}`];
  }

  if (leadSource === "search") {
    return [industry.channels[0], "Website conversion improvements", `Lead magnet: ${industry.leadMagnets[0]}`];
  }

  if (leadSource === "ads") {
    return ["Landing page offer stack", "Lead capture and follow-up workflow", `Objection reducer: ${industry.objections[0]}`];
  }

  return [industry.channels[0], `Lead magnet: ${industry.leadMagnets[0]}`, "Referral partner profile"];
}

export function buildMessageStarter(result: LaunchPadResult | null) {
  const business = result?.businessName ?? "Your business";
  const target = result?.answers.targetCustomer || "best-fit customers";
  const problem = result?.answers.urgentProblem || "the urgent problem they need solved";
  const outcome = result?.customerDesiredOutcome || "a better result";
  const proof = result?.answers.trustFactor || getIndustryProfile(result?.answers.industryCategory).proof;

  return {
    headline: `${business} helps ${target} solve ${problem} and move toward ${outcome}.`,
    elevatorPitch: `We help ${target} who are dealing with ${problem}. The first step is simple: clarify the situation, recommend the next move, and make it easier to take action with confidence.`,
    proofPoints: [proof, "Clear next step", "Simple explanation of who the offer is best for"],
    scripts: [
      `Opening line: If ${problem.toLowerCase()} is slowing you down, here is the first thing to fix.`,
      `CTA line: Start with a quick fit conversation so we can recommend the right next step.`,
      `Follow-up line: The reason I am reaching back out is that the next step is still small, but the delay can get expensive.`,
    ],
    nextSteps: ["Replace vague homepage copy with the headline.", "Put one proof point near the CTA.", "Use the follow-up line for leads who do not respond."],
  };
}

export function buildMarketingSchedule(result: LaunchPadResult | null) {
  const action = result?.nextMove ?? "Complete the LaunchPad Diagnostic and choose the first foundation asset to build.";

  return {
    weeklyFocus: action,
    rhythm: [
      "Monday: choose one customer pain and one offer angle.",
      "Tuesday: draft one authority post, one short-form hook, and one email angle.",
      "Wednesday: refine the CTA, proof point, and follow-up script.",
      "Thursday: publish or prepare the highest-confidence asset for the chosen channel.",
      "Friday: review leads, objections, replies, and what to improve next week.",
    ],
    campaignPrep: ["Offer headline", "ICP pain statement", "Proof point", "Lead magnet or CTA", "Follow-up script"],
    reviewQuestions: ["What created conversations?", "What objections repeated?", "Where did people hesitate?", "What asset should be improved before more traffic?"],
  };
}

export function buildResearchHub(result: LaunchPadResult | null) {
  const industry = getIndustryProfile(result?.answers.industryCategory);
  const target = result?.answers.targetCustomer || "your best-fit customers";
  const problem = result?.answers.urgentProblem || "their urgent problem";

  return {
    audiencePains: [
      `${target} are trying to solve ${problem}.`,
      `They need enough confidence to act despite ${industry.objections[0]}.`,
      `The trigger usually starts around ${industry.triggers[0]}, which should shape the first message angle.`,
    ],
    competitorQuestions: ["What promise do competitors make first?", "What proof do they use?", "Where is their CTA confusing or weak?", "What objections do they ignore?"],
    positioningAngles: [
      `Position around the trigger: ${industry.triggers[0]}.`,
      `Show why the current alternative is slower or riskier.`,
      `Make the first step feel easier than switching providers or doing nothing.`,
    ],
    faqSeeds: ["How quickly can this help?", "What does it cost?", "Who is this best for?", "What happens after I inquire?", "What proof can I review first?"],
    nextSteps: ["Collect 5 customer phrases.", "Review 3 competitor pages.", "Turn repeated objections into content and sales copy."],
  };
}
