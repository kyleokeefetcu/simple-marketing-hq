"use client";

import type { User } from "@supabase/supabase-js";
import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getBusinesses, type BusinessSummary } from "@/lib/supabase/diagnostics";
import {
  getMarketingAssets,
  saveMarketingAsset,
  type MarketingAssetSummary,
  type MarketingAssetType,
} from "@/lib/supabase/assets";

type AssetSavePanelProps = {
  assetType: MarketingAssetType;
  title: string;
  summary: string;
  output: Record<string, unknown>;
  input?: Record<string, unknown>;
  prompt?: Record<string, unknown>;
};

export function AssetSavePanel({ assetType, title, summary, output, input, prompt }: AssetSavePanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [assets, setAssets] = useState<MarketingAssetSummary[]>([]);
  const [status, setStatus] = useState("Log in to save this output to your command center.");
  const [isSaving, setIsSaving] = useState(false);

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedBusinessId) ?? null,
    [businesses, selectedBusinessId],
  );

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setStatus("Add Supabase environment variables to save command-center assets.");
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
          const savedAssets = await getMarketingAssets(supabase, nextBusinessId, assetType);
          setAssets(savedAssets);
          setStatus(savedAssets.length ? "Saved history loaded for this Business / Client." : "Save this output to start history for this Business / Client.");
        } else {
          setStatus("Create or select a Business / Client before saving this output.");
        }
      } catch (error) {
        setStatus(`Could not load saved assets: ${(error as Error).message}`);
      }
    }

    void load();
  }, [assetType]);

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);

    const supabase = createBrowserSupabaseClient();
    if (!supabase || !businessId) return;

    try {
      const savedAssets = await getMarketingAssets(supabase, businessId, assetType);
      setAssets(savedAssets);
      setStatus(savedAssets.length ? "Saved history loaded for this Business / Client." : "No saved outputs yet for this Business / Client.");
    } catch (error) {
      setStatus(`Could not switch saved history: ${(error as Error).message}`);
    }
  }

  async function handleSave() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !user || !selectedBusinessId) {
      setStatus("Log in and select a Business / Client before saving.");
      return;
    }

    setIsSaving(true);
    setStatus("Saving to Supabase...");

    try {
      await saveMarketingAsset(supabase, user, {
        businessId: selectedBusinessId,
        assetType,
        title,
        summary,
        output,
        input,
        prompt,
      });
      const savedAssets = await getMarketingAssets(supabase, selectedBusinessId, assetType);
      setAssets(savedAssets);
      setStatus("Saved. This output is now part of the selected Business / Client history.");
    } catch (error) {
      setStatus(`Could not save this output: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Saved asset library</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Save this output for {selectedBusiness?.name ?? "a Business / Client"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{status}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedBusinessId}
            onChange={(event) => void handleBusinessChange(event.target.value)}
            className="min-h-12 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
            aria-label="Select Business / Client"
          >
            <option value="">Select Business / Client</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !user || !selectedBusinessId}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            <Save size={18} aria-hidden="true" />
            {isSaving ? "Saving..." : "Save output"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {assets.length ? (
          assets.map((asset) => (
            <details key={asset.id} className="rounded-md border border-slate-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-950">
                {asset.title} <span className="font-normal text-slate-500">({new Date(asset.createdAt).toLocaleDateString()})</span>
              </summary>
              {asset.summary ? <p className="mt-3 text-sm leading-6 text-slate-600">{asset.summary}</p> : null}
              <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-50">
                {JSON.stringify(asset.output, null, 2)}
              </pre>
            </details>
          ))
        ) : (
          <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Saved outputs for this tool will appear here after you save the current result.
          </p>
        )}
      </div>
    </section>
  );
}
