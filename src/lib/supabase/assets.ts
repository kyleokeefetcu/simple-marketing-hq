"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { PromptRoleId } from "@/lib/ai/prompts/shared-output-rules";

export type MarketingAssetType =
  | "icp"
  | "offer"
  | "message"
  | "content"
  | "strategy_map"
  | "marketing_schedule"
  | "research"
  | "recommendation"
  | "buyer_psychology_audit"
  | "marketing_reality_check"
  | "market_demand_check"
  | "problem_narrative_builder"
  | "problem_narrative"
  | "messaging_sequence_builder"
  | "messaging_sequence"
  | "buyer_messaging_engine"
  | "buyer_messaging_output";

export type MarketingAssetInput = {
  businessId: string;
  roleId: PromptRoleId;
  assetType: MarketingAssetType;
  title: string;
  prompt?: Record<string, unknown>;
  input?: Record<string, unknown>;
  output: Record<string, unknown>;
  summary?: string;
  status?: "draft" | "active" | "archived";
};

export type MarketingAssetSummary = {
  id: string;
  businessId: string;
  roleId: PromptRoleId;
  assetType: MarketingAssetType;
  title: string;
  summary: string;
  status: string;
  output: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AdvisorThreadSummary = {
  id: string;
  businessId: string;
  title: string;
  status: string;
  context: Record<string, unknown>;
  messages: AdvisorMessageSummary[];
  createdAt: string;
  updatedAt: string;
};

export type AdvisorMessageSummary = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type MarketingAssetRow = {
  id: string;
  business_id: string;
  role_id: PromptRoleId;
  asset_type: MarketingAssetType;
  title: string;
  summary: string | null;
  status: string;
  output: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type AdvisorThreadRow = {
  id: string;
  business_id: string;
  title: string;
  status: string;
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type AdvisorMessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function saveMarketingAsset(supabase: SupabaseClient, user: User, input: MarketingAssetInput) {
  await ensureProfile(supabase, user);

  const { data, error } = await supabase
    .from("marketing_assets")
    .insert({
      user_id: user.id,
      business_id: input.businessId,
      role_id: input.roleId,
      asset_type: input.assetType,
      title: input.title,
      prompt: input.prompt ?? {},
      input: input.input ?? {},
      output: input.output,
      summary: input.summary ?? null,
      status: input.status ?? "active",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function getMarketingAssets(
  supabase: SupabaseClient,
  businessId: string,
  assetType: MarketingAssetType,
  roleId?: PromptRoleId,
): Promise<MarketingAssetSummary[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return [];

  let query = supabase
    .from("marketing_assets")
    .select("id, business_id, role_id, asset_type, title, summary, status, output, created_at, updated_at")
    .eq("business_id", businessId)
    .eq("user_id", authData.user.id)
    .eq("asset_type", assetType)
    .order("updated_at", { ascending: false });

  if (roleId) query = query.eq("role_id", roleId);

  const { data, error } = await query;

  if (error) throw error;

  return ((data ?? []) as MarketingAssetRow[]).map((row) => ({
    id: row.id,
    businessId: row.business_id,
    roleId: row.role_id,
    assetType: row.asset_type,
    title: row.title,
    summary: row.summary ?? "",
    status: row.status,
    output: row.output ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveAdvisorThread(
  supabase: SupabaseClient,
  user: User,
  input: {
    businessId: string;
    title: string;
    question: string;
    answer: string;
    context: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  },
) {
  await ensureProfile(supabase, user);

  const { data: thread, error: threadError } = await supabase
    .from("advisor_threads")
    .insert({
      user_id: user.id,
      business_id: input.businessId,
      title: input.title,
      context: input.context,
    })
    .select("id")
    .single();

  if (threadError) throw threadError;

  const threadId = thread.id as string;
  const { error: messageError } = await supabase.from("advisor_messages").insert([
    {
      thread_id: threadId,
      user_id: user.id,
      business_id: input.businessId,
      role: "user",
      content: input.question,
      metadata: input.metadata ?? {},
    },
    {
      thread_id: threadId,
      user_id: user.id,
      business_id: input.businessId,
      role: "assistant",
      content: input.answer,
      metadata: input.metadata ?? {},
    },
  ]);

  if (messageError) throw messageError;
  return threadId;
}

export async function getAdvisorThreads(supabase: SupabaseClient, businessId: string): Promise<AdvisorThreadSummary[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return [];

  const { data: threads, error: threadError } = await supabase
    .from("advisor_threads")
    .select("id, business_id, title, status, context, created_at, updated_at")
    .eq("business_id", businessId)
    .eq("user_id", authData.user.id)
    .order("updated_at", { ascending: false });

  if (threadError) throw threadError;

  const rows = (threads ?? []) as AdvisorThreadRow[];
  if (!rows.length) return [];

  const threadIds = rows.map((thread) => thread.id);
  const { data: messages, error: messageError } = await supabase
    .from("advisor_messages")
    .select("id, thread_id, role, content, metadata, created_at")
    .in("thread_id", threadIds)
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: true });

  if (messageError) throw messageError;

  const messagesByThread = new Map<string, AdvisorMessageSummary[]>();
  (messages ?? []).forEach((message) => {
    const row = message as AdvisorMessageRow & { thread_id: string };
    const list = messagesByThread.get(row.thread_id) ?? [];
    list.push({
      id: row.id,
      role: row.role,
      content: row.content,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    });
    messagesByThread.set(row.thread_id, list);
  });

  return rows.map((thread) => ({
    id: thread.id,
    businessId: thread.business_id,
    title: thread.title,
    status: thread.status,
    context: thread.context ?? {},
    messages: messagesByThread.get(thread.id) ?? [],
    createdAt: thread.created_at,
    updatedAt: thread.updated_at,
  }));
}

async function ensureProfile(supabase: SupabaseClient, user: User) {
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
  });

  if (error) throw error;
}
