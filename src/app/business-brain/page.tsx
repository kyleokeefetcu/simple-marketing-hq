"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  getBusinesses,
  getBusinessDisplayName,
  getSavedDiagnostics,
  getWebsiteAnalyses,
  updateBusinessBrain,
  type BusinessBrainInput,
  type BusinessSummary,
  type SavedDiagnosticSummary,
  type WebsiteAnalysisSummary,
} from "@/lib/supabase/diagnostics";
import { getMarketingAssets, saveMarketingAsset, type MarketingAssetSummary, type MarketingAssetType } from "@/lib/supabase/assets";

type BusinessBrainForm = BusinessBrainInput & {
  currentBottleneck: string;
  recommendedFirstChannel: string;
  cta: string;
  proofTrustPoints: string;
  mainPainProblem: string;
};

const emptyBrainForm: BusinessBrainForm = {
  name: "",
  websiteUrl: "",
  description: "",
  services: "",
  idealCustomer: "",
  currentBottleneck: "",
  recommendedFirstChannel: "",
  cta: "",
  proofTrustPoints: "",
  mainPainProblem: "",
};

const assetTypes: MarketingAssetType[] = [
  "icp",
  "offer",
  "message",
  "content",
  "strategy_map",
  "marketing_schedule",
  "research",
  "recommendation",
  "buyer_psychology_audit",
  "marketing_reality_check",
  "market_demand_check",
  "problem_narrative",
  "messaging_sequence",
  "buyer_messaging_output",
];

export default function BusinessBrainPage() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [diagnostic, setDiagnostic] = useState<SavedDiagnosticSummary | null>(null);
  const [analyses, setAnalyses] = useState<WebsiteAnalysisSummary[]>([]);
  const [assets, setAssets] = useState<MarketingAssetSummary[]>([]);
  const [form, setForm] = useState<BusinessBrainForm>(emptyBrainForm);
  const [status, setStatus] = useState("Loading Business Brain...");
  const [isSaving, setIsSaving] = useState(false);

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const latestAnalysis = analyses[0] ?? null;
  const confirmation = assets.find((asset) => asset.title === "Business Brain Confirmation");
  const pages = useMemo(() => extractPages(latestAnalysis?.analysis), [latestAnalysis]);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setStatus("Connect Supabase to load Business Brain.");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setStatus("Log in to load Business Brain.");
        return;
      }
      try {
        const savedBusinesses = await getBusinesses(supabase);
        const stored = window.localStorage.getItem("simple-marketing-hq:selected-business-id") ?? "";
        const nextId = savedBusinesses.some((business) => business.id === stored) ? stored : savedBusinesses[0]?.id ?? "";
        setBusinesses(savedBusinesses);
        setSelectedBusinessId(nextId);
        if (nextId) await loadBusiness(nextId, savedBusinesses);
        setStatus(nextId ? "Business Brain loaded." : "Create or select a Business / Client first.");
      } catch (error) {
        setStatus(`Could not load Business Brain: ${(error as Error).message}`);
      }
    }
    void load();
  // Load once on mount; loadBusiness reads the current saved business list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBusiness(businessId: string, knownBusinesses = businesses) {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !businessId) return;
    const business = knownBusinesses.find((item) => item.id === businessId) ?? null;
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);
    const [diagnostics, websiteAnalyses, assetGroups] = await Promise.all([
      getSavedDiagnostics(supabase, businessId),
      getWebsiteAnalyses(supabase, businessId),
      Promise.all(assetTypes.map((assetType) => getMarketingAssets(supabase, businessId, assetType))),
    ]);
    const flatAssets = assetGroups.flat().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const savedBrain = flatAssets.find((asset) => asset.title === "Business Brain Confirmation" || asset.title === "Business Brain Saved");
    const snapshot = extractBrainSnapshot(savedBrain);
    if (business) setForm(toBrainForm(business, diagnostics[0] ?? null, snapshot));
    setDiagnostic(diagnostics[0] ?? null);
    setAnalyses(websiteAnalyses);
    setAssets(flatAssets);
  }

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    setStatus("Loading selected Business Brain...");
    await loadBusiness(businessId);
    setStatus("Business Brain loaded.");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !selectedBusinessId) return;
    setIsSaving(true);
    setStatus("Saving Business Brain...");
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Log in before saving Business Brain.");
      await updateBusinessBrain(supabase, selectedBusinessId, form);
      await saveMarketingAsset(supabase, data.user, {
        businessId: selectedBusinessId,
        roleId: "research_hub",
        assetType: "research",
        title: "Business Brain Saved",
        summary: `Business Brain saved for ${form.name || selectedBusiness?.name || "this business"}.`,
        output: { savedAt: new Date().toISOString(), snapshot: form, latestDiagnostic: diagnostic, latestWebsiteAnalysis: latestAnalysis },
        input: { source: "business_brain" },
        prompt: { purpose: "Save Business Brain source of truth fields." },
      });
      const savedBusinesses = await getBusinesses(supabase);
      setBusinesses(savedBusinesses);
      await loadBusiness(selectedBusinessId, savedBusinesses);
      setStatus("Business Brain saved. Future AI outputs will use these updates.");
    } catch (error) {
      setStatus(`Could not save Business Brain: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirm() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !selectedBusinessId) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setStatus("Log in before confirming Business Brain.");
      return;
    }
    setIsSaving(true);
    try {
      await saveMarketingAsset(supabase, data.user, {
        businessId: selectedBusinessId,
        roleId: "research_hub",
        assetType: "research",
        title: "Business Brain Confirmation",
        summary: `Business Brain confirmed for ${form.name || selectedBusiness?.name || "this business"}.`,
        output: { confirmedAt: new Date().toISOString(), snapshot: form, latestDiagnostic: diagnostic, latestWebsiteAnalysis: latestAnalysis },
        input: { source: "business_brain" },
        prompt: { purpose: "Confirm Business Brain as source of truth." },
      });
      await loadBusiness(selectedBusinessId);
      setStatus("Business Brain confirmed. Future AI outputs will use this as the source of truth.");
    } catch (error) {
      setStatus(`Could not confirm Business Brain: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/dashboard" className="text-sm font-semibold text-cyan-800">Back to Command Center</Link>
        <header className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Business Brain</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Source of truth for this business.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Marketing Lab and HQ tools use this confirmed context before older diagnostic details.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select value={selectedBusinessId} onChange={(event) => void handleBusinessChange(event.target.value)} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">
              <option value="">Select Business / Client</option>
              {businesses.map((business) => <option key={business.id} value={business.id}>{getBusinessDisplayName(business, businesses)}</option>)}
            </select>
            <span className="text-sm font-semibold text-emerald-700">{status}</span>
          </div>
        </header>

        <form onSubmit={handleSave} className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Business Snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Edit the facts AI should trust first.</h2>
            </div>
            <button disabled={isSaving || !selectedBusinessId} className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-900 px-4 text-sm font-semibold text-white disabled:bg-slate-300">Save Business Brain</button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <BrainField label="Business name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
            <BrainField label="Website URL" value={form.websiteUrl} onChange={(value) => setForm((current) => ({ ...current, websiteUrl: value }))} />
            <BrainField label="Industry/category" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
            <BrainField label="What they sell / Main offer" value={form.services} onChange={(value) => setForm((current) => ({ ...current, services: value }))} />
            <BrainField label="Primary audience" value={form.idealCustomer} onChange={(value) => setForm((current) => ({ ...current, idealCustomer: value }))} />
            <BrainField label="Current bottleneck" value={form.currentBottleneck} onChange={(value) => setForm((current) => ({ ...current, currentBottleneck: value }))} />
            <BrainField label="Recommended first channel" value={form.recommendedFirstChannel} onChange={(value) => setForm((current) => ({ ...current, recommendedFirstChannel: value }))} />
            <BrainField label="CTA" value={form.cta} onChange={(value) => setForm((current) => ({ ...current, cta: value }))} />
            <BrainField label="Proof/trust points" value={form.proofTrustPoints} onChange={(value) => setForm((current) => ({ ...current, proofTrustPoints: value }))} />
            <BrainField label="Main pain/problem solved" value={form.mainPainProblem} onChange={(value) => setForm((current) => ({ ...current, mainPainProblem: value }))} />
          </div>
        </form>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Website Analysis Status</p>
            <div className="mt-4 grid gap-3">
              <StatusRow label="Website analyzed" value={latestAnalysis || diagnostic ? "Yes" : "No"} />
              <StatusRow label="Website URL" value={latestAnalysis?.websiteUrl || diagnostic?.websiteUrl || form.websiteUrl || "No URL saved yet."} />
              <StatusRow label="Last crawl / analysis" value={formatDate(latestAnalysis?.createdAt || diagnostic?.completedAt)} />
              <StatusRow label="Last confirmed" value={formatDate(confirmation?.createdAt)} />
              <StatusRow label="Pages analyzed" value={pages.length ? String(pages.length) : "No saved crawl metadata yet."} />
              <StatusRow label="Source" value={latestAnalysis ? "website analysis" : diagnostic ? "diagnostic" : "manual edit"} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Future Marketing Lab outputs use this confirmed business context by default.</p>
            <button type="button" onClick={() => void handleConfirm()} disabled={isSaving || !selectedBusinessId} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-cyan-900 px-4 text-sm font-semibold text-cyan-900 disabled:opacity-50">Confirm Business Brain</button>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Website Pages / Sources</p>
            <div className="mt-4 grid gap-3">
              {pages.length ? pages.slice(0, 8).map((page) => <StatusRow key={page.url} label={page.type || "Page"} value={`${page.url}${page.summary ? ` - ${page.summary}` : ""}`} />) : <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">Page-level crawl history has not been saved yet.</p>}
            </div>
          </article>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI Training Assets</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {assets.length ? assets.slice(0, 20).map((asset) => (
              <article key={asset.id} className="rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">{asset.title}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{asset.assetType.replaceAll("_", " ")} / {asset.roleId.replaceAll("_", " ")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Updated {formatDate(asset.updatedAt)} · {asset.status}</p>
              </article>
            )) : <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">No saved AI training assets yet.</p>}
          </div>
        </section>
      </section>
    </main>
  );
}

function toBrainForm(business: BusinessSummary, diagnostic: SavedDiagnosticSummary | null, snapshot?: Partial<BusinessBrainForm>): BusinessBrainForm {
  return {
    ...emptyBrainForm,
    name: snapshot?.name ?? business.name,
    websiteUrl: snapshot?.websiteUrl ?? business.websiteUrl,
    description: snapshot?.description ?? business.description,
    services: snapshot?.services ?? business.services,
    idealCustomer: snapshot?.idealCustomer ?? business.idealCustomer,
    currentBottleneck: snapshot?.currentBottleneck ?? diagnostic?.biggestBottleneck ?? "",
    recommendedFirstChannel: snapshot?.recommendedFirstChannel ?? diagnostic?.recommendedFirstChannel ?? "",
    cta: snapshot?.cta ?? extractDiagnosticValue(diagnostic, "primaryCta") ?? "",
    proofTrustPoints: snapshot?.proofTrustPoints ?? extractDiagnosticValue(diagnostic, "trustSignals") ?? "",
    mainPainProblem: snapshot?.mainPainProblem ?? diagnostic?.nextMove ?? "",
  };
}

function BrainField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-semibold text-slate-700">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100" /></label>;
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm leading-6 text-slate-800">{value}</p></div>;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "Not saved yet.";
}

function extractBrainSnapshot(asset?: MarketingAssetSummary): Partial<BusinessBrainForm> | undefined {
  const snapshot = asset?.output?.snapshot;
  return snapshot && typeof snapshot === "object" ? snapshot as Partial<BusinessBrainForm> : undefined;
}

function extractDiagnosticValue(diagnostic: SavedDiagnosticSummary | null, key: string) {
  if (!diagnostic) return "";
  const summary = diagnostic as unknown as { summary?: Record<string, unknown> };
  const profile = summary.summary?.confirmedProfile as Record<string, unknown> | undefined;
  const value = profile?.[key];
  return typeof value === "string" ? value : "";
}

function extractPages(analysis?: Record<string, unknown>) {
  const pages = analysis?.pagesAnalyzed;
  if (!Array.isArray(pages)) return [];
  return pages.map((page, index) => {
    if (typeof page === "string") return { url: page, type: `Page ${index + 1}`, summary: "" };
    const record = page as Record<string, unknown>;
    return { url: String(record.url ?? record.href ?? `Page ${index + 1}`), type: String(record.type ?? record.pageType ?? `Page ${index + 1}`), summary: String(record.summary ?? "") };
  });
}
