import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Billing</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Subscription-ready upgrade paths.</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Free", "Growth", "Advisor"].map((plan) => (
            <article key={plan} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{plan}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {plan === "Free" ? "Diagnosis, clarity, and momentum." : "Paid execution and optimization placeholder for Stripe integration."}
              </p>
            </article>
          ))}
        </div>
        <Link href="/pricing" className="mt-6 inline-flex rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
          View public pricing
        </Link>
      </section>
    </main>
  );
}
