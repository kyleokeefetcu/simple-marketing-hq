import type { LaunchPadResult } from "@/lib/launchpad";

export const commandCenterModules = [
  {
    slug: "diagnostic",
    title: "Diagnostic",
    href: "/diagnostic",
    body: "Start with intake across business, offer, audience, website, leads, sales process, content, follow-up, and goals.",
  },
  {
    slug: "growth-score",
    title: "Growth Score",
    href: "/diagnostic/result",
    body: "Score the marketing foundation across offer clarity, audience clarity, message clarity, conversion readiness, lead capture, follow-up, content, channel readiness, proof, and next-action clarity.",
  },
  {
    slug: "action-plan",
    title: "Action Plan",
    href: "/diagnostic/result",
    body: "Turn the diagnosis into the highest-leverage objective, recommended order of operations, and first execution steps.",
  },
  {
    slug: "offer-builder",
    title: "Offer Builder",
    href: "/offer-builder",
    body: "Shape the dream outcome, customer pain, value stack, speed-to-result, effort reduction, risk reversal, package frame, and CTA.",
  },
  {
    slug: "content-engine",
    title: "Content Engine",
    href: "/content-engine",
    body: "Create authority content, short-form hooks, long-form outlines, lead magnet ideas, email sequences, and campaign assets.",
  },
  {
    slug: "strategy-map",
    title: "Strategy Map",
    href: "/strategy-map",
    body: "Plan the next 7 days, next 30 days, missing assets, channel readiness, and review rhythm.",
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

export function buildOfferStarter(result: LaunchPadResult | null) {
  const business = result?.businessName ?? "Your business";
  const target = result?.answers.targetCustomer || "the customers you want most";
  const outcome = result?.answers.customerResult || "a clearer path to the result they want";
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
  const needsFollowUp = bottleneck.toLowerCase().includes("follow-up");

  if (needsFollowUp) {
    return ["CRM or booking workflow", "Email/SMS follow-up sequence", "Speed-to-lead alerting"];
  }

  if (leadSource === "search") {
    return ["SEO review tool", "Google Business Profile workflow", "Website conversion improvements"];
  }

  if (leadSource === "ads") {
    return ["Ad channel plan", "Landing page offer stack", "Lead capture and follow-up workflow"];
  }

  return ["Content scheduler", "Lead magnet workflow", "Referral partner profile"];
}
