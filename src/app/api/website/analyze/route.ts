import { NextRequest, NextResponse } from "next/server";
import { getIndustryProfile, type WebsiteAnalysisField, type WebsiteAnalysisFieldKey, type WebsiteAnalysisProfile } from "@/lib/launchpad";

const MAX_PAGES = 10;
const MAX_TEXT_PER_PAGE = 9000;
const MAX_TOTAL_TEXT = 45000;
const GENERIC_NAMES = new Set(["home", "homepage", "welcome", "index", "untitled", "main", "start", "landing"]);

const IMPORTANT_PATH_TERMS = [
  "about",
  "how-it-works",
  "howitworks",
  "pricing",
  "services",
  "features",
  "industries",
  "solutions",
  "contact",
  "demo",
  "case-studies",
  "case-studies",
  "testimonials",
  "faq",
];

const CTA_PATTERNS = [
  "book a demo",
  "request a demo",
  "start free",
  "get started",
  "schedule",
  "book",
  "call",
  "contact",
  "get a quote",
  "request",
  "buy",
  "learn more",
  "free consultation",
  "estimate",
  "demo",
];

const LEAD_CAPTURE_PATTERNS = ["form", "book a demo", "request a demo", "schedule", "contact", "quote", "call", "email", "appointment", "consultation", "demo", "chat", "lead"];
const TRUST_PATTERNS = ["review", "reviews", "testimonial", "testimonials", "case study", "case studies", "customer", "customers", "client", "clients", "guarantee", "award", "certified", "licensed", "insured"];

const INDUSTRY_RULES = [
  { value: "saas_software", terms: ["ai voice", "voice assistant", "chatbot", "chat bot", "ai assistant", "website assistant", "visitor intent", "intent scoring", "lead scoring", "software", "platform", "saas", "app", "automation"] },
  { value: "agency", terms: ["agency", "marketing", "design", "branding", "seo", "advertising", "creative"] },
  { value: "b2b_services", terms: ["b2b", "operations", "sales team", "enterprise", "businesses", "managed services", "lead capture"] },
  { value: "home_services", terms: ["roof", "hvac", "plumb", "electric", "remodel", "contractor", "repair", "storm", "flooring", "landscap"] },
  { value: "medical_wellness", terms: ["clinic", "doctor", "dental", "therapy", "wellness", "chiropractic", "patient", "treatment", "health"] },
  { value: "real_estate", terms: ["real estate", "realtor", "property", "homes for sale", "seller", "buyer", "listing"] },
  { value: "professional_services", terms: ["law", "legal", "attorney", "accounting", "tax", "financial", "insurance", "consulting firm"] },
  { value: "restaurant_retail", terms: ["restaurant", "menu", "retail", "shop", "store", "catering", "boutique"] },
  { value: "coaching_consulting", terms: ["coach", "coaching", "consultant", "consulting", "advisor", "training", "workshop"] },
  { value: "creator_course", terms: ["course", "creator", "membership", "newsletter", "community", "lesson"] },
  { value: "ecommerce", terms: ["ecommerce", "product", "cart", "shipping", "returns", "shop now"] },
  { value: "local_service", terms: ["local", "service area", "near me", "appointment", "service"] },
];

type CrawledPage = {
  url: string;
  title: string;
  description: string;
  h1: string;
  headings: string[];
  buttons: string[];
  links: { href: string; text: string }[];
  jsonLd: string;
  text: string;
  html: string;
};

type Candidate = {
  value: string;
  sourceUrl: string;
  evidence: string;
  reason: string;
  score: number;
};

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
    const pages = await crawlWebsite(parsedUrl);
    if (!pages.length) {
      return NextResponse.json(buildFallbackProfile(parsedUrl));
    }

    return NextResponse.json(buildProfile(parsedUrl, pages));
  } catch {
    return NextResponse.json(buildFallbackProfile(parsedUrl));
  }
}

async function crawlWebsite(rootUrl: URL) {
  const homepage = await fetchPage(rootUrl.toString());
  if (!homepage) return [];

  const candidates = new Map<string, number>();
  collectLinks(homepage, rootUrl).forEach((url) => candidates.set(url, scoreImportantUrl(url)));

  const sitemapUrls = await fetchSitemapUrls(rootUrl);
  sitemapUrls.forEach((url) => candidates.set(url, Math.max(candidates.get(url) ?? 0, scoreImportantUrl(url) + 2)));

  const prioritized = [...candidates.entries()]
    .filter(([url]) => isSameDomain(url, rootUrl) && !isPrivateOrAssetUrl(url))
    .sort((a, b) => b[1] - a[1])
    .map(([url]) => url)
    .slice(0, MAX_PAGES - 1);

  const pages: CrawledPage[] = [homepage];
  for (const url of prioritized) {
    if (pages.some((page) => normalizeComparableUrl(page.url) === normalizeComparableUrl(url))) continue;
    const page = await fetchPage(url);
    if (page) pages.push(page);
    if (pages.length >= MAX_PAGES) break;
  }

  let totalLength = 0;
  return pages.map((page) => {
    const allowed = Math.max(0, MAX_TOTAL_TEXT - totalLength);
    const text = page.text.slice(0, Math.min(MAX_TEXT_PER_PAGE, allowed));
    totalLength += text.length;
    return { ...page, text };
  });
}

async function fetchPage(url: string): Promise<CrawledPage | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SimpleMarketingHQBot/1.0 (+https://simplemarketinghq.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(7000),
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("text/html")) return null;

    const html = await response.text();
    return parsePage(url, html);
  } catch {
    return null;
  }
}

async function fetchSitemapUrls(rootUrl: URL) {
  try {
    const sitemapUrl = new URL("/sitemap.xml", rootUrl);
    const response = await fetch(sitemapUrl.toString(), {
      headers: { "User-Agent": "SimpleMarketingHQBot/1.0 (+https://simplemarketinghq.com)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
      .map((match) => cleanText(match[1]))
      .filter((url) => isSameDomain(url, rootUrl))
      .slice(0, 40);
  } catch {
    return [];
  }
}

function buildProfile(parsedUrl: URL, pages: CrawledPage[]): WebsiteAnalysisProfile {
  const pageBundleText = pages.map((page) => [page.title, page.description, page.h1, page.headings.join(" "), page.buttons.join(" "), page.text].join(" ")).join("\n").slice(0, MAX_TOTAL_TEXT);
  const repeatedTerms = extractRepeatedTerms(pageBundleText);
  const businessNameField = fieldFromCandidate("business_name", getBusinessNameCandidate(parsedUrl, pages));
  const industryField = fieldFromCandidate("industry_category", getIndustryCandidate(pageBundleText, pages));
  const servicesField = fieldFromCandidate("services_offers", getServicesCandidate(pageBundleText, pages));
  const serviceAreaField = fieldFromCandidate("service_area", getServiceAreaCandidate(pageBundleText, pages));
  const customerField = fieldFromCandidate("primary_customer", getPrimaryCustomerCandidate(pageBundleText, pages, industryField.value));
  const ctaField = fieldFromCandidate("main_cta", getCtaCandidate(pages));
  const trustField = fieldFromCandidate("trust_proof", getTrustCandidate(pages));
  const leadCaptureField = fieldFromCandidate("lead_capture", getLeadCaptureCandidate(pages));
  const positioningField = fieldFromCandidate("positioning", getPositioningCandidate(pageBundleText, pages));
  const messagingField = fieldFromCandidate("messaging_summary", getMessagingCandidate(pageBundleText, pages, businessNameField.value));
  const pagesField = fieldFromCandidate("pages_analyzed", {
    value: pages.map((page) => page.url).join(", "),
    sourceUrl: parsedUrl.toString(),
    evidence: `${pages.length} public same-domain page${pages.length === 1 ? "" : "s"} analyzed.`,
    reason: "Crawler fetched the homepage plus prioritized same-domain pages from links and sitemap.xml when available.",
    score: pages.length > 1 ? 92 : 76,
  });
  const extractedFields: Partial<Record<WebsiteAnalysisFieldKey, WebsiteAnalysisField>> = {
    business_name: businessNameField,
    industry_category: industryField,
    services_offers: servicesField,
    service_area: serviceAreaField,
    primary_customer: customerField,
    main_cta: ctaField,
    trust_proof: trustField,
    lead_capture: leadCaptureField,
    positioning: positioningField,
    messaging_summary: messagingField,
    pages_analyzed: pagesField,
  };
  const lowConfidenceCount = Object.values(extractedFields).filter((field) => field.confidence === "low" || !field.value).length;
  const extractionQuality = lowConfidenceCount >= 5 ? "low" : lowConfidenceCount >= 3 ? "medium" : "high";
  const industryCategory = industryField.value && industryField.confidence !== "low" ? industryField.value : "";
  const industry = getIndustryProfile(industryCategory);
  const industryLabel = industryCategory ? getSpecificIndustryLabel(industryCategory, pageBundleText) || industry.label : "";
  const businessName = displayableValue(businessNameField);
  const services = displayableValue(servicesField);
  const summary = messagingField.confidence === "low" ? "We could not confidently summarize the website yet. Please confirm the missing fields." : messagingField.value;

  return {
    websiteUrl: parsedUrl.toString(),
    readable: true,
    businessName,
    industryCategory,
    industryLabel,
    services,
    serviceArea: displayableValue(serviceAreaField),
    primaryCustomer: displayableValue(customerField),
    primaryCta: displayableValue(ctaField),
    trustSignals: trustField.confidence === "low" ? "We did not find strong proof yet." : displayableValue(trustField),
    leadCapture: displayableValue(leadCaptureField),
    messagingClarityNotes: displayableValue(messagingField),
    homepageHeadline: pages[0]?.h1 || pages[0]?.title || "",
    summary,
    findings: buildFindings(extractedFields, repeatedTerms),
    extractionQuality,
    qualityWarning: extractionQuality === "low" || extractionQuality === "medium" ? "We could not confidently read everything from your website. We will ask a few quick questions to fill the gaps." : "",
    pagesAnalyzed: pages.map((page) => page.url),
    extractedFields,
  };
}

function buildFallbackProfile(parsedUrl: URL): WebsiteAnalysisProfile {
  const fields = {
    business_name: fieldFromCandidate("business_name", {
      value: "",
      sourceUrl: parsedUrl.toString(),
      evidence: "Website could not be read.",
      reason: "No readable public page was available during the crawl.",
      score: 0,
    }),
  };

  return {
    websiteUrl: parsedUrl.toString(),
    readable: false,
    businessName: "",
    industryCategory: "",
    industryLabel: "",
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
    extractionQuality: "low",
    qualityWarning: "We could not confidently read everything from your website. We will ask a few quick questions to fill the gaps.",
    pagesAnalyzed: [],
    extractedFields: fields,
  };
}

function parsePage(url: string, html: string): CrawledPage {
  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => cleanText(match[1]));
  return {
    url,
    title: getTagContent(html, "title"),
    description: getMetaContent(html, "description") || getMetaProperty(html, "og:description"),
    h1: getHeading(html, "h1")[0] ?? "",
    headings: [...getHeading(html, "h1"), ...getHeading(html, "h2"), ...getHeading(html, "h3")].slice(0, 30),
    buttons: getButtonTexts(html),
    links: getLinks(html, url),
    jsonLd: jsonLdBlocks.join(" "),
    text: stripHtml(html),
    html,
  };
}

function getBusinessNameCandidate(parsedUrl: URL, pages: CrawledPage[]): Candidate {
  const homepage = pages[0];
  const candidates: Candidate[] = [];
  const addCandidate = (value: string, sourceUrl: string, evidence: string, reason: string, score: number) => {
    const cleaned = cleanBusinessName(value);
    if (!cleaned || isGenericBusinessName(cleaned)) return;
    candidates.push({ value: cleaned, sourceUrl, evidence: truncateEvidence(evidence), reason, score });
  };

  pages.forEach((page) => {
    getJsonLdNames(page.jsonLd).forEach((name) => addCandidate(name, page.url, name, "Structured data Organization.name or WebSite.name.", 96));
    getImageAltCandidates(page.html).forEach((alt) => addCandidate(alt, page.url, alt, "Logo/image alt text looked like a brand name.", 88));
    const ogSiteName = getMetaProperty(page.html, "og:site_name");
    addCandidate(ogSiteName, page.url, ogSiteName, "Open Graph site_name metadata.", 92);
  });

  addCandidate(homepage?.title?.split(/[|–—-]/)[0] ?? "", homepage?.url ?? parsedUrl.toString(), homepage?.title ?? "", "Homepage title before separator.", 58);
  const domainName = domainToBrand(parsedUrl.hostname);
  addCandidate(domainName, parsedUrl.toString(), parsedUrl.hostname, "Domain name fallback.", domainName ? 68 : 0);

  const repeated = mostRepeatedBrandCandidate(pages);
  addCandidate(repeated, parsedUrl.toString(), repeated, "Repeated brand phrase across crawled pages.", 86);

  return candidates.sort((a, b) => b.score - a.score)[0] ?? {
    value: "",
    sourceUrl: parsedUrl.toString(),
    evidence: "No high-confidence brand evidence found.",
    reason: "Generic page titles were rejected.",
    score: 0,
  };
}

function getIndustryCandidate(text: string, pages: CrawledPage[]): Candidate {
  const lower = text.toLowerCase();
  const scored = INDUSTRY_RULES.map((rule) => ({
    rule,
    matches: rule.terms.filter((term) => lower.includes(term)),
  }))
    .filter((entry) => entry.matches.length)
    .sort((a, b) => b.matches.length - a.matches.length);

  const best = scored[0];
  if (!best) return lowCandidate("No clear category language found.", pages[0]?.url);

  const evidence = best.matches.slice(0, 5).join(", ");
  const score = best.matches.length >= 3 ? 90 : best.matches.length === 2 ? 76 : 54;
  return {
    value: best.rule.value,
    sourceUrl: findPageWithText(pages, best.matches[0])?.url ?? pages[0]?.url ?? "",
    evidence,
    reason: "Category selected from repeated product/service language across analyzed pages.",
    score,
  };
}

function getServicesCandidate(text: string, pages: CrawledPage[]): Candidate {
  const strongSentences = sentenceCandidates(text).filter((sentence) => /help|helps|assistant|chatbot|voice|lead|visitor|answer|score|capture|software|platform|service|offer|provide|build|automate/i.test(sentence));
  const best = strongSentences.find((sentence) => /visitor|lead|assistant|chatbot|voice|answer|intent/i.test(sentence)) ?? strongSentences[0];
  if (!best) return lowCandidate("No clear service or product sentence found.", pages[0]?.url);

  return {
    value: best,
    sourceUrl: findPageWithText(pages, best)?.url ?? pages[0]?.url ?? "",
    evidence: best,
    reason: "Selected a concrete sentence describing what the business sells or helps customers do.",
    score: /visitor|lead|assistant|chatbot|voice|answer|intent/i.test(best) ? 88 : 68,
  };
}

function getServiceAreaCandidate(text: string, pages: CrawledPage[]): Candidate {
  const matches = text.match(/\b(?:serving|service area|located in|based in)\s+([A-Z][A-Za-z\s,]+)\b/g) ?? [];
  const cityStateMatches = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s?[A-Z]{2}\b/g) ?? [];
  const value = [...new Set([...matches, ...cityStateMatches])].slice(0, 3).join(", ");
  if (!value) return lowCandidate("No service area or location language found.", pages[0]?.url);
  return {
    value,
    sourceUrl: findPageWithText(pages, value.split(",")[0])?.url ?? pages[0]?.url ?? "",
    evidence: value,
    reason: "Location/service-area language appeared in the crawled text.",
    score: matches.length ? 86 : 64,
  };
}

function getPrimaryCustomerCandidate(text: string, pages: CrawledPage[], industryCategory: string): Candidate {
  const sentences = sentenceCandidates(text);
  const explicit = sentences.find((sentence) => /for businesses|for business owners|for teams|for website visitors|customers|visitors|leads|sales teams/i.test(sentence));
  if (explicit) {
    return {
      value: explicit,
      sourceUrl: findPageWithText(pages, explicit)?.url ?? pages[0]?.url ?? "",
      evidence: explicit,
      reason: "Customer language was explicitly present in page copy.",
      score: /for businesses|business owners|sales teams/i.test(explicit) ? 84 : 70,
    };
  }

  if (industryCategory === "saas_software") {
    return {
      value: "Businesses that want website visitors to get answers faster and convert into leads.",
      sourceUrl: pages[0]?.url ?? "",
      evidence: "Inferred from software/assistant/lead-capture language.",
      reason: "Industry and product terms point to a business website conversion use case, but this still needs confirmation.",
      score: 62,
    };
  }

  return lowCandidate("No clear primary customer language found.", pages[0]?.url);
}

function getCtaCandidate(pages: CrawledPage[]): Candidate {
  const matches = pages.flatMap((page) =>
    page.buttons
      .filter((button) => CTA_PATTERNS.some((pattern) => button.toLowerCase().includes(pattern)))
      .map((button) => ({ page, button })),
  );
  const match = matches[0];
  if (!match) return lowCandidate("No clear call-to-action button or link found.", pages[0]?.url);
  return {
    value: match.button,
    sourceUrl: match.page.url,
    evidence: match.button,
    reason: "CTA text appeared in a button or prominent link.",
    score: 86,
  };
}

function getTrustCandidate(pages: CrawledPage[]): Candidate {
  const matches = pages.flatMap((page) => TRUST_PATTERNS.filter((pattern) => page.text.toLowerCase().includes(pattern)).map((pattern) => ({ page, pattern })));
  if (!matches.length) {
    return {
      value: "We did not find strong proof yet.",
      sourceUrl: pages[0]?.url ?? "",
      evidence: "No explicit reviews, testimonials, case studies, customer proof, certifications, licensing, or similar proof language found.",
      reason: "Trust/proof is only reported when explicit proof terms appear.",
      score: 30,
    };
  }
  const unique = [...new Set(matches.map((match) => titleCase(match.pattern)))].slice(0, 5);
  return {
    value: unique.join(", "),
    sourceUrl: matches[0].page.url,
    evidence: unique.join(", "),
    reason: "Explicit proof/trust terms appeared in crawled text.",
    score: unique.some((value) => /Licensed|Insured|Certified/.test(value)) ? 86 : 72,
  };
}

function getLeadCaptureCandidate(pages: CrawledPage[]): Candidate {
  const buttons = pages.flatMap((page) => page.buttons.map((button) => ({ page, button })));
  const matches = buttons.filter(({ button }) => LEAD_CAPTURE_PATTERNS.some((pattern) => button.toLowerCase().includes(pattern)));
  if (!matches.length) return lowCandidate("No clear lead capture method found.", pages[0]?.url);
  const unique = [...new Set(matches.map((match) => match.button))].slice(0, 4);
  return {
    value: unique.join(", "),
    sourceUrl: matches[0].page.url,
    evidence: unique.join(", "),
    reason: "Lead-capture language appeared in buttons or prominent links.",
    score: 82,
  };
}

function getPositioningCandidate(text: string, pages: CrawledPage[]): Candidate {
  const best = sentenceCandidates(text).find((sentence) => /helps|help|built for|designed for|so you can|without/i.test(sentence));
  if (!best) return lowCandidate("No clear positioning statement found.", pages[0]?.url);
  return {
    value: best,
    sourceUrl: findPageWithText(pages, best)?.url ?? pages[0]?.url ?? "",
    evidence: best,
    reason: "Positioning sentence found in public page copy.",
    score: 78,
  };
}

function getMessagingCandidate(text: string, pages: CrawledPage[], businessName: string): Candidate {
  const service = getServicesCandidate(text, pages);
  if (!service.value || service.score < 50) return lowCandidate("No specific messaging summary could be created from evidence.", pages[0]?.url);
  const name = businessName || "This business";
  const value = `${name} appears to ${lowercaseFirst(service.value).replace(/\.$/, "")}.`;
  return {
    value,
    sourceUrl: service.sourceUrl,
    evidence: service.evidence,
    reason: "Summary built from the strongest service/product evidence found.",
    score: Math.min(86, service.score),
  };
}

function getSpecificIndustryLabel(industryCategory: string, text: string) {
  const lower = text.toLowerCase();
  if (industryCategory === "saas_software" && /website assistant|chatbot|chat bot|ai assistant|voice assistant|visitor intent|lead capture|lead scoring|intent scoring/.test(lower)) {
    return "AI website assistant / conversational lead capture";
  }
  return "";
}

function fieldFromCandidate(fieldName: WebsiteAnalysisFieldKey, candidate: Candidate): WebsiteAnalysisField {
  const evidence = candidate.evidence;
  return {
    field_name: fieldName,
    value: candidate.score < 45 ? "" : candidate.value,
    confidence: candidate.score >= 80 ? "high" : candidate.score >= 60 ? "medium" : "low",
    source_url: candidate.sourceUrl,
    source_text_snippet: evidence,
    source_evidence: evidence,
    extraction_reason: `${fieldName}: ${candidate.reason}`,
  };
}

function displayableValue(field: WebsiteAnalysisField) {
  return field.confidence === "low" ? "" : field.value;
}

function buildFindings(fields: Partial<Record<WebsiteAnalysisFieldKey, WebsiteAnalysisField>>, repeatedTerms: string[]) {
  const findings = Object.entries(fields)
    .filter(([key]) => key !== "pages_analyzed")
    .map(([key, field]) => {
      if (!field || field.confidence === "low" || !field.value) return `${humanizeFieldKey(key)}: We could not confirm this yet.`;
      const confirm = field.confidence === "medium" ? " Please confirm." : "";
      return `${humanizeFieldKey(key)}: ${field.value}.${confirm}`;
    });
  if (repeatedTerms.length) findings.push(`Repeated terms found: ${repeatedTerms.join(", ")}.`);
  return findings;
}

function collectLinks(page: CrawledPage, rootUrl: URL) {
  return page.links
    .map((link) => {
      try {
        const url = new URL(link.href, rootUrl);
        url.hash = "";
        return url.toString();
      } catch {
        return "";
      }
    })
    .filter(Boolean);
}

function getLinks(html: string, baseUrl: string) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      let href = cleanText(match[1]);
      try {
        href = new URL(href, baseUrl).toString();
      } catch {
        href = "";
      }
      return { href, text: stripHtml(match[2]).slice(0, 120) };
    })
    .filter((link) => link.href);
}

function getButtonTexts(html: string) {
  const buttonTexts = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)].map((match) => stripHtml(match[1]));
  const linkTexts = [...html.matchAll(/<a\b[^>]*href=["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => stripHtml(match[1]));
  const ariaLabels = [...html.matchAll(/<(?:a|button)\b[^>]*(?:aria-label|title)=["']([^"']+)["'][^>]*>/gi)].map((match) => cleanText(match[1]));
  return [...new Set([...buttonTexts, ...linkTexts, ...ariaLabels].map(cleanText).filter((value) => value.length >= 2 && value.length <= 80))].slice(0, 80);
}

function getHeading(html: string, tag: "h1" | "h2" | "h3") {
  return [...html.matchAll(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "gis"))].map((match) => stripHtml(match[1])).filter(Boolean).slice(0, 12);
}

function getTagContent(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "is"));
  return match ? cleanText(stripHtml(match[1])) : "";
}

function getMetaContent(html: string, name: string) {
  const match = html.match(new RegExp(`<meta[^>]+name=["']${escapeRegExp(name)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i")) ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegExp(name)}["'][^>]*>`, "i"));
  return match ? cleanText(match[1]) : "";
}

function getMetaProperty(html: string, property: string) {
  const match = html.match(new RegExp(`<meta[^>]+property=["']${escapeRegExp(property)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i")) ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapeRegExp(property)}["'][^>]*>`, "i"));
  return match ? cleanText(match[1]) : "";
}

function getImageAltCandidates(html: string) {
  return [...html.matchAll(/<img\b[^>]*(?:alt|aria-label)=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => cleanText(match[1]))
    .filter((value) => /logo|brand|^[A-Z][A-Za-z0-9\s.&-]{2,40}$/.test(value))
    .map((value) => value.replace(/\s+logo$/i, ""));
}

function getJsonLdNames(jsonLd: string) {
  return [...jsonLd.matchAll(/"name"\s*:\s*"([^"]+)"/gi)].map((match) => cleanText(match[1])).filter(Boolean).slice(0, 8);
}

function stripHtml(html: string) {
  return cleanText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function cleanText(value: string) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function cleanBusinessName(value: string) {
  return cleanText(value)
    .replace(/\s+(logo|home|homepage)$/i, "")
    .replace(/^(home|homepage)\s*[-|:]\s*/i, "")
    .replace(/\s*[-|:]\s*(home|homepage)$/i, "")
    .trim();
}

function isGenericBusinessName(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  return GENERIC_NAMES.has(normalized) || normalized.length < 3 || normalized.length > 60;
}

function domainToBrand(hostname: string) {
  const base = hostname.replace(/^www\./, "").split(".")[0] ?? "";
  if (!base || GENERIC_NAMES.has(base.toLowerCase())) return "";
  const talkToMatch = base.match(/^talkto(.+)/i);
  if (talkToMatch?.[1]) return `Talk To ${titleCase(talkToMatch[1].replace(/[-_]/g, " "))}`;
  return titleCase(base.replace(/[-_]/g, " ").replace(/\bai\b/i, "").trim());
}

function mostRepeatedBrandCandidate(pages: CrawledPage[]) {
  const text = pages.map((page) => `${page.title} ${page.h1} ${page.headings.join(" ")} ${page.jsonLd}`).join(" ");
  const candidates = [...text.matchAll(/\b[A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){1,3}\b/g)].map((match) => cleanBusinessName(match[0]));
  const counts = new Map<string, number>();
  candidates.forEach((candidate) => {
    if (!isGenericBusinessName(candidate) && !/Privacy Policy|Terms Conditions|All Rights|Get Started|Learn More/i.test(candidate)) {
      counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
    }
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function sentenceCandidates(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\s{2,}/)
    .map(cleanText)
    .filter((sentence) => sentence.length >= 35 && sentence.length <= 240)
    .slice(0, 160);
}

function findPageWithText(pages: CrawledPage[], text: string) {
  const needle = text.toLowerCase().slice(0, 80);
  return pages.find((page) => `${page.title} ${page.description} ${page.h1} ${page.headings.join(" ")} ${page.text}`.toLowerCase().includes(needle));
}

function extractRepeatedTerms(text: string) {
  const terms = ["ai voice assistant", "chatbot", "website assistant", "lead capture", "intent scoring", "visitor intent", "demo", "website visitors"];
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term)).slice(0, 8);
}

function scoreImportantUrl(url: string) {
  const lower = url.toLowerCase();
  const index = IMPORTANT_PATH_TERMS.findIndex((term) => lower.includes(term));
  return index === -1 ? 1 : 100 - index;
}

function isSameDomain(url: string, rootUrl: URL) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "") === rootUrl.hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

function isPrivateOrAssetUrl(url: string) {
  return /\/(login|signin|sign-in|account|cart|checkout|wp-admin)\b/i.test(url) || /\.(pdf|jpg|jpeg|png|webp|gif|svg|zip|docx?|xlsx?)($|\?)/i.test(url) || url.startsWith("mailto:") || url.startsWith("tel:");
}

function normalizeComparableUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

function lowCandidate(evidence: string, sourceUrl = ""): Candidate {
  return {
    value: "",
    sourceUrl,
    evidence,
    reason: "The crawler did not find enough explicit evidence, so this field should be confirmed manually.",
    score: 0,
  };
}

function truncateEvidence(value: string) {
  return cleanText(value).slice(0, 220);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function lowercaseFirst(value: string) {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function humanizeFieldKey(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
