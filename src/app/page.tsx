import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Compass, LineChart, MessageSquare, Rocket, Target } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { brand } from "@/lib/brand";
import { commandCenterModules } from "@/lib/command-center";

const steps = [
  ["Start the LaunchPad Diagnostic", "Complete intake across offer, audience, website, leads, sales process, content, follow-up, and goals."],
  ["Prepare the foundation", "Build the offer, message, strategy, content assets, schedule, research, and next actions."],
  ["Choose takeoff channels", "Use recommendations to decide which outside tools or channels are ready for deployment."],
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.positioning}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-slate-950 sm:text-6xl">
              Build your marketing foundation before takeoff.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Simple Marketing HQ is an AI marketing advisor and foundation command center for small businesses. Diagnose what is missing, build the offer and assets, then choose the right channel to launch.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/diagnostic"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-cyan-800"
              >
                Start Your Free Diagnostic
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{brand.growthScoreName}</p>
                  <p className="mt-1 text-5xl font-semibold text-cyan-900">76</p>
                </div>
                <div className="grid size-14 place-items-center rounded-md bg-amber-100 text-amber-700">
                  <BarChart3 size={28} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-3/4 rounded-full bg-cyan-800" />
              </div>
              <div className="mt-5 rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">Biggest bottleneck</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The offer is promising, but the message, proof, content plan, and follow-up assets need to be tightened before launch.
                </p>
              </div>
              <div className="mt-3 rounded-md bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-cyan-950">Next move</p>
                <p className="mt-2 text-sm leading-6 text-cyan-900">
                  Build the offer stack, create one authority content asset, then map the first campaign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-12">
        <SectionHeading
          eyebrow="How it works"
          title="A calm command center for foundational marketing work."
          body="Simple Marketing HQ prepares the rocket ship: offer, message, audience, strategy, content, schedule, research, assets, recommendations, and next actions."
        />
        <div className="mx-auto mt-8 grid w-full max-w-6xl gap-4 md:grid-cols-3">
          {steps.map(([title, body], index) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 grid size-10 place-items-center rounded-md bg-cyan-900 text-white">{index + 1}</div>
              <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-3">
          <Feature icon={<ClipboardList />} title={brand.diagnosticName} body="The intake and first assessment layer, not the whole product." />
          <Feature icon={<LineChart />} title={brand.growthScoreName} body="A foundation score across offer, audience, message, conversion readiness, follow-up, content, proof, and channel readiness." />
          <Feature icon={<Target />} title={brand.actionPlanName} body="A practical plan that tells you what to build first, why it matters, and what comes next." />
          <Feature icon={<Rocket />} title="Offer Builder" body="Shape the outcome, value stack, risk reducer, package frame, why-now angle, and CTA." />
          <Feature icon={<MessageSquare />} title="Content Engine" body="Create hooks, authority content, short-form derivatives, scripts, lead magnets, emails, and campaign assets." />
          <Feature icon={<Compass />} title="Strategy Map" body="Plan the next 7 days, next 30 days, missing assets, channel readiness, and order of operations." />
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-12">
        <SectionHeading
          eyebrow="Command center"
          title="The product spine points beyond the diagnostic."
          body="The LaunchPad Diagnostic starts the work. The command center turns it into foundational marketing assets and a clear launch path."
        />
        <div className="mx-auto mt-8 grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {commandCenterModules.map((module) => (
            <Link key={module.slug} href={module.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h3 className="text-lg font-semibold text-slate-950">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{module.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Who it is for</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Built for owners who need leads, not another giant dashboard.</h2>
          </div>
          <div className="grid gap-3">
            {["Local businesses", "Professional services", "Home services", "Coaches and consultants", "B2B service companies"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-slate-200 p-4">
                <CheckCircle2 className="text-emerald-600" size={18} aria-hidden="true" />
                <span className="font-medium text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cyan-950 px-5 py-12 text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-amber-200">Free now, paid-ready later</p>
            <h2 className="mt-2 text-3xl font-semibold">Start with the foundation. Upgrade for deeper execution.</h2>
          </div>
          <p className="text-sm leading-6 text-cyan-100">
            Free users get intake, scoring, offer starters, content starters, strategy direction, and next actions. Paid plans will unlock deeper execution, saved history, richer assets, visitor intelligence, referrals, and optimization.
          </p>
          <Link href="/diagnostic" className="inline-flex min-h-12 items-center justify-center rounded-md bg-amber-300 px-5 py-3 font-semibold text-cyan-950">
            Start Diagnostic
          </Link>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid size-10 place-items-center rounded-md bg-slate-100 text-cyan-900">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
