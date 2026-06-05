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
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Find the bottleneck. Choose the next move. Keep momentum.</h1>
        <div className="mt-8 grid gap-4">
          {[
            [brand.diagnosticName, "Answer a simple quiz and enter your website URL early."],
            [brand.growthScoreName, "Get practical grades for messaging, offer strength, lead flow, and follow-up."],
            [brand.actionPlanName, "See the highest-leverage action items for more leads and booked calls."],
            [brand.advisorName, "Return later for check-ins, updated recommendations, and execution support."],
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
