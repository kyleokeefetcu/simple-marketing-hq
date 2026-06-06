"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { LaunchPadResult } from "@/lib/launchpad";

export type SavedDiagnosticSummary = {
  id: string;
  businessName: string;
  websiteUrl: string;
  growthScore: number | null;
  biggestBottleneck: string;
  nextMove: string;
  completedAt: string;
};

type DiagnosticRow = {
  id: string;
  website_url: string | null;
  completed_at: string | null;
  created_at: string;
  summary: {
    businessName?: string;
    growthScore?: number;
    biggestBottleneck?: string;
    nextMove?: string;
  } | null;
};

export async function saveLaunchPadResultToSupabase(
  supabase: SupabaseClient,
  user: User,
  result: LaunchPadResult,
) {
  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
  });

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      name: result.businessName,
      website_url: result.websiteUrl,
      services: result.answers.whatSelling ?? null,
      ideal_customer: result.answers.targetCustomer ?? null,
      description: result.answers.customerResult ?? null,
    })
    .select("id")
    .single();

  if (businessError) throw businessError;

  const { data: diagnostic, error: diagnosticError } = await supabase
    .from("launchpad_diagnostics")
    .insert({
      user_id: user.id,
      business_id: business.id,
      website_url: result.websiteUrl,
      completed_at: result.completedAt,
      summary: {
        businessName: result.businessName,
        growthScore: result.growthScore,
        biggestBottleneck: result.biggestBottleneck,
        nextMove: result.nextMove,
      },
    })
    .select("id")
    .single();

  if (diagnosticError) throw diagnosticError;

  const diagnosticId = diagnostic.id;

  const answerRows = Object.entries(result.answers).map(([questionKey, answerText]) => ({
    diagnostic_id: diagnosticId,
    question_key: questionKey,
    answer_text: answerText,
    answer_json: { value: answerText },
  }));

  const inserts = [
    supabase.from("launchpad_answers").insert(answerRows),
    supabase.from("website_analyses").insert({
      diagnostic_id: diagnosticId,
      business_id: business.id,
      website_url: result.websiteUrl,
      analysis: {
        findings: result.websiteFindings,
        source: "starter-placeholder",
      },
    }),
    supabase.from("launchpad_scores").insert({
      diagnostic_id: diagnosticId,
      growth_score: result.growthScore,
      offer_strength: result.offerStrength,
      messaging_clarity_grade: result.messagingClarity,
      lead_flow_grade: result.leadFlowGrade,
      speed_to_lead_grade: result.speedToLeadGrade,
      appointment_conversion_risk: result.appointmentRisk,
      traffic_dependency_risk: result.trafficDependencyRisk,
    }),
    supabase.from("launchpad_action_plans").insert({
      diagnostic_id: diagnosticId,
      biggest_bottleneck: result.biggestBottleneck,
      highest_leverage_next_move: result.nextMove,
      recommended_growth_path: "Start with the highest-leverage next move, then return for a weekly check-in.",
      action_items: result.actionItems,
    }),
    supabase.from("launchpad_recommendations").insert(
      result.actionItems.map((item, index) => ({
        diagnostic_id: diagnosticId,
        business_id: business.id,
        title: `Action item ${index + 1}`,
        description: item,
        category: "launchpad_action_plan",
        priority: index + 1,
      })),
    ),
  ];

  const responses = await Promise.all(inserts);
  const error = responses.find((response) => response.error)?.error;
  if (error) throw error;

  return diagnosticId;
}

export async function savePendingDiagnosticForUser(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getUser();
  const raw = window.localStorage.getItem("simple-marketing-hq:last-result");
  if (!data.user || !raw) return null;

  const result = JSON.parse(raw) as LaunchPadResult;
  const savedId = await saveLaunchPadResultToSupabase(supabase, data.user, result);
  window.localStorage.setItem("simple-marketing-hq:last-saved-diagnostic-id", savedId);
  return savedId;
}

export async function getSavedDiagnostics(supabase: SupabaseClient): Promise<SavedDiagnosticSummary[]> {
  const { data, error } = await supabase
    .from("launchpad_diagnostics")
    .select("id, website_url, completed_at, created_at, summary")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as DiagnosticRow[]).map((row) => ({
    id: row.id,
    businessName: row.summary?.businessName ?? "Saved business",
    websiteUrl: row.website_url ?? "",
    growthScore: row.summary?.growthScore ?? null,
    biggestBottleneck: row.summary?.biggestBottleneck ?? "No bottleneck saved yet.",
    nextMove: row.summary?.nextMove ?? "Run or update the LaunchPad Diagnostic.",
    completedAt: row.completed_at ?? row.created_at,
  }));
}
