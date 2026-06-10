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
    id: "websiteUrl",
    eyebrow: "Step 1",
    question: "What is your business website?",
    helper: "We will use this as one input for your marketing foundation review, then confirm the important parts manually.",
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
    id: "industryCategory",
    eyebrow: "Industry match",
    question: "What industry or category best fits your business?",
    helper: "This helps Simple Marketing HQ adapt pains, objections, proof, channels, and next actions to your market.",
    type: "choice",
    options: [
      { id: "local-service", label: "Local service business", value: "local_service" },
      { id: "home-services", label: "Contractor / home services", value: "home_services" },
      { id: "medical", label: "Medical / wellness", value: "medical_wellness" },
      { id: "real-estate", label: "Real estate", value: "real_estate" },
      { id: "professional", label: "Legal / professional services", value: "professional_services" },
      { id: "restaurant", label: "Restaurant / retail", value: "restaurant_retail" },
      { id: "b2b", label: "B2B services", value: "b2b_services" },
      { id: "saas", label: "SaaS / software", value: "saas_software" },
      { id: "coaching", label: "Coaching / consulting", value: "coaching_consulting" },
      { id: "creator", label: "Creator / course business", value: "creator_course" },
      { id: "agency", label: "Agency", value: "agency" },
      { id: "ecommerce", label: "Ecommerce", value: "ecommerce" },
    ],
  },
  {
    id: "targetCustomer",
    eyebrow: "ICP Builder",
    question: "Who is the best-fit customer you want more of?",
    helper: "Name the customer segment, buyer type, company size, budget level, and location or service area if relevant.",
    type: "text",
    inputHint: "Homeowners in Dallas with storm damage, 10-50 employee law firms, early-stage SaaS founders...",
  },
  {
    id: "profitableCustomer",
    eyebrow: "ICP Builder",
    question: "Which customers are most profitable or easiest to help?",
    helper: "This separates best-fit customers from people who only look similar on the surface.",
    type: "text",
    inputHint: "Customers with urgent repairs, funded teams, businesses with an existing website...",
  },
  {
    id: "hardestCustomer",
    eyebrow: "ICP Builder",
    question: "Which customers are hardest to serve or usually a bad fit?",
    helper: "Bad-fit traits help protect your offer, content, and recommendations from chasing the wrong demand.",
    type: "text",
    inputHint: "Price-only shoppers, unclear budgets, people outside our service area...",
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
    id: "urgentProblem",
    eyebrow: "Buyer pain",
    question: "What problem makes your best-fit customer look for help now?",
    helper: "The strongest ICPs have a trigger: something changed, broke, expired, got expensive, or became urgent.",
    type: "text",
    inputHint: "A roof leak after a storm, missed appointments, slow sales pipeline, rising ad costs...",
  },
  {
    id: "currentAlternative",
    eyebrow: "Current alternative",
    question: "What do they usually try before buying from you?",
    helper: "This helps your message beat the workaround, competitor, DIY path, or delay.",
    type: "text",
    inputHint: "DIY fixes, asking friends, hiring a cheaper provider, using spreadsheets...",
  },
  {
    id: "trustFactor",
    eyebrow: "Proof and trust",
    question: "What makes them trust you enough to take the next step?",
    helper: "Proof needs vary by industry: reviews, credentials, case studies, before/after, guarantees, demos, or social proof.",
    type: "text",
    inputHint: "Reviews, certifications, before/after photos, case studies, clear pricing...",
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
  const businessName = answers.detectedBusinessName || (host ? titleCase(host.split(".")[0].replace(/[-_]/g, " ")) : "Your business");
  const clearOffer = answers.currentOffer?.includes("clear") && !answers.currentOffer?.includes("needs");
  const hasTarget = Boolean(answers.targetCustomer?.trim());
  const hasProfitableCustomer = Boolean(answers.profitableCustomer?.trim());
  const hasBadFit = Boolean(answers.hardestCustomer?.trim());
  const hasUrgentProblem = Boolean(answers.urgentProblem?.trim());
  const hasAlternative = Boolean(answers.currentAlternative?.trim());
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
