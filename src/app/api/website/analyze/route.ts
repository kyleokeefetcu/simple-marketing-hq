import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json({
        websiteUrl: parsedUrl.toString(),
        readable: false,
        summary: "We could not read this website automatically, but you can continue by answering the diagnostic questions.",
      });
    }

    const html = await response.text();
    const text = stripHtml(html).slice(0, 7000);
    const title = getTagContent(html, "title");
    const description = getMetaContent(html, "description");
    const ctas = CTA_PATTERNS.filter((pattern) => text.toLowerCase().includes(pattern)).slice(0, 5);
    const likelyBusinessName = title?.split(/[|–-]/)[0]?.trim() || parsedUrl.hostname.replace(/^www\./, "");

    return NextResponse.json({
      websiteUrl: parsedUrl.toString(),
      readable: true,
      businessName: likelyBusinessName,
      title,
      description,
      ctas,
      locationClues: findLocationClues(text),
      summary: buildSummary(likelyBusinessName, description, ctas),
    });
  } catch {
    return NextResponse.json({
      websiteUrl: parsedUrl.toString(),
      readable: false,
      summary: "We could not read this website automatically, but you can continue by answering the diagnostic questions.",
    });
  }
}

function getTagContent(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "is"));
  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
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
  const matches = text.match(/\b[A-Z][a-z]+,\s?[A-Z]{2}\b/g) ?? [];
  return [...new Set(matches)].slice(0, 4);
}

function buildSummary(businessName: string, description: string, ctas: string[]) {
  const ctaText = ctas.length ? `Visible CTA language includes ${ctas.join(", ")}.` : "We did not detect an obvious CTA in the scanned text.";
  const descriptionText = description ? `The page description suggests: ${description}` : "The page description was not available.";
  return `${businessName} was detected from the website. ${descriptionText} ${ctaText}`;
}
