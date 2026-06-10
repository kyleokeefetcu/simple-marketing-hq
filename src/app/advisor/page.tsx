"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { buildAdvisorNextAction } from "@/lib/command-center";
import { brand } from "@/lib/brand";
import { getStoredResult } from "@/lib/launchpad";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getBusinesses, type BusinessSummary } from "@/lib/supabase/diagnostics";
import { getAdvisorThreads, saveAdvisorThread, type AdvisorThreadSummary } from "@/lib/supabase/assets";

export default function AdvisorPage() {
  const [result] = useState(() => getStoredResult());
  const [question, setQuestion] = useState("What should I build next to get more leads or booked calls?");
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [threads, setThreads] = useState<AdvisorThreadSummary[]>([]);
  const [status, setStatus] = useState("Log in to save advisor threads.");
  const [isSaving, setIsSaving] = useState(false);
  const advice = buildAdvisorNextAction(result);
  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const answer = useMemo(
    () =>
      [
        `Diagnosis: ${advice.diagnosis}`,
        `Recommended action: ${advice.action}`,
        `Why it matters: ${advice.why}`,
        `Execution steps: ${advice.steps.join(" ")}`,
        `Asset to create: ${advice.asset}`,
        `Next step: ${advice.next}`,
      ].join("\n\n"),
    [advice],
  );

  useEffect(() => {
    async function loadAdvisor() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setStatus("Add Supabase environment variables to save advisor threads.");
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      setUser(data.user);

      try {
        const savedBusinesses = await getBusinesses(supabase);
        const storedBusinessId = window.localStorage.getItem("simple-marketing-hq:selected-business-id") ?? "";
        const validStoredBusiness = savedBusinesses.some((business) => business.id === storedBusinessId);
        const nextBusinessId = validStoredBusiness ? storedBusinessId : savedBusinesses[0]?.id ?? "";

        setBusinesses(savedBusinesses);
        setSelectedBusinessId(nextBusinessId);

        if (nextBusinessId) {
          window.localStorage.setItem("simple-marketing-hq:selected-business-id", nextBusinessId);
          const savedThreads = await getAdvisorThreads(supabase, nextBusinessId);
          setThreads(savedThreads);
          setStatus(savedThreads.length ? "Advisor history loaded for this Business / Client." : "Save this advisor response to start a thread history.");
        } else {
          setStatus("Create or select a Business / Client before saving advisor threads.");
        }
      } catch (error) {
        setStatus(`Could not load advisor history: ${(error as Error).message}`);
      }
    }

    void loadAdvisor();
  }, []);

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);

    const supabase = createBrowserSupabaseClient();
    if (!supabase || !businessId) return;

    try {
      const savedThreads = await getAdvisorThreads(supabase, businessId);
      setThreads(savedThreads);
      setStatus(savedThreads.length ? "Advisor history loaded for this Business / Client." : "No advisor threads saved yet for this Business / Client.");
    } catch (error) {
      setStatus(`Could not switch advisor history: ${(error as Error).message}`);
    }
  }

  async function handleSaveThread() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !user || !selectedBusinessId) {
      setStatus("Log in and select a Business / Client before saving.");
      return;
    }

    setIsSaving(true);
    setStatus("Saving advisor thread...");

    try {
      await saveAdvisorThread(supabase, user, {
        businessId: selectedBusinessId,
        title: question.slice(0, 72),
        question,
        answer,
        context: {
          businessName: result?.businessName,
          websiteUrl: result?.websiteUrl,
          growthScore: result?.growthScore,
          bottleneck: result?.biggestBottleneck,
          answers: result?.answers,
        },
        metadata: {
          source: "launchpad-advisor",
          recommendedAction: advice.action,
        },
      });
      const savedThreads = await getAdvisorThreads(supabase, selectedBusinessId);
      setThreads(savedThreads);
      setStatus("Saved. This advisor response is now part of the selected Business / Client history.");
    } catch (error) {
      setStatus(`Could not save advisor thread: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-4xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.advisorName}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Know what to build next.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          The advisor translates your diagnostic into one useful action, the reason it matters, the steps to execute, and the asset to create.
        </p>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.45fr]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">What do you need help deciding?</span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900"
              />
            </label>
            <div>
              <label className="block text-sm font-semibold text-slate-700" htmlFor="advisor-business">
                Business / Client
              </label>
              <select
                id="advisor-business"
                value={selectedBusinessId}
                onChange={(event) => void handleBusinessChange(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
              >
                <option value="">Select Business / Client</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-sm leading-6 text-slate-600">{status}</p>
            </div>
          </div>
        </section>

        <article className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Diagnosis</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{advice.diagnosis}</h2>
          <div className="mt-5 rounded-md bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-950">Recommended action</p>
            <p className="mt-2 text-sm leading-6 text-cyan-900">{advice.action}</p>
            <p className="mt-3 text-sm leading-6 text-cyan-900">{advice.why}</p>
          </div>
          <div className="mt-5 grid gap-3">
            {advice.steps.map((step, index) => (
              <div key={step} className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-cyan-800">Step {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-950">Asset to create: {advice.asset}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Next: {advice.next}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleSaveThread()}
              disabled={isSaving || !user || !selectedBusinessId}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isSaving ? "Saving..." : `Save advisor thread${selectedBusiness ? ` for ${selectedBusiness.name}` : ""}`}
            </button>
            <Link href="/offer-builder" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Build offer asset
            </Link>
            <Link href="/content-engine" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
              Build content asset
            </Link>
          </div>
        </article>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Saved advisor history</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Prior threads for {selectedBusiness?.name ?? "this Business / Client"}</h2>
          <div className="mt-5 grid gap-3">
            {threads.length ? (
              threads.map((thread) => (
                <details key={thread.id} className="rounded-md border border-slate-200 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-950">
                    {thread.title} <span className="font-normal text-slate-500">({new Date(thread.createdAt).toLocaleDateString()})</span>
                  </summary>
                  <div className="mt-3 grid gap-3">
                    {thread.messages.map((message) => (
                      <div key={message.id} className="rounded-md bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">{message.role}</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))
            ) : (
              <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Saved advisor threads will appear here after you save a response for the selected Business / Client.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
