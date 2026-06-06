"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { brand } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setEmail(userData.user.email ?? "");
      const { data } = await supabase.from("profiles").select("full_name").eq("id", userData.user.id).maybeSingle();
      setFullName(data?.full_name ?? userData.user.user_metadata?.full_name ?? "");
    }

    void loadProfile();
  }, []);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    const supabase = createBrowserSupabaseClient();

    try {
      if (!supabase) {
        window.localStorage.setItem("simple-marketing-hq:profile", JSON.stringify({ email, fullName }));
        setMessage("Account settings saved.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("Log in before saving account settings.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userData.user.id,
        email: userData.user.email,
        full_name: fullName,
      });

      if (profileError) throw profileError;
      setMessage("Account settings saved.");
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Settings</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">{brand.appName} account settings</h1>
        <form onSubmit={saveSettings} className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            Account email
            <input
              value={email}
              disabled
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
            />
          </label>
          <button disabled={isSaving} className="mt-6 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? "Saving..." : "Save settings"}
          </button>
          {message ? <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
