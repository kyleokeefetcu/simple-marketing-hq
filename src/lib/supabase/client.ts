import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createBrowserSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
