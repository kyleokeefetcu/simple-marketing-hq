import Script from "next/script";

export function Rb2bTracking() {
  const rb2bScriptId = process.env.NEXT_PUBLIC_RB2B_SCRIPT_ID;

  if (!rb2bScriptId) {
    return null;
  }

  return (
    <Script
      id="rb2b-tracking"
      src={`https://cdn.rb2b.com/${rb2bScriptId}.js`}
      strategy="afterInteractive"
    />
  );
}
