import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, ClipboardList, Compass, Lightbulb, MessageSquare, Rocket, Search, Target, Users, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";

const diagnosticSignals = [
  "Customers and leads",
  "Sales or booked jobs",
  "Website visitors",
  "Follow-up",
  "What is not working",
  "What to fix first",
];

const cmoHandoff = [
  ["What to fix first", "Tighten the offer and message before pushing more traffic."],
  ["Why it matters", "Clearer words help the right customers understand why they should act now."],
  ["What to ignore", "Do not add another channel until the core offer is easier to say yes to."],
  ["Utility to open", "Offer HQ"],
  ["Asset to build", "Offer statement + CTA + proof point."],
];

const utilities = [
  ["Audience HQ", "Keep your best-fit customer clear as you learn more.", Users],
  ["Offer HQ", "Improve your offer as new feedback, objections, and proof come in.", Target],
  ["Messaging HQ", "Keep your headline, pitch, CTA, and follow-up language sharp.", MessageSquare],
  ["Content HQ", "Create posts, hooks, emails, scripts, and campaign assets from your current strategy.", Rocket],
  ["Strategy HQ", "Know what to do first, what to ignore, and what order to work in.", Compass],
  ["Execution HQ", "Turn the strategy into this week's simple marketing plan.", ClipboardList],
  ["Research HQ", "Save customer questions, objections, competitor notes, and content ideas.", Search],
  ["Advisor", "Ask your AI CMO what to do next.", Bot],
  ["Tool Stack HQ", "Choose outside tools only when your foundation is ready.", Wrench],
] as const;

const livingFoundation = [
  "Feed in new customer questions",
  "Add what worked or did not work",
  "Update your offer and message",
  "Create better content from real feedback",
  "Keep your weekly plan focused",
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI marketing team and command center for small businesses</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-slate-950 sm:text-6xl">
              Your marketing team in a simple command center.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Simple Marketing HQ gives small business owners an AI CMO and easy marketing utilities that keep your offer, audience, message, content, and weekly plan moving as your business changes.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/diagnostic"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-cyan-800"
              >
                Start Free Diagnostic
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="#command-center"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                See the Command Center
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI CMO Handoff</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Next Best Move</h2>
                </div>
                <div className="grid size-12 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700">
                  <Lightbulb size={24} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5 rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">Current focus</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your offer and message need to be tightened before you push more traffic.
                </p>
              </div>
              <div className="mt-3 rounded-md bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-cyan-950">Next best move</p>
                <p className="mt-2 text-sm leading-6 text-cyan-900">Open Offer HQ.</p>
              </div>
              <div className="mt-3 rounded-md border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">Output</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Offer statement + CTA + proof point.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="command-center" className="bg-slate-50 px-5 py-12">
        <SectionHeading
          eyebrow="Start here"
          title="The Diagnostic starts the work."
          body="Run a fresh diagnostic when your business, customers, leads, offer, or priorities change. Simple Marketing HQ turns plain business-owner answers into a clear marketing recommendation."
        />
        <div className="mx-auto mt-8 grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diagnosticSignals.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <CheckCircle2 className="text-emerald-600" size={18} aria-hidden="true" />
              <span className="font-medium text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">AI CMO</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Your AI CMO tells you what to do next.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              After each diagnostic or update, Simple Marketing HQ gives you a simple handoff: what to fix first, why it matters, what to ignore for now, which utility to open, and what asset to build next.
            </p>
          </div>
          <div className="grid gap-3">
            {cmoHandoff.map(([title, body]) => (
              <div key={title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-12">
        <SectionHeading
          eyebrow="Utilities"
          title="Easy utilities build the assets."
          body="Open the part of your marketing that needs work right now. Each utility helps you improve the actual words, plans, ideas, and assets your business uses."
        />
        <div className="mx-auto mt-8 grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {utilities.map(([title, body, Icon]) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 grid size-10 place-items-center rounded-md bg-slate-100 text-cyan-900">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Living foundation</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Your marketing gets better over time.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Marketing is not a one-time report. Add customer questions, sales notes, campaign results, objections, reviews, new offers, or ideas. Simple Marketing HQ uses that information to improve your offer, message, content, strategy, and next actions.
            </p>
          </div>
          <div className="grid gap-3">
            {livingFoundation.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-slate-200 p-4">
                <CheckCircle2 className="text-emerald-600" size={18} aria-hidden="true" />
                <span className="font-medium text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Who it is for</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Built for owners who need more leads, booked jobs, sales, and clarity.</h2>
          </div>
          <div className="grid gap-3">
            {["Local businesses", "Home services", "Professional services", "Coaches and consultants", "B2B service companies", "Agencies managing client marketing foundations"].map((item) => (
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
            <h2 className="mt-2 text-3xl font-semibold">Start free. Build the foundation. Upgrade when you are ready to execute deeper.</h2>
          </div>
          <p className="text-sm leading-6 text-cyan-100">
            Free users can run the diagnostic, get a next-best-move recommendation, and start building core marketing assets. Paid plans will unlock saved history, deeper AI working sessions, visitor intelligence, referrals, richer asset generation, and optimization.
          </p>
          <Link href="/diagnostic" className="inline-flex min-h-12 items-center justify-center rounded-md bg-amber-300 px-5 py-3 font-semibold text-cyan-950">
            Start Free Diagnostic
          </Link>
        </div>
      </section>
    </main>
  );
}
