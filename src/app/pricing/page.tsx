import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const plans = [
  {
    name: "Free Diagnostic",
    price: "$0",
    items: ["LaunchPad Diagnostic", "Growth Score", "Bottleneck snapshot", "Limited recommendations"],
  },
  {
    name: "Growth",
    price: "Coming soon",
    items: ["Saved history", "Weekly check-ins", "Stop Stack content ideas", "Dashboard modules", "Visitor intelligence foundation"],
  },
  {
    name: "Advisor",
    price: "Coming soon",
    items: ["Deeper AI action plans", "Referral tracking", "Partner recommendations", "Advanced content assets", "Team-ready structure"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Pricing</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-slate-950">Start free. Upgrade when you are ready to execute and scale.</h1>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{plan.name}</h2>
              <p className="mt-2 text-2xl font-semibold text-cyan-900">{plan.price}</p>
              <div className="mt-5 grid gap-3">
                {plan.items.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <Link href="/diagnostic" className="mt-8 inline-flex rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
          Start Your Free Diagnostic
        </Link>
      </section>
    </main>
  );
}
