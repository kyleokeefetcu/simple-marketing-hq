export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openAiApiKey: process.env.OPENAI_API_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://simplemarketinghq.com",
  rb2bScriptId: process.env.NEXT_PUBLIC_RB2B_SCRIPT_ID,
};
