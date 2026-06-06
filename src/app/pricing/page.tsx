import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const plans = [
  {
    name: "Free Diagnostic",
    price: "$0",
    limit: "1 business",
    cta: "Start Your Free Diagnostic",
    href: "/diagnostic",
    features: ["1 LaunchPad Diagnostic", "Basic Growth Score", "Limited recommendations", "No full saved asset library"],
  },
  {
    name: "Starter",
    price: "$25/month",
    limit: "1 business",
    cta: "Choose Starter",
    href: "/diagnostic",
    features: ["Saved diagnostic history", "LaunchPad Action Plan", "Basic Offer Builder", "Basic Content Engine", "Limited AI generations"],
  },
  {
    name: "Owner",
    price: "$75/month",
    limit: "Up to 3 businesses",
    cta: "Choose Owner",
    href: "/diagnostic",
    features: ["Full Offer Builder", "Full Content Engine", "Strategy Map", "LaunchPad Advisor access", "Saved assets", "Exportable action plans"],
  },
  {
    name: "Growth / Agency Lite",
    price: "$150/month",
    limit: "Up to 10 businesses / clients",
    cta: "Choose Growth",
    href: "/diagnostic",
    features: ["Higher AI usage", "Client/business switcher", "Saved content plans", "Saved advisor threads", "Branded/exportable reports later"],
  },
  {
    name: "Agency Pro",
    price: "$300/month",
    limit: "Up to 25 businesses / clients",
    cta: "Choose Agency Pro",
    href: "/diagnostic",
    features: ["Team seats", "Higher AI limits", "Client workspace/reporting", "Priority workflows", "White-label-ready structure later"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Pricing</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-slate-950">Pricing for a real marketing foundation command center.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Simple Marketing HQ supports owners, consultants, and agencies that manage one or many Business / Client profiles. Stripe checkout is not active yet, so plan buttons start the diagnostic for now.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex min-h-28 flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">{plan.name}</h2>
                  <p className="mt-2 text-4xl font-semibold text-cyan-900">{plan.price}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{plan.limit}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {plan.features.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href={plan.href} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>

        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Additional Business / Client profiles</h2>
          <p className="mt-2 text-base leading-7 text-slate-600">
            Additional Business / Client profiles after a plan limit are priced at $15/month each. This keeps the account structure friendly for owners with multiple brands and agencies with client rosters.
          </p>
        </article>
      </section>
    </main>
  );
}
