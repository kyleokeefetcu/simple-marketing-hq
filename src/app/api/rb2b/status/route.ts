import { NextResponse } from "next/server";
import { getRb2bServerStatus } from "@/lib/rb2b/server";

export function GET() {
  const status = getRb2bServerStatus();

  return NextResponse.json({
    ...status,
    note: "RB2B_API_KEY is server-only and is never returned by this endpoint. NEXT_PUBLIC_RB2B_SCRIPT_ID is only for Simple Marketing HQ site tracking. Customer website tracking and live RB2B API calls are not enabled yet.",
  });
}
