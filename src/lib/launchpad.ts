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
  type: "url" | "text" | "choice" | "textarea";
  inputHint?: string;
  options?: DiagnosticAnswer[];
  optional?: boolean;
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
  extractionQuality?: "high" | "medium" | "low";
  qualityWarning?: string;
  pagesAnalyzed?: string[];
  extractedFields?: Partial<Record<WebsiteAnalysisFieldKey, WebsiteAnalysisField>>;
};

export type WebsiteAnalysisFieldKey =
  | "business_name"
  | "industry_category"
  | "services_offers"
  | "service_area"
  | "primary_customer"
  | "main_cta"
  | "trust_proof"
  | "lead_capture"
  | "positioning"
  | "messaging_summary"
  | "pages_analyzed";

export type WebsiteAnalysisField = {
  field_name: WebsiteAnalysisFieldKey;
  value: string;
  confidence: "high" | "medium" | "low";
  source_url: string;
  source_text_snippet: string;
  source_evidence: string;
  extraction_reason: string;
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
  customerDesiredOutcome: string;
  recommendedFirstChannel: string;
  channelRecommendationWhy: string;
  channelPreparationSteps: string[];
  channelToIgnoreForNow: string;
  actionItems: string[];
  websiteFindings: string[];
  answers: Record<string, string>;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "leadSource",
    eyebrow: "Current business info",
    question: "How do customers find you today?",
    helper: "Choose what is currently true. The AI will recommend what to improve.",
    type: "choice",
    options: [
      { id: "search", label: "Google / search", value: "search" },
      { id: "referrals", label: "Referrals", value: "referrals" },
      { id: "website", label: "Website", value: "website" },
      { id: "social", label: "Social media", value: "social" },
      { id: "ads", label: "Paid ads", value: "ads" },
      { id: "email", label: "Email / follow-up", value: "email" },
      { id: "partnerships", label: "Partnerships", value: "partnerships" },
      { id: "local", label: "Walk-ins / local visibility", value: "local_visibility" },
      { id: "unknown", label: "Not sure", value: "unknown" },
      { id: "other", label: "Other", value: "other" },
    ],
  },
  {
    id: "leadDropoff",
    eyebrow: "Current business info",
    question: "Where do leads or sales usually get stuck?",
    helper: "Pick the closest answer. The AI will find the marketing bottleneck.",
    type: "choice",
    options: [
      { id: "traffic", label: "Not enough leads", value: "traffic" },
      { id: "website", label: "Website visitors do not convert", value: "website" },
      { id: "followup", label: "Leads are not followed up fast enough", value: "followup" },
      { id: "qualified", label: "Leads are not qualified", value: "qualified" },
      { id: "offer", label: "Offer is not clear enough", value: "offer" },
      { id: "questions", label: "People ask questions but do not take action", value: "questions" },
      { id: "appointments", label: "We get interest but not enough booked calls/jobs", value: "appointments" },
      { id: "unknown", label: "Not sure", value: "unknown" },
      { id: "other", label: "Other", value: "other" },
    ],
  },
  {
    id: "intakeNotes",
    eyebrow: "Optional",
    question: "Anything important we should know?",
    helper: "Optional. Add notes about customers, offers, services, locations, objections, or goals.",
    type: "textarea",
    inputHint: "Add anything the website may have missed...",
    optional: true,
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

export function buildLaunchPadResult(rawAnswers: Record<string, string>): LaunchPadResult {
  const websiteUrl = rawAnswers.websiteUrl || "";
  const host = websiteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const businessName = rawAnswers.businessName || rawAnswers.detectedBusinessName || (host ? titleCase(host.split(".")[0].replace(/[-_]/g, " ")) : "Your business");
  const answers = prepareLaunchPadAnswers(rawAnswers, businessName);
  const clearOffer =
    (answers.currentOffer?.includes("clear") && !answers.currentOffer?.includes("needs")) ||
    Boolean(answers.whatSelling?.trim() && answers.primaryCta?.trim());
  const hasTarget = Boolean(answers.targetCustomer?.trim());
  const hasProfitableCustomer = Boolean(answers.profitableCustomer?.trim() || answers.primaryCustomer?.trim());
  const hasBadFit = Boolean(answers.hardestCustomer?.trim());
  const hasUrgentProblem = Boolean(answers.urgentProblem?.trim() || answers.marketingFrustration?.trim() || answers.customerWords?.trim() || answers.customerNeedType);
  const hasAlternative = Boolean(answers.currentAlternative?.trim() || answers.leadDropoff?.trim());
  const hasTrust = Boolean(answers.trustFactor?.trim());
  const slowFollowUp = ["nextDay", "inconsistent"].includes(answers.responseSpeed || "") || answers.leadDropoff === "followup";
  const dropoff = answers.leadDropoff || "unknown";
  const trafficRisk = ["referrals", "unknown"].includes(answers.leadSource || "");
  const industryProfile = getIndustryProfile(answers.industryCategory);
  const customerDesiredOutcome = inferCustomerDesiredOutcome(answers);
  const channelRecommendation = recommendFirstChannel(answers, industryProfile);
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
  if (!answers.marketingTried?.trim()) growthScore -= 3;
  if (answers.timePerWeek === "1_hour") growthScore -= 2;
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
    customerDesiredOutcome,
    recommendedFirstChannel: channelRecommendation.channel,
    channelRecommendationWhy: channelRecommendation.why,
    channelPreparationSteps: channelRecommendation.prepareFirst,
    channelToIgnoreForNow: channelRecommendation.ignoreForNow,
    actionItems: [
      nextMove,
      "Confirm the best-fit customer, buying trigger, proof needed, and channel fit.",
      `Shape the offer around what customers likely want most: ${customerDesiredOutcome}.`,
      `Prepare for ${channelRecommendation.channel}: ${channelRecommendation.prepareFirst[0]}.`,
      "Create one authority content asset that explains the customer problem and the next step.",
    ],
    websiteFindings: [
      `Foundation review detected ${businessName} from the website URL.`,
      answers.websiteAnalysisSummary || "Website input will be combined with your diagnostic answers to shape the command center plan.",
      answers.messagingClarityNotes || "Messaging clarity notes will improve as the command center learns from your site and answers.",
      `Likely customer desired outcome: ${customerDesiredOutcome}.`,
      answers.leadCaptureFound ? `Lead capture found: ${answers.leadCaptureFound}.` : "Lead capture needs a closer review.",
      `Recommended first channel to prepare for: ${channelRecommendation.channel}. ${channelRecommendation.why}`,
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

function prepareLaunchPadAnswers(rawAnswers: Record<string, string>, businessName: string): Record<string, string> {
  const answers = { ...rawAnswers };
  const industryProfile = getIndustryProfile(answers.industryCategory);
  const safePrimaryCustomer = sanitizeCustomerProfile(answers.primaryCustomer, answers.whatSelling || answers.services);
  const safeTargetCustomer = sanitizeCustomerProfile(answers.targetCustomer || answers.idealCustomer, answers.whatSelling || answers.services);
  const inferredTarget = safeTargetCustomer || safePrimaryCustomer || inferBestFitCustomer(answers, industryProfile);
  const inferredProblem = inferBuyerProblem(answers);

  return {
    ...answers,
    businessName,
    targetCustomer: inferredTarget,
    primaryCustomer: safePrimaryCustomer || inferredTarget,
    customerWords: answers.customerWords || inferredProblem,
    marketingFrustration: answers.marketingFrustration || getDropoffLabel(answers.leadDropoff),
    customerNeedType: answers.customerNeedType || inferNeedType(answers),
    currentAlternative: answers.currentAlternative || getDropoffLabel(answers.leadDropoff),
    responseSpeed: answers.responseSpeed || (answers.leadDropoff === "followup" ? "inconsistent" : "sameDay"),
    businessModel: answers.businessModel || inferBusinessModel(answers),
    marketingTried: answers.marketingTried || getLeadSourceLabel(answers.leadSource),
    currentOffer: answers.currentOffer || (answers.whatSelling ? "The offer is understandable and ready to tighten." : "The offer needs to be confirmed."),
  };
}

function sanitizeCustomerProfile(value?: string, offer?: string) {
  const cleaned = (value ?? "").trim();
  if (!cleaned) return "";
  const offerText = (offer ?? "").trim().toLowerCase();
  const lower = cleaned.toLowerCase();
  const hasAudienceLanguage = /\b(businesses|companies|owners|teams|agencies|customers|clients|patients|homeowners|contractors|firms|buyers|families|residents|professionals|service businesses)\b/.test(lower);
  const looksLikeOffer = /\b(is the|we provide|we offer|helps|captures|answers|books|automates|software|platform|plugin|agent|assistant|24\/7|text or voice|from approved content)\b/.test(lower);
  if (offerText && (lower === offerText || offerText.includes(lower) || lower.includes(offerText.slice(0, 80)))) return "";
  if (looksLikeOffer && !hasAudienceLanguage) return "";
  return cleaned;
}

function inferBestFitCustomer(answers: Record<string, string>, industryProfile: ReturnType<typeof getIndustryProfile>) {
  const offerText = `${answers.whatSelling ?? ""} ${answers.services ?? ""} ${answers.messagingClarityNotes ?? ""}`.toLowerCase();
  if (/ai|agent|assistant|chatbot|website|visitor|lead|book|voice|approved content|guardrail/.test(offerText)) {
    return "Home service companies, regulated service businesses, and website agencies that rely on inbound website leads and need fast, safe follow-up.";
  }
  if (answers.industryCategory === "home_services") return "Homeowners and property owners who need a reliable service provider and a clear next step.";
  if (answers.industryCategory === "professional_services") return "Business owners and individuals who need expert help, trust, and a clear process before they take action.";
  if (answers.industryCategory === "b2b_services") return "Service businesses with a clear operational problem, budget pressure, and a need for a practical next step.";
  if (answers.industryCategory === "agency") return "Businesses that need better leads, clearer messaging, or stronger marketing execution without adding internal capacity.";
  return `${industryProfile.label} customers who have an urgent problem, need trust before buying, and are ready for a clear next step.`;
}

function inferBuyerProblem(answers: Record<string, string>) {
  const offerText = `${answers.whatSelling ?? ""} ${answers.services ?? ""} ${answers.messagingClarityNotes ?? ""}`.toLowerCase();
  if (/ai|agent|assistant|chatbot|website|visitor|lead|book|voice/.test(offerText)) return "Website visitors have questions, but they leave before getting a clear answer or becoming a lead.";
  if (answers.leadDropoff === "traffic") return "Not enough qualified people are finding the business.";
  if (answers.leadDropoff === "website") return "Website visitors are not taking the next step.";
  if (answers.leadDropoff === "followup") return "Leads go cold before anyone follows up.";
  if (answers.leadDropoff === "qualified") return "The business is spending time on leads that are not a strong fit.";
  if (answers.leadDropoff === "offer") return "People do not quickly understand what they get or why it matters.";
  if (answers.leadDropoff === "questions") return "People have questions, but the answers are not turning into action.";
  if (answers.leadDropoff === "appointments") return "People show interest but do not book the next step.";
  return answers.intakeNotes || "Customers need a clearer reason to trust the business and take the next step.";
}

function inferNeedType(answers: Record<string, string>) {
  if (["traffic", "website", "appointments", "qualified"].includes(answers.leadDropoff || "")) return "more_leads_sales";
  if (answers.leadDropoff === "followup") return "save_time";
  if (answers.leadDropoff === "questions") return "make_easier";
  if (answers.leadDropoff === "offer") return "fix_problem";
  return "not_sure";
}

function inferBusinessModel(answers: Record<string, string>) {
  if (answers.leadSource === "local_visibility" || answers.serviceArea) return "local";
  if (["home_services", "medical_wellness", "real_estate", "restaurant_retail", "local_service"].includes(answers.industryCategory || "")) return "local";
  if (["saas_software", "creator_course", "ecommerce"].includes(answers.industryCategory || "")) return "online";
  return "both";
}

function getLeadSourceLabel(value?: string) {
  const labels: Record<string, string> = {
    search: "Customers currently come from Google or search.",
    referrals: "Customers currently come from referrals.",
    website: "Customers currently come through the website.",
    social: "Customers currently come from social media.",
    ads: "Customers currently come from paid ads.",
    email: "Customers currently come from email or follow-up.",
    partnerships: "Customers currently come from partnerships.",
    local_visibility: "Customers currently come from walk-ins or local visibility.",
    other: "Customers currently come from another source.",
    unknown: "The main customer source is not clear yet.",
  };
  return labels[value ?? ""] ?? "The main customer source is not clear yet.";
}

function getDropoffLabel(value?: string) {
  const labels: Record<string, string> = {
    traffic: "Not enough leads.",
    website: "Website visitors do not convert.",
    followup: "Leads are not followed up fast enough.",
    qualified: "Leads are not qualified.",
    offer: "The offer is not clear enough.",
    questions: "People ask questions but do not take action.",
    appointments: "People show interest but do not book calls or jobs.",
    other: "The lead or sales issue needs more context.",
    unknown: "The lead or sales issue is not clear yet.",
  };
  return labels[value ?? ""] ?? "The lead or sales issue is not clear yet.";
}

function getBottleneck(dropoff: string, slowFollowUp: boolean) {
  if (slowFollowUp) return "Leads are not getting fast enough follow-up.";
  if (dropoff === "website") return "Your website is not turning interest into action.";
  if (dropoff === "traffic") return "Your business needs a more reliable visibility channel.";
  if (dropoff === "appointments") return "People are showing interest but not booking.";
  if (dropoff === "qualified") return "Too many leads are not a strong fit.";
  if (dropoff === "offer") return "The offer is not clear enough yet.";
  if (dropoff === "questions") return "People have questions but do not take action.";
  return "Your next bottleneck needs clearer tracking and prioritization.";
}

function getNextMove(dropoff: string, slowFollowUp: boolean) {
  if (slowFollowUp) return "Create a five-minute lead response process before adding new campaigns.";
  if (dropoff === "website") return "Strengthen the homepage CTA and add proof near the first conversion point.";
  if (dropoff === "traffic") return "Pick one visibility channel and build a simple weekly publishing or outreach rhythm.";
  if (dropoff === "appointments") return "Rewrite the booking offer so the next step feels easy and low-risk.";
  if (dropoff === "qualified") return "Add a simple qualifier before the main booking or contact step.";
  if (dropoff === "offer") return "Rewrite the offer in one clear sentence with one next step.";
  if (dropoff === "questions") return "Answer the top buyer question near the first website CTA.";
  return "Use the website analysis and current answers to choose one clear next marketing move.";
}

function inferCustomerDesiredOutcome(answers: Record<string, string>) {
  const words = `${answers.customerWords ?? ""} ${answers.marketingFrustration ?? ""}`.toLowerCase();
  if (answers.customerNeedType === "save_time" || words.includes("time") || words.includes("fast")) return "a faster path with less wasted time";
  if (answers.customerNeedType === "save_money" || words.includes("cost") || words.includes("expensive")) return "confidence before spending money";
  if (answers.customerNeedType === "more_leads_sales" || words.includes("lead") || words.includes("sales") || words.includes("book")) return "more qualified conversations and booked calls";
  if (answers.customerNeedType === "safer_protected" || words.includes("safe") || words.includes("protect") || words.includes("risk")) return "less risk and more confidence";
  if (answers.customerNeedType === "status_improvement" || words.includes("look") || words.includes("status")) return "a better-looking result they feel proud of";
  if (answers.customerNeedType === "make_easier" || words.includes("easy") || words.includes("confused")) return "a simpler next step with less confusion";
  if (answers.customerNeedType === "fix_problem") return "the problem fixed correctly without extra hassle";
  return "a clear answer, less risk, and a next step they can trust";
}

function recommendFirstChannel(
  answers: Record<string, string>,
  industryProfile: ReturnType<typeof getIndustryProfile>,
) {
  const local = answers.businessModel === "local" || answers.businessModel === "both";
  const leadSource = answers.leadSource || "unknown";
  const tried = (answers.marketingTried || "").toLowerCase();
  const slowFollowUp = ["nextDay", "inconsistent"].includes(answers.responseSpeed || "");

  if (local && (leadSource === "search" || leadSource === "maps" || leadSource === "unknown" || leadSource === "referrals")) {
    return {
      channel: "Google Business Profile + website conversion",
      why: "You serve a local market, customers are likely searching when they have a need, and your offer needs clear proof and a stronger CTA before paid ads or cold outreach.",
      prepareFirst: ["Sharpen offer language", "Define best-fit customer", "Create homepage CTA", "Build follow-up script", "Then deploy through Google, social, or referral activity"],
      ignoreForNow: "Paid ads until the offer, proof, CTA, and follow-up are clearer.",
    };
  }

  if (leadSource === "social" || tried.includes("social")) {
    return {
      channel: "Social content supported by a clear offer",
      why: "Social has already shown up in the current lead path, but it will work better when the message, hook, and next step are sharper.",
      prepareFirst: ["Define the customer pain", "Write a stronger message angle", "Create three proof-backed hooks", "Add a simple CTA", "Follow up with interested leads quickly"],
      ignoreForNow: "Launching more platforms before one content rhythm is working.",
    };
  }

  if (leadSource === "email" || leadSource === "cold_outreach") {
    return {
      channel: "Email or outreach with a tighter ICP and offer",
      why: "Direct outreach needs a specific customer, a clear pain, and a low-friction first step before volume matters.",
      prepareFirst: ["Tighten ICP", "Clarify the problem you solve", "Create one short offer statement", "Write a follow-up script", "Track replies and objections"],
      ignoreForNow: "Broad cold outreach lists before the ICP and offer are specific.",
    };
  }

  if (leadSource === "ads" || tried.includes("ads")) {
    return {
      channel: "Paid ads after offer and conversion cleanup",
      why: "Paid traffic can amplify a working offer, but it gets expensive when proof, CTA, landing page, or follow-up are weak.",
      prepareFirst: ["Clarify the offer", "Create landing page headline and CTA", "Add proof near the conversion point", "Build lead follow-up", "Start with a small test"],
      ignoreForNow: "Scaling ad spend before conversion and follow-up are ready.",
    };
  }

  if (slowFollowUp) {
    return {
      channel: "Follow-up system before new traffic",
      why: "If leads are not answered quickly, more channel activity may create more missed opportunities instead of more booked calls.",
      prepareFirst: ["Create a five-minute response script", "Set the first reply template", "Decide who responds", "Track missed leads", "Then choose the next channel"],
      ignoreForNow: "New traffic campaigns until response speed is fixed.",
    };
  }

  return {
    channel: industryProfile.channels[0],
    why: `Based on the industry/category, current lead source, and foundation readiness, ${industryProfile.channels[0]} is the strongest first channel to prepare for.`,
    prepareFirst: ["Sharpen offer language", "Define best-fit customer", "Create the first message angle", "Add proof near the CTA", "Build a simple follow-up step"],
    ignoreForNow: "Any channel that requires more budget or time than the business can realistically support this week.",
  };
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
  if (leadSource === "search" || leadSource === "maps" || leadSource === "website") return "Search-led fit: strengthen proof, CTA, and local/category intent.";
  if (leadSource === "social") return "Content-led fit: sharpen hooks around buyer pain and trigger events.";
  if (leadSource === "ads") return "Paid-channel fit depends on offer clarity, proof, and follow-up speed.";
  if (leadSource === "email" || leadSource === "cold_outreach") return "Direct-channel fit depends on ICP clarity, offer specificity, and follow-up.";
  if (leadSource === "events") return "Relationship-led fit: capture the referral story, follow-up script, and next-step offer.";
  return "Moderate fit: choose one channel based on ICP urgency and proof readiness.";
}
