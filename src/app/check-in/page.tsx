"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";

const fields = [
  ["leads", "How many leads came in?"],
  ["booked", "How many booked calls?"],
  ["objections", "What objections came up?"],
  ["comments", "What customer comments should we learn from?"],
  ["content", "What content performed best?"],
  ["changes", "What changed this week?"],
  ["referrals", "Did you get any referrals?"],
  ["missed", "Did you miss any follow-ups?"],
];

export default function CheckInPage() {
  const [saved, setSaved] = useState(false);

  function saveCheckIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    window.localStorage.setItem("simple-marketing-hq:last-check-in", JSON.stringify({ ...data, createdAt: new Date().toISOString() }));
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-3xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Weekly check-in</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Welcome back. Let&apos;s update your LaunchPad Growth Plan.</h1>
        <form onSubmit={saveCheckIn} className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4">
            {fields.map(([name, label]) => (
              <label key={name} className="block text-sm font-medium text-slate-700">
                {label}
                <input name={name} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100" />
              </label>
            ))}
          </div>
          <button className="mt-6 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">Save check-in</button>
          {saved ? <p className="mt-4 text-sm font-semibold text-emerald-700">Check-in saved locally. Supabase persistence is ready once SQL and env vars are configured.</p> : null}
        </form>
      </section>
    </main>
  );
}
