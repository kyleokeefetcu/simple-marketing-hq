import "server-only";

export type Rb2bServerStatus = {
  apiKeyConfigured: boolean;
  scriptIdConfigured: boolean;
  browserScriptEnabled: boolean;
  simpleMarketingHqSiteTrackingOnly: boolean;
  customerWebsiteTrackingEnabled: false;
  liveApiCallsEnabled: false;
};

export function getRb2bServerStatus(): Rb2bServerStatus {
  return {
    apiKeyConfigured: Boolean(process.env.RB2B_API_KEY),
    scriptIdConfigured: Boolean(process.env.NEXT_PUBLIC_RB2B_SCRIPT_ID),
    browserScriptEnabled: Boolean(process.env.NEXT_PUBLIC_RB2B_SCRIPT_ID),
    simpleMarketingHqSiteTrackingOnly: true,
    customerWebsiteTrackingEnabled: false,
    liveApiCallsEnabled: false,
  };
}

export function assertRb2bApiReady() {
  if (!process.env.RB2B_API_KEY) {
    throw new Error("RB2B_API_KEY is not configured.");
  }
}

export async function prepareRb2bVisitorIntelligenceRequest() {
  assertRb2bApiReady();

  return {
    enabled: false,
    message: "RB2B API key is configured server-side, but live RB2B API calls and customer website tracking are intentionally disabled until the partner/OEM flow is approved.",
  };
}
