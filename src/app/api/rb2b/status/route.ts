import { NextResponse } from "next/server";
import { getRb2bServerStatus } from "@/lib/rb2b/server";

export function GET() {
  const status = getRb2bServerStatus();

  return NextResponse.json({
    ...status,
    note: "RB2B_API_KEY is server-only and is never returned by this endpoint. Live RB2B API calls are not enabled yet.",
  });
}
