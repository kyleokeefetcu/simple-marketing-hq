import { NextRequest, NextResponse } from "next/server";
import { getIndustryProfile, type WebsiteAnalysisProfile } from "@/lib/launchpad";

const CTA_PATTERNS = [
  "book",
  "schedule",
  "call",
  "contact",
  "get a quote",
  "request",
  "start",
  "buy",
  "learn more",
  "free consultation",
  "estimate",
  "demo",
];

const LEAD_CAPTURE_PATTERNS = ["form", "book", "schedule", "contact", "quote", "call", "email", "appointment", "consultation", "demo"];
const TRUST_PATTERNS = ["review", "reviews", "testimonial", "testimonials", "licensed", "insured", "certified", "case study", "years", "guarantee", "award"];

const INDUSTRY_RULES = [
  { value: "home_services", terms: ["roof", "hvac", "plumb", "electric", "remodel", "contractor", "repair", "storm", "flooring", "landscap"] },
  { value: "medical_wellness", terms: ["clinic", "doctor", "dental", "therapy", "wellness", "chiropractic", "patient", "treatment", "health"] },
  { value: "real_estate", terms: ["real estate", "realtor", "property", "homes for sale", "seller", "buyer", "listing"] },
  { value: "professional_services", terms: ["law", "legal", "attorney", "accounting", "tax", "financial", "insurance", "consulting firm"] },
  { value: "restaurant_retail", terms: ["restaurant", "menu", "retail", "shop", "store", "catering", "boutique"] },
  { value: "b2b_services", terms: ["b2b", "operations", "sales team", "enterprise", "businesses", "managed services"] },
  { value: "saas_software", terms: ["software", "platform", "saas", "app", "dashboard", "integration", "automation"] },
  { value: "coaching_consulting", terms: ["coach", "coaching", "consultant", "consulting", "advisor", "training", "workshop"] },
  { value: "creator_course", terms: ["course", "creator", "membership", "newsletter", "community", "lesson"] },
  { value: "agency", terms: ["agency", "marketing", "design", "branding", "seo", "advertising", "creative"] },
  { value: "ecommerce", terms: ["ecommerce", "product", "cart", "shipping", "returns", "shop now"] },
  { value: "local_service", terms: ["local", "service area", "near me", "appointment", "service"] },
];

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { websiteUrl?: string } | null;
  const websiteUrl = body?.websiteUrl?.trim();

  if (!websiteUrl) {
    return NextResponse.json({ error: "Website URL is required." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(websiteUrl);
  } catch {
    return NextResponse.json({ error: "Enter a valid URL that starts with http:// or https://." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Website URL must start with http:// or https://." }, { status: 400 });
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "SimpleMarketingHQBot/1.0 (+https://simplemarketinghq.com)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(buildFallbackProfile(parsedUrl));
    }

    const html = await response.text();
    const text = stripHtml(html).slice(0, 9000);
    const textLower = text.toLowerCase();
    const title = getTagContent(html, "title");
    const description = getMetaContent(html, "description");
    const h1 = getHeading(html, "h1");
    const businessName = title?.split(/[|–-]/)[0]?.trim() || h1?.split(/[|–-]/)[0]?.trim() || parsedUrl.hostname.replace(/^www\./, "");
    const industryCategory = inferIndustry(textLower, title, description);
    const industry = getIndustryProfile(industryCategory);
    const ctas = CTA_PATTERNS.filter((pattern) => textLower.includes(pattern)).slice(0, 5);
    const trustSignals = TRUST_PATTERNS.filter((pattern) => textLower.includes(pattern)).slice(0, 5);
    const leadCapture = LEAD_CAPTURE_PATTERNS.filter((pattern) => textLower.includes(pattern)).slice(0, 5);
    const locationClues = findLocationClues(text);
    const services = inferServices(text, description, industry.label);
    const primaryCustomer = inferPrimaryCustomer(industry.label, description);

    const profile: WebsiteAnalysisProfile = {
      websiteUrl: parsedUrl.toString(),
      readable: true,
      businessName,
      industryCategory,
      industryLabel: industry.label,
      services,
      serviceArea: locationClues.join(", "),
      primaryCustomer,
      primaryCta: ctas[0] ? titleCase(ctas[0]) : "No obvious CTA found",
      trustSignals: trustSignals.length ? trustSignals.map(titleCase).join(", ") : "No obvious proof found in the scanned text",
      leadCapture: leadCapture.length ? leadCapture.map(titleCase).join(", ") : "No obvious lead capture found in the scanned text",
      messagingClarityNotes: buildMessagingNotes(Boolean(h1 || description), ctas.length > 0, trustSignals.length > 0),
      homepageHeadline: h1 || title || "",
      summary: buildSummary(businessName, industry.label, services, locationClues),
      findings: [
        `Business detected: ${businessName}.`,
        `Industry match: ${industry.label}.`,
        services ? `Services/offers detected: ${services}.` : "Services/offers need confirmation.",
        ctas.length ? `CTA language detected: ${ctas.join(", ")}.` : "No obvious CTA was detected.",
        trustSignals.length ? `Proof detected: ${trustSignals.join(", ")}.` : "Proof or trust signals need confirmation.",
      ],
    };

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(buildFallbackProfile(parsedUrl));
  }
}

function buildFallbackProfile(parsedUrl: URL): WebsiteAnalysisProfile {
  const businessName = parsedUrl.hostname.replace(/^www\./, "");
  const industry = getIndustryProfile();

  return {
    websiteUrl: parsedUrl.toString(),
    readable: false,
    businessName,
    industryCategory: "",
    industryLabel: industry.label,
    services: "",
    serviceArea: "",
    primaryCustomer: "",
    primaryCta: "",
    trustSignals: "",
    leadCapture: "",
    messagingClarityNotes: "We could not read enough from your website. We will ask a few quick questions instead.",
    homepageHeadline: "",
    summary: "We could not read enough from your website. We will ask a few quick questions instead.",
    findings: ["Website crawl was limited, so the diagnostic will use your quick answers."],
  };
}

function getTagContent(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "is"));
  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function getHeading(html: string, tag: "h1" | "h2") {
  const match = html.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "is"));
  return match ? stripHtml(match[1]).trim() : "";
}

function getMetaContent(html: string, name: string) {
  const match = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"));
  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findLocationClues(text: string) {
  const cityStateMatches = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s?[A-Z]{2}\b/g) ?? [];
  const serviceAreaMatches = text.match(/\b(?:serving|service area|located in)\s+([A-Z][A-Za-z\s,]+)\b/g) ?? [];
  return [...new Set([...cityStateMatches, ...serviceAreaMatches])].slice(0, 4);
}

function inferIndustry(textLower: string, title: string, description: string) {
  const haystack = `${title} ${description} ${textLower}`.toLowerCase();
  const match = INDUSTRY_RULES.find((rule) => rule.terms.some((term) => haystack.includes(term)));
  return match?.value ?? "";
}

function inferServices(text: string, description: string, industryLabel: string) {
  if (description) return description.slice(0, 180);
  const serviceSentence = text
    .split(/(?<=[.!?])\s+/)
    .find((sentence) => /service|offer|help|speciali[sz]e|provide|repair|consult|design|build/i.test(sentence));
  return serviceSentence?.slice(0, 180) || `${industryLabel} services`;
}

function inferPrimaryCustomer(industryLabel: string, description: string) {
  if (/home|roof|contractor|local/i.test(industryLabel)) return "Local customers in the service area";
  if (/B2B|SaaS|Agency|professional/i.test(industryLabel)) return "Businesses that need a clearer path to the result";
  if (/medical|wellness/i.test(industryLabel)) return "Patients or clients looking for trusted help";
  if (/creator|coaching|consulting/i.test(industryLabel)) return "People or teams looking for guidance and implementation support";
  return description ? "Customers described by the website positioning" : "";
}

function buildMessagingNotes(hasPositioning: boolean, hasCta: boolean, hasProof: boolean) {
  const notes = [];
  notes.push(hasPositioning ? "The site gives us a starting message." : "The main message needs confirmation.");
  notes.push(hasCta ? "A call-to-action appears to be present." : "The CTA may need to be clearer.");
  notes.push(hasProof ? "Some proof or trust language appears to be present." : "Proof may need to be stronger near the CTA.");
  return notes.join(" ");
}

function buildSummary(businessName: string, industry: string, services: string, locations: string[]) {
  const locationText = locations.length ? ` serving ${locations.join(", ")}` : "";
  return `We found that ${businessName} appears to be a ${industry.toLowerCase()}${locationText}. ${services ? `The website suggests: ${services}` : "The services need confirmation."}`;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
