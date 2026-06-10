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

export type WebsiteAnalysisProfile = {
  websiteUrl: string;
  readable: boolean;
  businessName: string;
  industryCategory: string;
  industryLabel: string;
  services: string;
  serviceArea: string;
  primaryCustomer: string;
  primaryCta: string;
  trustSignals: string;
  leadCapture: string;
  messagingClarityNotes: string;
  homepageHeadline: string;
  summary: string;
  findings: string[];
};

export type LaunchPadResult = {
  businessName: string;
  websiteUrl: string;
  completedAt: string;
  growthScore: number;
  offerStrength: number;
  icpClarity: number;
  industryFit: string;
  buyerPainClarity: string;
  urgencyTriggerClarity: string;
  offerToIcpFit: string;
  channelToIcpFit: string;
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
    id: "whatSelling",
    eyebrow: "Fill the gaps",
    question: "What do you most want to sell right now?",
    helper: "Pick the offer, service, product, package, or appointment you want the command center to prioritize.",
    type: "text",
    inputHint: "Roof replacement, bookkeeping cleanup, strategy call, design package...",
  },
  {
    id: "targetCustomer",
    eyebrow: "Fill the gaps",
    question: "Who is the best-fit customer you want more of?",
    helper: "This is about quality, not just audience. Name the customers who are most profitable, easiest to help, or most urgent.",
    type: "text",
    inputHint: "Homeowners in Dallas with storm damage, 10-50 employee law firms, early-stage SaaS founders...",
  },
  {
    id: "customerResult",
    eyebrow: "Fill the gaps",
    question: "What result do customers want most?",
    helper: "This helps your LaunchPad Action Plan focus on what buyers actually care about.",
    type: "text",
    inputHint: "More leads, less stress, faster repairs, more booked calls...",
  },
  {
    id: "marketingFrustration",
    eyebrow: "Fill the gaps",
    question: "What is your biggest marketing frustration right now?",
    helper: "Tell us what feels stuck. We will use this to sharpen the bottleneck and next action.",
    type: "text",
    inputHint: "We get traffic but no calls, referrals are inconsistent, content takes too long...",
  },
  {
    id: "leadSource",
    eyebrow: "Fill the gaps",
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
    eyebrow: "Fill the gaps",
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
    eyebrow: "Fill the gaps",
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
    eyebrow: "Fill the gaps",
    question: "What channel do you want to focus on first?",
    helper: "The command center will prepare the foundation for this channel. You can change it later.",
    type: "choice",
    options: [
      { id: "search", label: "Google / SEO", value: "search" },
      { id: "social", label: "Social content", value: "social" },
      { id: "email", label: "Email / follow-up", value: "email" },
      { id: "ads", label: "Paid ads", value: "ads" },
      { id: "referrals", label: "Referrals", value: "referrals" },
      { id: "not-sure", label: "Not sure yet", value: "none" },
    ],
  },
];

export const dashboardModules = [
  { slug: "message", title: "Your Message", body: "Offer, headline, positioning, authority hooks, elevator pitch, and scripts." },
  { slug: "customers", title: "Your Customers", body: "Audience pains, objections, customer goals, segments, and best referral sources." },
  { slug: "website", title: "Your Website", body: "Conversion readiness, CTA clarity, proof, lead capture, and follow-up opportunities." },
  { slug: "visibility", title: "Your Visibility", body: "Channel readiness, campaign preparation, content themes, and launch order." },
  { slug: "referrals", title: "Your Referrals", body: "Referral-ready profile, trusted partner list, shareable introduction details, and referral tracking." },
  { slug: "follow-up", title: "Your Follow-Up", body: "Speed-to-lead, missed opportunities, suggested scripts, email/SMS assets, and response recommendations." },
  { slug: "momentum", title: "Your Momentum", body: "Weekly traction, check-ins, asset progress, referrals, repeat visitors, and the next recommended action." },
];

export function buildLaunchPadResult(answers: Record<string, string>): LaunchPadResult {
  const websiteUrl = answers.websiteUrl || "";
  const host = websiteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const businessName = answers.businessName || answers.detectedBusinessName || (host ? titleCase(host.split(".")[0].replace(/[-_]/g, " ")) : "Your business");
  const clearOffer =
    (answers.currentOffer?.includes("clear") && !answers.currentOffer?.includes("needs")) ||
    Boolean(answers.whatSelling?.trim() && answers.primaryCta?.trim());
  const hasTarget = Boolean(answers.targetCustomer?.trim());
  const hasProfitableCustomer = Boolean(answers.profitableCustomer?.trim() || answers.primaryCustomer?.trim());
  const hasBadFit = Boolean(answers.hardestCustomer?.trim());
  const hasUrgentProblem = Boolean(answers.urgentProblem?.trim() || answers.marketingFrustration?.trim());
  const hasAlternative = Boolean(answers.currentAlternative?.trim() || answers.leadDropoff?.trim());
  const hasTrust = Boolean(answers.trustFactor?.trim());
  const slowFollowUp = ["nextDay", "inconsistent"].includes(answers.responseSpeed || "");
  const dropoff = answers.leadDropoff || "unknown";
  const trafficRisk = ["referrals", "unknown"].includes(answers.leadSource || "");
  const industryProfile = getIndustryProfile(answers.industryCategory);
  const icpClarity = clampScore(
    42 +
      (hasTarget ? 10 : 0) +
      (hasProfitableCustomer ? 10 : 0) +
      (hasBadFit ? 8 : 0) +
      (hasUrgentProblem ? 12 : 0) +
      (hasAlternative ? 8 : 0) +
      (hasTrust ? 8 : 0) +
      (answers.industryCategory ? 8 : 0),
  );

  let growthScore = 72;
  if (clearOffer) growthScore += 6;
  if (icpClarity >= 80) growthScore += 5;
  if (icpClarity < 60) growthScore -= 8;
  if (!hasUrgentProblem) growthScore -= 5;
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
    icpClarity,
    industryFit: industryProfile.label,
    buyerPainClarity: hasUrgentProblem ? "Strong" : "Needs focus",
    urgencyTriggerClarity: hasUrgentProblem && hasAlternative ? "Clear" : "Needs trigger",
    offerToIcpFit: clearOffer && icpClarity >= 70 ? "Aligned" : "Needs sharper ICP fit",
    channelToIcpFit: getChannelToIcpFit(answers.leadSource, answers.industryCategory),
    messagingClarity: clearOffer ? "B+" : "C",
    leadFlowGrade: dropoff === "traffic" ? "C-" : dropoff === "website" ? "C" : "B-",
    speedToLeadGrade: slowFollowUp ? "C-" : "A-",
    appointmentRisk: dropoff === "appointments" ? "High" : "Moderate",
    trafficDependencyRisk: trafficRisk ? "High" : "Moderate",
    biggestBottleneck,
    nextMove,
    actionItems: [
      nextMove,
      "Tighten your ICP: best-fit customer, bad-fit warning, buying trigger, proof needed, and channel fit.",
      "Build a starter offer stack: outcome, pain, proof, risk reducer, and clear CTA.",
      "Create one authority content asset that explains the customer problem and the next step.",
    ],
    websiteFindings: [
      `Foundation review detected ${businessName} from the website URL.`,
      answers.websiteAnalysisSummary || "Website input will be combined with your diagnostic answers to shape the command center plan.",
      answers.messagingClarityNotes || "Messaging clarity notes will improve as the command center learns from your site and answers.",
      answers.leadCaptureFound ? `Lead capture found: ${answers.leadCaptureFound}.` : "Lead capture needs a closer review.",
      `Industry match: ${industryProfile.label}. Use this to adapt buyer pains, objections, proof, channels, and next actions.`,
      "Review ICP clarity, industry fit, buyer pain, trigger urgency, offer fit, channel fit, proof, lead capture, follow-up, and content consistency.",
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
      idea: `Start with the tension: "Before you launch another channel, fix the foundation." Connect it to ${bottleneck.toLowerCase()} and invite viewers to start the LaunchPad Diagnostic.`,
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

function clampScore(value: number) {
  return Math.max(35, Math.min(95, value));
}

export function getIndustryProfile(industry?: string) {
  const profiles: Record<string, { label: string; channels: string[]; proof: string; objections: string[]; triggers: string[]; leadMagnets: string[] }> = {
    local_service: {
      label: "Local service business",
      channels: ["Google Business Profile", "local SEO", "reviews", "referrals"],
      proof: "reviews, service-area clarity, response speed, and simple booking steps",
      objections: ["price uncertainty", "availability", "trust", "response time"],
      triggers: ["seasonal need", "service failure", "move or life event", "urgent convenience problem"],
      leadMagnets: ["local buyer checklist", "service cost guide", "quick readiness quiz"],
    },
    home_services: {
      label: "Contractor / home services",
      channels: ["Google Business Profile", "local SEO", "before/after content", "referral partners"],
      proof: "before/after photos, reviews, license/insurance notes, and project process clarity",
      objections: ["quality risk", "timeline", "hidden costs", "cleanup or disruption"],
      triggers: ["storm or damage event", "inspection issue", "renovation timeline", "safety concern"],
      leadMagnets: ["repair cost checklist", "storm damage photo guide", "project planning worksheet"],
    },
    medical_wellness: {
      label: "Medical / wellness",
      channels: ["local SEO", "educational content", "reviews", "referrals"],
      proof: "credentials, testimonials, safety/process details, and patient outcomes",
      objections: ["safety", "insurance or cost", "time commitment", "uncertainty about results"],
      triggers: ["new symptom", "life change", "failed previous treatment", "wellness goal deadline"],
      leadMagnets: ["symptom checklist", "treatment options guide", "first-visit prep guide"],
    },
    real_estate: {
      label: "Real estate",
      channels: ["local content", "referrals", "email follow-up", "community visibility"],
      proof: "recent deals, market knowledge, testimonials, and clear process",
      objections: ["timing", "commission/value", "trust", "market uncertainty"],
      triggers: ["moving timeline", "rate change", "family change", "investment opportunity"],
      leadMagnets: ["neighborhood pricing guide", "seller prep checklist", "buyer readiness worksheet"],
    },
    professional_services: {
      label: "Legal / professional services",
      channels: ["SEO", "authority content", "referrals", "consultation funnels"],
      proof: "credentials, case examples, expertise, and clear consultation expectations",
      objections: ["cost", "complexity", "trust", "fear of process"],
      triggers: ["legal deadline", "business risk", "financial event", "compliance concern"],
      leadMagnets: ["risk checklist", "consultation prep guide", "plain-English process map"],
    },
    restaurant_retail: {
      label: "Restaurant / retail",
      channels: ["local social", "Google profile", "offers", "community partnerships"],
      proof: "reviews, photos, availability, experience, and repeat-customer signals",
      objections: ["convenience", "price", "quality consistency", "location"],
      triggers: ["event planning", "gift need", "seasonal offer", "local discovery"],
      leadMagnets: ["local offer", "event/menu guide", "first-visit incentive"],
    },
    b2b_services: {
      label: "B2B services",
      channels: ["authority content", "LinkedIn", "cold email", "partner referrals"],
      proof: "case studies, ROI examples, process clarity, and buyer-specific outcomes",
      objections: ["ROI", "implementation burden", "switching cost", "priority"],
      triggers: ["missed target", "new initiative", "tool/process failure", "budget planning"],
      leadMagnets: ["ROI calculator", "benchmark checklist", "buyer problem teardown"],
    },
    saas_software: {
      label: "SaaS / software",
      channels: ["product-led content", "demos", "email nurture", "paid search"],
      proof: "use cases, integrations, demos, security notes, and customer outcomes",
      objections: ["adoption", "integration", "cost", "switching friction"],
      triggers: ["manual process pain", "team growth", "tool replacement", "reporting gap"],
      leadMagnets: ["workflow audit", "demo checklist", "integration guide"],
    },
    coaching_consulting: {
      label: "Coaching / consulting",
      channels: ["authority content", "webinars", "email", "referrals"],
      proof: "framework clarity, client outcomes, testimonials, and process fit",
      objections: ["credibility", "time", "implementation", "personal fit"],
      triggers: ["stalled progress", "new goal", "accountability need", "role or business transition"],
      leadMagnets: ["self-assessment", "framework worksheet", "90-day plan template"],
    },
    creator_course: {
      label: "Creator / course business",
      channels: ["short-form content", "email list", "webinars", "community"],
      proof: "student wins, curriculum clarity, creator credibility, and previews",
      objections: ["will I use it", "is it relevant", "time", "trust"],
      triggers: ["skill gap", "career goal", "creative project", "deadline or cohort"],
      leadMagnets: ["starter lesson", "resource pack", "challenge or mini-course"],
    },
    agency: {
      label: "Agency",
      channels: ["case studies", "LinkedIn", "cold email", "partner referrals"],
      proof: "portfolio, client outcomes, process, specialization, and reporting clarity",
      objections: ["ROI", "communication", "cost", "fit with internal team"],
      triggers: ["campaign underperformance", "new growth target", "internal capacity gap", "rebrand or launch"],
      leadMagnets: ["audit teardown", "campaign checklist", "growth opportunity report"],
    },
    ecommerce: {
      label: "Ecommerce",
      channels: ["paid social", "SEO", "email/SMS", "creator partnerships"],
      proof: "reviews, product photos, guarantees, shipping/return clarity, and UGC",
      objections: ["quality", "shipping", "returns", "fit or usage"],
      triggers: ["gift need", "replacement need", "seasonal event", "problem with current product"],
      leadMagnets: ["buyer guide", "comparison checklist", "first-order offer"],
    },
  };

  return profiles[industry ?? ""] ?? {
    label: "General small business",
    channels: ["SEO", "referrals", "content", "email follow-up"],
    proof: "reviews, clear process, strong CTA, and specific customer outcomes",
    objections: ["price", "trust", "timing", "unclear next step"],
    triggers: ["urgent pain", "missed opportunity", "life or business change", "deadline"],
    leadMagnets: ["buyer checklist", "problem audit", "quick-start guide"],
  };
}

function getChannelToIcpFit(leadSource?: string, industry?: string) {
  const profile = getIndustryProfile(industry);
  if (!leadSource || leadSource === "unknown" || leadSource === "none") return `Needs channel focus: start with ${profile.channels[0]}.`;
  if (leadSource === "referrals") return "Referral-led fit, but needs a clearer repeatable channel.";
  if (leadSource === "search") return "Search-led fit: strengthen proof, CTA, and local/category intent.";
  if (leadSource === "social") return "Content-led fit: sharpen hooks around buyer pain and trigger events.";
  if (leadSource === "ads") return "Paid-channel fit depends on offer clarity, proof, and follow-up speed.";
  return "Moderate fit: choose one channel based on ICP urgency and proof readiness.";
}
