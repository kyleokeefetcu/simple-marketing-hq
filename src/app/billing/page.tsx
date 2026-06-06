"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function BillingPage() {
  const [plan, setPlan] = useState("free");
  const [status, setStatus] = useState("Free account");
  const [message, setMessage] = useState("Your account is on the free diagnostic plan.");

  useEffect(() => {
    async function loadPlan() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setStatus("Login required");
        setMessage("Log in to view the plan tied to your account.");
        return;
      }

      const [{ data: profile }, { data: subscription }] = await Promise.all([
        supabase.from("profiles").select("plan").eq("id", userData.user.id).maybeSingle(),
        supabase.from("subscriptions").select("plan, status").eq("user_id", userData.user.id).maybeSingle(),
      ]);

      if (subscription?.plan) {
        setPlan(subscription.plan);
        setStatus(subscription.status || "Subscription recorded");
        setMessage("Your subscription status is loaded from Supabase.");
        return;
      }

      if (profile?.plan) {
        setPlan(profile.plan);
      }
      setStatus("Free account");
      setMessage("Your account is on the free diagnostic plan.");
    }

    void loadPlan();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-4xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Account plan</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Your Simple Marketing HQ plan</h1>
        <article className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-500">Current plan</p>
              <p className="mt-1 text-3xl font-semibold capitalize text-slate-950">{plan}</p>
              <p className="mt-2 text-sm text-slate-600">Status: <span className="font-semibold capitalize text-emerald-700">{status}</span></p>
              <p className="mt-2 text-sm text-slate-600">{message}</p>
            </div>
            <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Back to dashboard
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
