import Script from "next/script";
import { env } from "@/lib/env";

export function Rb2bTracking() {
  if (!env.rb2bScriptId) {
    return null;
  }

  return (
    <Script
      id="rb2b-tracking"
      src={`https://cdn.rb2b.com/${env.rb2bScriptId}.js`}
      strategy="afterInteractive"
    />
  );
}
