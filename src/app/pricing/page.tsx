import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const included = [
  "LaunchPad Diagnostic",
  "LaunchPad Growth Score",
  "Biggest bottleneck analysis",
  "LaunchPad Action Plan",
  "Offer Builder starter",
  "Strategy Map starter",
  "Saved dashboard after account creation",
  "Weekly check-ins",
  "Referral-ready profile",
  "Content Engine starter",
  "Advisor next action",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Pricing</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-slate-950">Start with a free foundation command center.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Simple Marketing HQ starts by diagnosing the foundation, building the first offer and content assets, and mapping what should happen before channel deployment.
        </p>
        <article className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Free Diagnostic</h2>
              <p className="mt-2 text-4xl font-semibold text-cyan-900">$0</p>
            </div>
            <Link href="/diagnostic" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
              Start Your Free Diagnostic
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div key={item} className="flex gap-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
