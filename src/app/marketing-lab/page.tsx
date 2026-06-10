import Link from "next/link";
import { Beaker, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { marketingLabPromptPacks } from "@/lib/ai/prompts/registry";

function rolePath(roleId: string) {
  return `/marketing-lab/${roleId.replace(/_/g, "-")}`;
}

export default function MarketingLabPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/dashboard" className="text-sm font-semibold text-cyan-800">
          Back to Command Center
        </Link>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid size-12 place-items-center rounded-md bg-cyan-50 text-cyan-900">
            <Beaker size={24} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-cyan-800">Marketing Lab</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">Run consultant-grade audits inside Simple Marketing HQ.</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Each lab role uses selected business context, diagnostic answers, website analysis, saved assets, and focused input to generate a structured marketing output you can save.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {marketingLabPromptPacks.map((prompt) => (
            <Link key={prompt.role_id} href={rolePath(prompt.role_id)} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Audit</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">{prompt.display_name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{prompt.purpose}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                Open audit
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
