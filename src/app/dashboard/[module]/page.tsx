import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { dashboardModules } from "@/lib/launchpad";

const moduleDetails: Record<string, string[]> = {
  message: ["Offer", "Homepage headline", "Positioning", "Elevator pitch", "Follow-up scripts"],
  customers: ["Ideal customer", "Pain points", "Customer goals", "Neighborhoods or industries", "Best referral sources"],
  website: ["Website diagnosis", "CTA review", "Trust signals", "Lead capture", "Visitor intelligence"],
  visibility: ["SEO", "Google Business Profile", "Social content", "Paid ads", "Content recommendations"],
  referrals: ["Referral partner profile", "Shareable business profile", "Ideal referral description", "Referral tracking", "Trusted partner list"],
  "follow-up": ["Speed-to-lead", "Missed opportunity warnings", "Suggested follow-up scripts", "Response recommendations"],
  momentum: ["Leads this week", "Booked calls", "Referral activity", "Repeat visitors", "Recommended next action"],
};

const moduleActions: Record<string, { href: string; label: string; body: string }> = {
  message: { href: "/diagnostic", label: "Update diagnostic", body: "Refresh your offer and message inputs so your action plan stays current." },
  customers: { href: "/diagnostic", label: "Update customer focus", body: "Clarify who you want more of and what outcome matters most to them." },
  website: { href: "/diagnostic", label: "Review website", body: "Run the diagnostic with your current website URL and conversion notes." },
  visibility: { href: "/content-engine", label: "Generate campaign ideas", body: "Create attention-first hooks for the channel you want to improve." },
  referrals: { href: "/dashboard/referrals", label: "Edit referral profile", body: "Save a profile you can use for warm introductions and partner conversations." },
  "follow-up": { href: "/check-in", label: "Log follow-up notes", body: "Capture missed follow-ups, objections, and response patterns from this week." },
  momentum: { href: "/check-in", label: "Save weekly check-in", body: "Update lead, booking, referral, and follow-up activity." },
};

export default async function DashboardModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const dashboardModule = dashboardModules.find((item) => item.slug === moduleSlug);
  if (!dashboardModule) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-5 py-8">
        <Link href="/dashboard" className="text-sm font-semibold text-cyan-800">
          Back to dashboard
        </Link>
        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Dashboard module</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">{dashboardModule.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{dashboardModule.body}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {moduleDetails[dashboardModule.slug].map((item) => (
              <div key={item} className="rounded-md border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use your saved diagnostic and check-in history to make this part of the growth plan sharper.</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-md bg-cyan-50 p-4">
            <p className="font-semibold text-cyan-950">{moduleActions[dashboardModule.slug].body}</p>
            <Link href={moduleActions[dashboardModule.slug].href} className="mt-3 inline-flex rounded-md bg-cyan-900 px-4 py-2 text-sm font-semibold text-white">
              {moduleActions[dashboardModule.slug].label}
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
