"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import {
  BarChart3,
  BookOpenText,
  Bot,
  Building2,
  CalendarDays,
  ClipboardList,
  Compass,
  FileText,
  Home,
  Lightbulb,
  LogOut,
  MessageCircle,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { brand } from "@/lib/brand";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  createBusiness,
  getBusinesses,
  getSavedDiagnostics,
  type BusinessSummary,
  type SavedDiagnosticSummary,
} from "@/lib/supabase/diagnostics";

type Utility = {
  title: string;
  shortTitle: string;
  href: string;
  body: string;
  icon: ReactNode;
  accent: string;
};

const navItems: Utility[] = [
  {
    title: "Command Center",
    shortTitle: "Home",
    href: "/dashboard",
    body: "Your marketing home base.",
    icon: <Home size={19} />,
    accent: "bg-cyan-900 text-white",
  },
  {
    title: "LaunchPad Diagnostic",
    shortTitle: "Diagnostic",
    href: "/diagnostic",
    body: "Run or update the intake layer.",
    icon: <ClipboardList size={19} />,
    accent: "bg-slate-900 text-white",
  },
  {
    title: "Growth Score & Suggestions",
    shortTitle: "Score",
    href: "/growth-score",
    body: "Review foundation scores and bottlenecks.",
    icon: <BarChart3 size={19} />,
    accent: "bg-emerald-700 text-white",
  },
  {
    title: "ICP Builder / Audience Match",
    shortTitle: "ICP",
    href: "/icp-builder",
    body: "Define best-fit and bad-fit customers.",
    icon: <Target size={19} />,
    accent: "bg-indigo-700 text-white",
  },
  {
    title: "Offer Builder",
    shortTitle: "Offer",
    href: "/offer-builder",
    body: "Shape value, risk reducers, and CTA.",
    icon: <Rocket size={19} />,
    accent: "bg-orange-700 text-white",
  },
  {
    title: "Message Builder",
    shortTitle: "Message",
    href: "/message-builder",
    body: "Turn the offer into sharper copy.",
    icon: <MessageCircle size={19} />,
    accent: "bg-sky-700 text-white",
  },
  {
    title: "Content Engine",
    shortTitle: "Content",
    href: "/content-engine",
    body: "Generate hooks, posts, scripts, and campaigns.",
    icon: <MessageSquare size={19} />,
    accent: "bg-fuchsia-700 text-white",
  },
  {
    title: "Strategy Map",
    shortTitle: "Strategy",
    href: "/strategy-map",
    body: "Choose the next 7 and 30 day moves.",
    icon: <Compass size={19} />,
    accent: "bg-teal-700 text-white",
  },
  {
    title: "Marketing Schedule",
    shortTitle: "Schedule",
    href: "/marketing-schedule",
    body: "Create a practical weekly rhythm.",
    icon: <CalendarDays size={19} />,
    accent: "bg-lime-700 text-white",
  },
  {
    title: "Research Hub",
    shortTitle: "Research",
    href: "/research-hub",
    body: "Research pains, competitors, FAQs, and angles.",
    icon: <Search size={19} />,
    accent: "bg-violet-700 text-white",
  },
  {
    title: "LaunchPad Advisor",
    shortTitle: "Advisor",
    href: "/advisor",
    body: "Get the next action and execution steps.",
    icon: <Bot size={19} />,
    accent: "bg-cyan-800 text-white",
  },
  {
    title: "Recommendations",
    shortTitle: "Recs",
    href: "/recommendations",
    body: "Choose outside tools after the foundation is clear.",
    icon: <Lightbulb size={19} />,
    accent: "bg-amber-700 text-white",
  },
  {
    title: "Visitor Intelligence",
    shortTitle: "Visitors",
    href: "/dashboard/website",
    body: "Review conversion and visitor-intel readiness.",
    icon: <Users size={19} />,
    accent: "bg-slate-700 text-white",
  },
  {
    title: "Referrals",
    shortTitle: "Referrals",
    href: "/dashboard/referrals",
    body: "Build referral-ready business profiles.",
    icon: <Building2 size={19} />,
    accent: "bg-rose-700 text-white",
  },
  {
    title: "Settings / Billing",
    shortTitle: "Settings",
    href: "/settings",
    body: "Manage account and plan readiness.",
    icon: <Settings size={19} />,
    accent: "bg-slate-800 text-white",
  },
];

const utilityCards = [
  "Build My Offer",
  "Define My ICP",
  "Create Content",
  "Build Strategy",
  "Plan This Week",
  "Research My Audience",
  "Ask Advisor",
  "View Recommendations",
] as const;

const utilityMap: Record<(typeof utilityCards)[number], Utility> = {
  "Build My Offer": navItems.find((item) => item.href === "/offer-builder")!,
  "Define My ICP": navItems.find((item) => item.href === "/icp-builder")!,
  "Create Content": navItems.find((item) => item.href === "/content-engine")!,
  "Build Strategy": navItems.find((item) => item.href === "/strategy-map")!,
  "Plan This Week": navItems.find((item) => item.href === "/marketing-schedule")!,
  "Research My Audience": navItems.find((item) => item.href === "/research-hub")!,
  "Ask Advisor": navItems.find((item) => item.href === "/advisor")!,
  "View Recommendations": navItems.find((item) => item.href === "/recommendations")!,
};

export function DashboardHome() {
  const [diagnostics, setDiagnostics] = useState<SavedDiagnosticSummary[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(() => getSelectedBusinessId());
  const [newBusinessName, setNewBusinessName] = useState("");
  const [status, setStatus] = useState("Connect Supabase to load your saved command center.");
  const [businessStatus, setBusinessStatus] = useState("");
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setRequiresLogin(true);
        setStatus("Log in to load your saved command center.");
        return;
      }

      try {
        const [savedBusinesses, savedDiagnostics] = await Promise.all([getBusinesses(supabase), getSavedDiagnostics(supabase)]);
        const savedSelectedBusinessId = getSelectedBusinessId();
        const validSelectedBusiness = savedBusinesses.some((business) => business.id === savedSelectedBusinessId);
        const nextSelectedBusinessId = validSelectedBusiness ? savedSelectedBusinessId : savedBusinesses.length === 1 ? savedBusinesses[0].id : "";

        if (nextSelectedBusinessId) {
          window.localStorage.setItem("simple-marketing-hq:selected-business-id", nextSelectedBusinessId);
        }

        setBusinesses(savedBusinesses);
        setSelectedBusinessId(nextSelectedBusinessId);
        setDiagnostics(savedDiagnostics);
        setStatus(savedDiagnostics.length ? "Your latest saved work is loaded." : "Start with a diagnostic or choose a utility to build your foundation.");
      } catch (error) {
        setStatus(`Could not load your saved command center: ${(error as Error).message}`);
      }
    }

    void loadWorkspace();
  }, []);

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? null;
  const scopedDiagnostics = selectedBusinessId ? diagnostics.filter((diagnostic) => diagnostic.businessId === selectedBusinessId) : diagnostics;
  const latestDiagnostic = scopedDiagnostics[0];
  const nextAction = latestDiagnostic?.nextMove ?? "Run the LaunchPad Diagnostic, then use the first result to build your offer and ICP.";
  const nextActionHref = latestDiagnostic ? "/offer-builder" : "/diagnostic";
  const portfolioMode = !selectedBusinessId && businesses.length > 1;

  const recentWork = useMemo(
    () => [
      {
        title: "Latest diagnostic",
        value: latestDiagnostic ? `${latestDiagnostic.businessName} scored ${latestDiagnostic.growthScore ?? "--"}` : "No saved diagnostic yet",
        href: "/growth-score",
      },
      {
        title: "Latest offer asset",
        value: latestDiagnostic ? "Offer starter is ready to shape from diagnostic inputs" : "Build this after your diagnostic",
        href: "/offer-builder",
      },
      {
        title: "Latest content output",
        value: latestDiagnostic ? "Content Engine can generate hooks from your bottleneck" : "Create content once offer and ICP are clearer",
        href: "/content-engine",
      },
      {
        title: "Latest strategy map",
        value: latestDiagnostic ? "Strategy Map can turn this into 7 and 30 day moves" : "Strategy appears after your first diagnostic",
        href: "/strategy-map",
      },
    ],
    [latestDiagnostic],
  );

  function selectBusiness(businessId: string) {
    setSelectedBusinessId(businessId);
    window.localStorage.setItem("simple-marketing-hq:selected-business-id", businessId);
  }

  function clearBusinessSelection() {
    setSelectedBusinessId("");
    window.localStorage.removeItem("simple-marketing-hq:selected-business-id");
  }

  async function logOut() {
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.localStorage.removeItem("simple-marketing-hq:user");
    window.location.href = "/login";
  }

  async function addBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusinessStatus("");
    const name = newBusinessName.trim();
    if (!name) return;

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setBusinessStatus("Connect Supabase before adding a saved Business / Client.");
      return;
    }

    setIsAddingBusiness(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setBusinessStatus("Log in before adding a Business / Client.");
        return;
      }

      const businessId = await createBusiness(supabase, data.user, name);
      const savedBusinesses = await getBusinesses(supabase);
      setBusinesses(savedBusinesses);
      setNewBusinessName("");
      selectBusiness(businessId);
      setBusinessStatus(`${name} added and selected.`);
    } catch (error) {
      setBusinessStatus(`Could not add Business / Client: ${(error as Error).message}`);
    } finally {
      setIsAddingBusiness(false);
    }
  }

  if (requiresLogin) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto grid min-h-screen w-full max-w-4xl place-items-center px-5 py-10">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.appName}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Log in to open your marketing command center.</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Your command center saves Business / Client profiles, diagnostics, action plans, assets, advisor output, and recommendations to your account.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
                Login
              </Link>
              <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-800">
                Create account
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <Link href="/dashboard" className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
              <span className="grid size-10 place-items-center rounded-md bg-cyan-900 text-amber-300">
                <Sparkles size={21} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-950">{brand.appName}</span>
                <span className="block text-xs text-slate-500">Marketing command center</span>
              </span>
            </Link>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => (
                <Link key={item.href} href={scopedHref(item.href, selectedBusinessId)} className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-950">
                  <span className="text-slate-500">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </nav>
            <button onClick={logOut} className="m-3 flex min-h-11 items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-slate-200 bg-white lg:hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-cyan-900 text-amber-300">
                  <Sparkles size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-950">{brand.appName}</span>
                  <span className="block text-xs text-slate-500">Command center</span>
                </span>
              </Link>
              <button onClick={logOut} className="grid size-10 place-items-center rounded-md border border-slate-200 text-slate-700" aria-label="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{brand.appName}</p>
                    <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-slate-950 sm:text-4xl">
                      {selectedBusiness ? `${selectedBusiness.name} marketing command center` : "Your marketing command center"}
                    </h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                      Choose the utility you need right now: offer, ICP, message, content, strategy, schedule, research, advisor, or recommendations. The diagnostic tells us where you are; the command center helps you build what comes next.
                    </p>
                  </div>
                  <Link href={scopedHref("/diagnostic", selectedBusinessId)} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 font-semibold text-white">
                    Start Diagnostic
                  </Link>
                </div>
                <p className="mt-4 rounded-md bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-950">{status}</p>
              </article>

              <BusinessSwitcher
                businesses={businesses}
                selectedBusinessId={selectedBusinessId}
                businessStatus={businessStatus}
                newBusinessName={newBusinessName}
                isAddingBusiness={isAddingBusiness}
                onSelect={selectBusiness}
                onClear={clearBusinessSelection}
                onNameChange={setNewBusinessName}
                onAdd={addBusiness}
              />
            </section>

            {portfolioMode ? (
              <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Business / Client portfolio</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Pick the command center you want to work in.</h2>
                  </div>
                  <button type="button" onClick={clearBusinessSelection} className="text-left text-sm font-semibold text-cyan-800">
                    View all businesses
                  </button>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {businesses.map((business) => {
                    const latestBusinessDiagnostic = diagnostics.find((diagnostic) => diagnostic.businessId === business.id);
                    return (
                      <button key={business.id} type="button" onClick={() => selectBusiness(business.id)} className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">{business.name}</h3>
                            <p className="mt-1 text-sm text-slate-500">{business.websiteUrl || "Website not saved yet"}</p>
                          </div>
                          <span className="rounded-md bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900">
                            {latestBusinessDiagnostic?.growthScore ?? "--"}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-600">
                          <p>Current bottleneck: {latestBusinessDiagnostic?.biggestBottleneck ?? "Diagnostic needed"}</p>
                          <p>Next action: {latestBusinessDiagnostic?.nextMove ?? "Start intake"}</p>
                          <p>Last diagnostic: {latestBusinessDiagnostic ? formatDate(latestBusinessDiagnostic.completedAt) : "Not completed"}</p>
                          <p>Offer status: {latestBusinessDiagnostic ? "Starter ready" : "Needs context"}</p>
                          <p>Content plan status: {latestBusinessDiagnostic ? "Ready for starter ideas" : "Needs offer input"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <KpiTile label="Growth Score" value={latestDiagnostic?.growthScore ? String(latestDiagnostic.growthScore) : "--"} body="One signal, not the whole product." />
              <KpiTile label="Current Bottleneck" value={latestDiagnostic?.biggestBottleneck ?? "Needs diagnostic"} body="The first constraint to remove." />
              <KpiTile label="Next Action" value={latestDiagnostic ? "Ready" : "Start"} body={latestDiagnostic?.nextMove ?? "Run the diagnostic."} />
              <KpiTile label="Assets Created" value={String(scopedDiagnostics.length)} body="Saved diagnostics and starter outputs." />
              <KpiTile label="Content Plan" value={latestDiagnostic ? "Starter" : "Needs input"} body="Generate from offer and ICP." />
              <KpiTile label="Offer Status" value={latestDiagnostic ? "Ready" : "Unscored"} body="Build or sharpen the offer." />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <article className="rounded-lg border border-cyan-200 bg-cyan-950 p-5 text-white shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">Next recommended action</p>
                <h2 className="mt-3 text-2xl font-semibold">{latestDiagnostic ? "Build the next foundation asset." : "Start with the LaunchPad Diagnostic."}</h2>
                <p className="mt-3 text-sm leading-6 text-cyan-50">{nextAction}</p>
                <p className="mt-3 text-sm leading-6 text-cyan-100">
                  Why it matters: more channel activity only helps after the offer, audience, message, and follow-up path are clear enough to convert.
                </p>
                <Link href={scopedHref(nextActionHref, selectedBusinessId)} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 font-semibold text-cyan-950">
                  Open recommended utility
                </Link>
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Channel deployment reminder</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Prepare the rocket ship before takeoff.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Simple Marketing HQ prepares the marketing foundation: ICP, offer, message, strategy, schedule, research, assets, recommendations, and next actions. Deployment still happens through outside channels and tools.
                </p>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                  <p className="rounded-md bg-slate-50 p-3">Cold email tools</p>
                  <p className="rounded-md bg-slate-50 p-3">Social platforms</p>
                  <p className="rounded-md bg-slate-50 p-3">Ad platforms</p>
                  <p className="rounded-md bg-slate-50 p-3">CRM and booking tools</p>
                </div>
              </article>
            </section>

            <section className="mt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Marketing utilities</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Choose the work you need to do now.</h2>
                </div>
                <Link href={scopedHref("/advisor", selectedBusinessId)} className="text-sm font-semibold text-cyan-800">
                  Ask the Advisor
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
                {utilityCards.map((label) => {
                  const utility = utilityMap[label];
                  return (
                    <Link key={label} href={scopedHref(utility.href, selectedBusinessId)} className="group flex aspect-square flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md sm:p-4">
                      <span className={`grid size-11 place-items-center rounded-md ${utility.accent}`}>{utility.icon}</span>
                      <span>
                        <span className="block text-sm font-semibold leading-5 text-slate-950">{label}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{utility.shortTitle}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Recent work</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Pick up where you left off.</h2>
                  </div>
                  <FileText className="text-slate-400" size={24} />
                </div>
                <div className="mt-5 grid gap-3">
                  {recentWork.map((item) => (
                    <Link key={item.title} href={scopedHref(item.href, selectedBusinessId)} className="rounded-md border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.value}</p>
                    </Link>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Saved diagnostics</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Latest LaunchPad context</h2>
                  </div>
                  <BookOpenText className="text-slate-400" size={24} />
                </div>
                <div className="mt-5 grid gap-3">
                  {scopedDiagnostics.slice(0, 3).map((diagnostic) => (
                    <Link key={diagnostic.id} href={scopedHref("/growth-score", selectedBusinessId)} className="rounded-md border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-950">{diagnostic.businessName}</p>
                          <p className="mt-1 text-sm text-slate-500">{formatDate(diagnostic.completedAt)}</p>
                        </div>
                        <span className="rounded-md bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900">{diagnostic.growthScore ?? "--"}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{diagnostic.nextMove}</p>
                    </Link>
                  ))}
                  {!scopedDiagnostics.length ? (
                    <Link href={scopedHref("/diagnostic", selectedBusinessId)} className="rounded-md border border-dashed border-slate-300 p-4 text-sm font-semibold text-cyan-800">
                      Run your first LaunchPad Diagnostic
                    </Link>
                  ) : null}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-2 py-2 shadow-lg lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {[
            navItems[0],
            navItems[1],
            navItems.find((item) => item.href === "/offer-builder")!,
            navItems.find((item) => item.href === "/content-engine")!,
            navItems.find((item) => item.href === "/advisor")!,
          ].map((item) => (
            <Link key={item.href} href={scopedHref(item.href, selectedBusinessId)} className="flex min-h-14 flex-col items-center justify-center rounded-md px-1 text-center text-[11px] font-semibold text-slate-700 hover:bg-cyan-50">
              <span className="mb-1 text-slate-500">{item.icon}</span>
              {item.shortTitle}
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}

function BusinessSwitcher({
  businesses,
  selectedBusinessId,
  businessStatus,
  newBusinessName,
  isAddingBusiness,
  onSelect,
  onClear,
  onNameChange,
  onAdd,
}: {
  businesses: BusinessSummary[];
  selectedBusinessId: string;
  businessStatus: string;
  newBusinessName: string;
  isAddingBusiness: boolean;
  onSelect: (businessId: string) => void;
  onClear: () => void;
  onNameChange: (value: string) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Business / Client</p>
      <div className="mt-3 grid gap-3">
        <select
          value={selectedBusinessId}
          onChange={(event) => (event.target.value ? onSelect(event.target.value) : onClear())}
          className="min-h-12 w-full rounded-md border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
        >
          <option value="">All businesses / clients</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
        <form onSubmit={onAdd} className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={newBusinessName}
            onChange={(event) => onNameChange(event.target.value)}
            className="min-h-12 rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
            placeholder="Add Business / Client"
          />
          <button disabled={isAddingBusiness || !newBusinessName.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={18} />
            {isAddingBusiness ? "Adding" : "Add"}
          </button>
        </form>
        <button type="button" onClick={onClear} className="text-left text-sm font-semibold text-cyan-800">
          View all businesses / clients
        </button>
        <p className="text-xs leading-5 text-slate-500">Free Diagnostic includes 1 business. Paid plans expand to 3, 10, or 25 businesses / clients.</p>
        {businessStatus ? <p className="text-sm font-semibold text-cyan-800">{businessStatus}</p> : null}
      </div>
    </article>
  );
}

function KpiTile({ label, value, body }: { label: string; value: string; body: string }) {
  return (
    <article className="min-h-32 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 line-clamp-2 text-2xl font-semibold leading-7 text-slate-950">{value}</p>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{body}</p>
    </article>
  );
}

function getSelectedBusinessId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("simple-marketing-hq:selected-business-id") ?? "";
}

function scopedHref(href: string, businessId: string) {
  return businessId ? `${href}?businessId=${encodeURIComponent(businessId)}` : href;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
