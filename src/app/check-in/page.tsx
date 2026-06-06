"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { saveCheckInToSupabase } from "@/lib/supabase/diagnostics";

const fields = [
  ["leads", "How many leads came in?", "number"],
  ["booked", "How many booked calls?", "number"],
  ["objections", "What objections came up?", "text"],
  ["comments", "What customer comments should we learn from?", "text"],
  ["content", "What content performed best?", "text"],
  ["changes", "What changed this week?", "text"],
  ["referrals", "Did you get any referrals?", "number"],
  ["missed", "Did you miss any follow-ups?", "text"],
];

export default function CheckInPage() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveCheckIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    const supabase = createBrowserSupabaseClient();

    try {
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setError("Log in before saving a weekly check-in.");
          return;
        }
        await saveCheckInToSupabase(supabase, userData.user, {
          leads: data.leads,
          booked: data.booked,
          referrals: data.referrals,
          objections: data.objections,
          comments: data.comments,
          content: data.content,
          changes: data.changes,
          missed: data.missed,
        });
      }
      window.localStorage.setItem("simple-marketing-hq:last-check-in", JSON.stringify({ ...data, createdAt: new Date().toISOString() }));
      setSaved(true);
      event.currentTarget.reset();
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
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Weekly check-in</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Welcome back. Let&apos;s update your LaunchPad Growth Plan.</h1>
        <form onSubmit={saveCheckIn} className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4">
            {fields.map(([name, label, type]) => (
              <label key={name} className="block text-sm font-medium text-slate-700">
                {label}
                <input
                  required
                  type={type}
                  min={type === "number" ? 0 : undefined}
                  name={name}
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                />
              </label>
            ))}
          </div>
          <button disabled={isSaving} className="mt-6 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? "Saving..." : "Save check-in"}
          </button>
          {saved ? <p className="mt-4 text-sm font-semibold text-emerald-700">Check-in saved. Your dashboard will use it to update momentum and next actions.</p> : null}
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
