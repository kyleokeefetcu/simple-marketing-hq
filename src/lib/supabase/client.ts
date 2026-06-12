import { createClient } from "@supabase/supabase-js";

function createSupabaseBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createClient(supabaseUrl, supabaseAnonKey);
}

type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

let browserSupabaseClient: BrowserSupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserSupabaseClient) {
    browserSupabaseClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserSupabaseClient;
}
