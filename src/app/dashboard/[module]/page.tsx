import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { dashboardModules } from "@/lib/launchpad";

const moduleDetails: Record<string, string[]> = {
  message: ["Offer", "Homepage headline", "Positioning", "Elevator pitch", "Follow-up scripts"],
  customers: ["Ideal customer", "Pain points", "Customer goals", "Neighborhoods or industries", "Best referral sources"],
  website: ["Website diagnosis", "CTA review", "Trust signals", "Lead capture", "Fred AI/chat placeholder", "RB2B visitor intelligence placeholder"],
  visibility: ["SEO", "Google Business Profile", "Social content", "Paid ads", "Content recommendations"],
  referrals: ["Referral partner profile", "Shareable business profile", "Ideal referral description", "Referral tracking foundation", "Power team placeholder"],
  "follow-up": ["Speed-to-lead", "Missed opportunity warnings", "Suggested follow-up scripts", "Email/SMS sequence placeholders", "Response recommendations"],
  momentum: ["Leads this week", "Booked calls", "Referral activity", "Repeat visitors", "Recommended next action"],
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
                <p className="mt-2 text-sm leading-6 text-slate-600">MVP placeholder ready for saved data, AI recommendations, and paid-plan gates.</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
