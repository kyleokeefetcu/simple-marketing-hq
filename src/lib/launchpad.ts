export type DiagnosticAnswer = {
  id: string;
  label: string;
  value: string;
};

export type DiagnosticQuestion = {
  id: string;
  eyebrow: string;
  question: string;
  helper: string;
  type: "url" | "text" | "choice";
  inputHint?: string;
  options?: DiagnosticAnswer[];
};

export type LaunchPadResult = {
  businessName: string;
  websiteUrl: string;
  completedAt: string;
  growthScore: number;
  offerStrength: number;
  messagingClarity: string;
  leadFlowGrade: string;
  speedToLeadGrade: string;
  appointmentRisk: string;
  trafficDependencyRisk: string;
  biggestBottleneck: string;
  nextMove: string;
  actionItems: string[];
  websiteFindings: string[];
  answers: Record<string, string>;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "websiteUrl",
    eyebrow: "Step 1",
    question: "What is your business website?",
    helper: "We will use this to create a starter website analysis and confirm what your business sells.",
    type: "url",
    inputHint: "https://yourcompany.com",
  },
  {
    id: "whatSelling",
    eyebrow: "Your offer",
    question: "What are you selling?",
    helper: "Keep it plain. Services, products, appointments, consultations, estimates, or something else.",
    type: "text",
    inputHint: "Roof repair, bookkeeping, coaching, design services...",
  },
  {
    id: "targetCustomer",
    eyebrow: "Your customer",
    question: "Who are you selling to?",
    helper: "Choose the group you most want more of right now.",
    type: "text",
    inputHint: "Homeowners, local businesses, founders, families...",
  },
  {
    id: "customerResult",
    eyebrow: "Customer outcome",
    question: "What result do customers want most?",
    helper: "This helps your LaunchPad Action Plan focus on what buyers actually care about.",
    type: "text",
    inputHint: "More leads, less stress, faster repairs, more booked calls...",
  },
  {
    id: "currentOffer",
    eyebrow: "Current offer",
    question: "How clear is your current offer?",
    helper: "Your offer is the thing people say yes to.",
    type: "choice",
    options: [
      { id: "clear", label: "Very clear", value: "The offer is clear and easy to understand." },
      { id: "somewhat", label: "Somewhat clear", value: "The offer is understandable but could be sharper." },
      { id: "unclear", label: "Not clear yet", value: "The offer needs work." },
    ],
  },
  {
    id: "leadSource",
    eyebrow: "Lead flow",
    question: "How are leads currently coming in?",
    helper: "Pick the main source, even if it is inconsistent.",
    type: "choice",
    options: [
      { id: "referrals", label: "Referrals", value: "referrals" },
      { id: "search", label: "Google or SEO", value: "search" },
      { id: "ads", label: "Paid ads", value: "ads" },
      { id: "social", label: "Social/content", value: "social" },
      { id: "unknown", label: "Not sure", value: "unknown" },
    ],
  },
  {
    id: "leadDropoff",
    eyebrow: "Bottleneck",
    question: "Where are leads falling through?",
    helper: "This is usually where the next highest-leverage move lives.",
    type: "choice",
    options: [
      { id: "traffic", label: "Not enough visitors", value: "traffic" },
      { id: "website", label: "Website does not convert", value: "website" },
      { id: "followup", label: "Follow-up is slow", value: "followup" },
      { id: "appointments", label: "People do not book", value: "appointments" },
      { id: "unknown", label: "I am not sure", value: "unknown" },
    ],
  },
  {
    id: "responseSpeed",
    eyebrow: "Speed to lead",
    question: "How quickly do you respond to new leads?",
    helper: "Fast follow-up is often the simplest way to win more booked calls.",
    type: "choice",
    options: [
      { id: "fast", label: "Under 5 minutes", value: "fast" },
      { id: "sameDay", label: "Same day", value: "sameDay" },
      { id: "nextDay", label: "Next day", value: "nextDay" },
      { id: "inconsistent", label: "It depends", value: "inconsistent" },
    ],
  },
  {
    id: "channels",
    eyebrow: "Channels",
    question: "Which marketing channels are you using now?",
    helper: "Choose the closest fit. Your plan can get more specific later.",
    type: "choice",
    options: [
      { id: "one", label: "One main channel", value: "one" },
      { id: "few", label: "A few channels", value: "few" },
      { id: "many", label: "Too many channels", value: "many" },
      { id: "none", label: "No clear channel", value: "none" },
    ],
  },
];

export const dashboardModules = [
  { slug: "message", title: "Your Message", body: "Offer, headline, positioning, elevator pitch, and scripts." },
  { slug: "customers", title: "Your Customers", body: "Ideal customer, pain points, customer goals, and referral sources." },
  { slug: "website", title: "Your Website", body: "Website diagnosis, CTA review, trust signals, lead capture, visitor intelligence, and follow-up opportunities." },
  { slug: "visibility", title: "Your Visibility", body: "SEO, Google Business Profile, social content, paid ads, and content recommendations." },
  { slug: "referrals", title: "Your Referrals", body: "Referral-ready profile, trusted partner list, shareable introduction details, and referral tracking." },
  { slug: "follow-up", title: "Your Follow-Up", body: "Speed-to-lead, missed opportunities, suggested scripts, and response recommendations." },
  { slug: "momentum", title: "Your Momentum", body: "Weekly traction, check-ins, referrals, repeat visitors, and the next recommended action." },
];

export function buildLaunchPadResult(answers: Record<string, string>): LaunchPadResult {
  const websiteUrl = answers.websiteUrl || "";
  const host = websiteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const businessName = answers.detectedBusinessName || (host ? titleCase(host.split(".")[0].replace(/[-_]/g, " ")) : "Your business");
  const clearOffer = answers.currentOffer?.includes("clear") && !answers.currentOffer?.includes("needs");
  const slowFollowUp = ["nextDay", "inconsistent"].includes(answers.responseSpeed || "");
  const dropoff = answers.leadDropoff || "unknown";
  const trafficRisk = ["referrals", "unknown"].includes(answers.leadSource || "");

  let growthScore = 72;
  if (clearOffer) growthScore += 6;
  if (slowFollowUp) growthScore -= 12;
  if (dropoff === "website") growthScore -= 8;
  if (dropoff === "traffic") growthScore -= 6;
  if (trafficRisk) growthScore -= 5;
  if (answers.channels === "many" || answers.channels === "none") growthScore -= 5;
  growthScore = Math.max(42, Math.min(91, growthScore));

  const biggestBottleneck = getBottleneck(dropoff, slowFollowUp);
  const nextMove = getNextMove(dropoff, slowFollowUp);

  return {
    businessName,
    websiteUrl,
    completedAt: new Date().toISOString(),
    growthScore,
    offerStrength: clearOffer ? 82 : answers.currentOffer?.includes("somewhat") ? 68 : 54,
    messagingClarity: clearOffer ? "B+" : "C",
    leadFlowGrade: dropoff === "traffic" ? "C-" : dropoff === "website" ? "C" : "B-",
    speedToLeadGrade: slowFollowUp ? "C-" : "A-",
    appointmentRisk: dropoff === "appointments" ? "High" : "Moderate",
    trafficDependencyRisk: trafficRisk ? "High" : "Moderate",
    biggestBottleneck,
    nextMove,
    actionItems: [
      nextMove,
      "Add a stronger website call-to-action tied to a specific customer outcome.",
      "Create one simple follow-up script for every new lead this week.",
    ],
    websiteFindings: [
      `Starter analysis detected ${businessName} from the website URL.`,
      answers.websiteAnalysisSummary || "Website review will use your saved URL and diagnostic answers to guide the next action.",
      "Review homepage headline, primary CTA, trust signals, lead capture, SEO basics, and service area.",
    ],
    answers,
  };
}

export function getStoredResult(): LaunchPadResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("simple-marketing-hq:last-result");
  return raw ? (JSON.parse(raw) as LaunchPadResult) : null;
}

export function saveStoredResult(result: LaunchPadResult) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("simple-marketing-hq:last-result", JSON.stringify(result));
}

export function getStopStackIdeas(result: LaunchPadResult | null) {
  const business = result?.businessName ?? "your business";
  const bottleneck = result?.biggestBottleneck ?? "turning interest into booked calls";

  return [
    {
      title: "Short-form video hook",
      idea: `Visual: show a lead notification that never gets answered. Text: "This is where ${business} may be losing booked calls." Statement: "The problem is not always more traffic. Sometimes it is the first five minutes."`,
    },
    {
      title: "Ad opener",
      idea: `Start with the tension: "Before you buy more ads, find the bottleneck." Connect it to ${bottleneck.toLowerCase()} and invite viewers to start the free diagnostic.`,
    },
    {
      title: "Email subject line",
      idea: "Your next lead problem may not be lead volume",
    },
  ];
}

function getBottleneck(dropoff: string, slowFollowUp: boolean) {
  if (slowFollowUp) return "Leads are not getting fast enough follow-up.";
  if (dropoff === "website") return "Your website is not turning interest into action.";
  if (dropoff === "traffic") return "Your business needs a more reliable visibility channel.";
  if (dropoff === "appointments") return "People are showing interest but not booking.";
  return "Your next bottleneck needs clearer tracking and prioritization.";
}

function getNextMove(dropoff: string, slowFollowUp: boolean) {
  if (slowFollowUp) return "Create a five-minute lead response process before adding new campaigns.";
  if (dropoff === "website") return "Strengthen the homepage CTA and add proof near the first conversion point.";
  if (dropoff === "traffic") return "Pick one visibility channel and build a simple weekly publishing or outreach rhythm.";
  if (dropoff === "appointments") return "Rewrite the booking offer so the next step feels easy and low-risk.";
  return "Run one focused diagnostic review and choose a single next marketing move.";
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
