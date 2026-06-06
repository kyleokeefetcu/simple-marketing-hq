"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { saveReferralProfileToSupabase } from "@/lib/supabase/diagnostics";

const fields = [
  ["businessName", "Business name"],
  ["description", "Short description"],
  ["services", "Services"],
  ["serviceArea", "Service area"],
  ["idealCustomer", "Ideal customer"],
  ["bestReferralTypes", "Best referral types"],
  ["contactMethod", "Contact method"],
  ["bookingLink", "Booking link"],
];

export default function ReferralProfilePage() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    const supabase = createBrowserSupabaseClient();

    try {
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setError("Log in before saving a referral profile.");
          return;
        }
        await saveReferralProfileToSupabase(supabase, userData.user, {
          businessName: data.businessName,
          description: data.description,
          services: data.services,
          serviceArea: data.serviceArea,
          idealCustomer: data.idealCustomer,
          bestReferralTypes: data.bestReferralTypes,
          contactMethod: data.contactMethod,
          bookingLink: data.bookingLink,
        });
      }
      window.localStorage.setItem("simple-marketing-hq:referral-profile", JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
      setSaved(true);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Your Referrals</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Create a referral-ready business profile.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Keep this professional: trusted referral partners, clear ideal customers, and simple ways to make introductions.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <form onSubmit={saveProfile} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(([name, label]) => (
                <label key={name} className="block text-sm font-medium text-slate-700">
                  {label}
                  <input required name={name} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100" />
                </label>
              ))}
            </div>
            <button disabled={isSaving} className="mt-6 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {isSaving ? "Saving..." : "Save referral profile"}
            </button>
            {saved ? <p className="mt-4 text-sm font-semibold text-emerald-700">Referral profile saved. Use it to make clearer partner introductions.</p> : null}
            {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">How to use this profile</h2>
            <div className="mt-4 grid gap-3">
              {["Share your strongest offer", "Write an intro message", "Define your ideal referral", "Invite a referral partner"].map((action) => (
                <div key={action} className="rounded-md border border-slate-200 p-4">
                  <p className="font-semibold text-slate-950">{action}</p>
                  <p className="mt-1 text-sm text-slate-600">Save your profile first, then use these details when you ask for warm introductions.</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
