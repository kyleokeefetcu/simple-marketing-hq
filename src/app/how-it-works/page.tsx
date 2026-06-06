import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { brand } from "@/lib/brand";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto w-full max-w-4xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">How it works</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Prepare the marketing foundation, then launch through the right channel.</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Simple Marketing HQ is not a website scanner or generic checklist. It is a calm workspace for building the offer, message, strategy, content, schedule, research, assets, and recommendations a small business needs before takeoff.
        </p>
        <div className="mt-8 grid gap-4">
          {[
            [brand.diagnosticName, "Start with intake across business, offer, audience, website, lead flow, sales process, content, follow-up, and goals."],
            [brand.growthScoreName, "Score the foundation across offer clarity, audience clarity, message clarity, conversion readiness, lead capture, follow-up, content consistency, channel readiness, proof, and next-action clarity."],
            [brand.actionPlanName, "Turn the score into the current bottleneck, highest-leverage objective, next 7 days, next 30 days, missing assets, and order of operations."],
            ["Offer Builder", "Create a starter offer stack with outcome, customer pain, value, speed, effort reduction, risk reducer, package frame, why-now angle, and CTA."],
            ["Content Engine", "Generate hooks, authority content, short-form derivatives, long-form outlines, lead magnets, emails, and campaign ideas tied to the offer."],
            [brand.advisorName, "Decide what to build next with diagnosis, why it matters, step-by-step execution, the asset to create, and the following move."],
            [brand.recommendationsName, "Recommend external tools and channels only after the foundation is ready for deployment."],
          ].map(([title, body], index) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-cyan-800">0{index + 1}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
        <Link href="/diagnostic" className="mt-8 inline-flex items-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
          Start Your Free Diagnostic
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
