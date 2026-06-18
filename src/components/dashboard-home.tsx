"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import {
  BarChart3,
  Beaker,
  Bot,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Compass,
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
import { useEffect, useState } from "react";
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
  { title: "Command Center", shortTitle: "Home", href: "/dashboard", body: "Your marketing home base.", icon: <Home size={19} />, accent: "bg-cyan-900 text-white" },
  { title: "LaunchPad Diagnostic", shortTitle: "Diagnostic", href: "/diagnostic", body: "Run or update the intake layer.", icon: <ClipboardList size={19} />, accent: "bg-slate-900 text-white" },
  { title: "Marketing Lab", shortTitle: "Lab", href: "/marketing-lab", body: "Generate consultant-grade marketing assets.", icon: <Beaker size={19} />, accent: "bg-rose-700 text-white" },
  { title: "Business Brain", shortTitle: "Brain", href: "/business-brain", body: "Confirm the facts AI should trust.", icon: <Building2 size={19} />, accent: "bg-cyan-700 text-white" },
  { title: "Growth Score & Suggestions", shortTitle: "Score", href: "/growth-score", body: "Review foundation scores and bottlenecks.", icon: <BarChart3 size={19} />, accent: "bg-emerald-700 text-white" },
  { title: "Audience HQ", shortTitle: "ICP", href: "/icp-builder", body: "Keep the current best-fit customer recommendation.", icon: <Target size={19} />, accent: "bg-indigo-700 text-white" },
  { title: "Offer HQ", shortTitle: "Offer", href: "/offer-builder", body: "Keep the current offer, CTA, and proof point.", icon: <Rocket size={19} />, accent: "bg-orange-700 text-white" },
  { title: "Messaging HQ", shortTitle: "Message", href: "/message-builder", body: "Keep the current headline, pitch, and CTA.", icon: <MessageCircle size={19} />, accent: "bg-sky-700 text-white" },
  { title: "Content HQ", shortTitle: "Content", href: "/content-engine", body: "Keep themes, hooks, posts, and email ideas ready.", icon: <MessageSquare size={19} />, accent: "bg-fuchsia-700 text-white" },
  { title: "Strategy HQ", shortTitle: "Strategy", href: "/strategy-map", body: "Choose what to build first and what to ignore.", icon: <Compass size={19} />, accent: "bg-teal-700 text-white" },
  { title: "Execution HQ", shortTitle: "Schedule", href: "/marketing-schedule", body: "Create a practical weekly rhythm.", icon: <CalendarDays size={19} />, accent: "bg-lime-700 text-white" },
  { title: "Research HQ", shortTitle: "Research", href: "/research-hub", body: "Research pains, competitors, FAQs, and angles.", icon: <Search size={19} />, accent: "bg-violet-700 text-white" },
  { title: "LaunchPad Advisor", shortTitle: "Advisor", href: "/advisor", body: "Get the next action and execution steps.", icon: <Bot size={19} />, accent: "bg-cyan-800 text-white" },
  { title: "Tool Stack HQ", shortTitle: "Tools", href: "/recommendations", body: "Choose outside tools after the foundation is clear.", icon: <Lightbulb size={19} />, accent: "bg-amber-700 text-white" },
  { title: "Channel Deployment HQ", shortTitle: "Deploy", href: "/channel-deployment", body: "Choose where to deploy first and how to run it outside the app.", icon: <Rocket size={19} />, accent: "bg-stone-700 text-white" },
  { title: "Visitor Intelligence", shortTitle: "Visitors", href: "/dashboard/website", body: "Review conversion and visitor-intel readiness.", icon: <Users size={19} />, accent: "bg-slate-700 text-white" },
  { title: "Referrals", shortTitle: "Referrals", href: "/dashboard/referrals", body: "Build referral-ready business profiles.", icon: <Building2 size={19} />, accent: "bg-rose-700 text-white" },
  { title: "Settings / Billing", shortTitle: "Settings", href: "/settings", body: "Manage account and plan readiness.", icon: <Settings size={19} />, accent: "bg-slate-800 text-white" },
];

const utilityCards = [
  "Offer HQ",
  "Audience HQ",
  "Messaging HQ",
  "Content HQ",
  "Strategy HQ",
  "Plan This Week",
  "Research HQ",
  "Ask Advisor",
  "Tool Stack HQ",
  "Channel Deployment HQ",
] as const;

const utilityMap: Record<(typeof utilityCards)[number], Utility> = {
  "Offer HQ": navItems.find((item) => item.href === "/offer-builder")!,
  "Audience HQ": navItems.find((item) => item.href === "/icp-builder")!,
  "Messaging HQ": navItems.find((item) => item.href === "/message-builder")!,
  "Content HQ": navItems.find((item) => item.href === "/content-engine")!,
  "Strategy HQ": navItems.find((item) => item.href === "/strategy-map")!,
  "Plan This Week": navItems.find((item) => item.href === "/marketing-schedule")!,
  "Research HQ": navItems.find((item) => item.href === "/research-hub")!,
  "Ask Advisor": navItems.find((item) => item.href === "/advisor")!,
  "Tool Stack HQ": navItems.find((item) => item.href === "/recommendations")!,
  "Channel Deployment HQ": navItems.find((item) => item.href === "/channel-deployment")!,
};

const utilityLabels: Record<(typeof utilityCards)[number], string> = {
  "Offer HQ": "Approve or improve the offer.",
  "Audience HQ": "Review the best-fit customer.",
  "Messaging HQ": "Use sharper words.",
  "Content HQ": "Make posts, hooks, and ideas.",
  "Strategy HQ": "Choose the right order.",
  "Plan This Week": "Turn it into a rhythm.",
  "Research HQ": "Learn pains and objections.",
  "Ask Advisor": "Get the next move.",
  "Tool Stack HQ": "Choose tools when ready.",
  "Channel Deployment HQ": "Plan where to deploy first.",
};

export function DashboardHome() {
  const [diagnostics, setDiagnostics] = useState<SavedDiagnosticSummary[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
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
  const recommendedAction = latestDiagnostic
    ? {
        title: "Start with your offer.",
        why: "Your content and channels work better when the offer is clear.",
        steps: ["Review what you sell", "Sharpen the outcome", "Create your first offer asset"],
        href: "/offer-builder",
        cta: "Open Offer HQ",
      }
    : {
        title: "Run your LaunchPad Diagnostic.",
        why: "Simple Marketing HQ needs a little context before it can recommend the right first asset.",
        steps: ["Enter your website", "Confirm what we find", "Get your first action plan"],
        href: "/diagnostic/run?fresh=1",
        cta: "Run New Diagnostic",
      };
  const portfolioMode = !selectedBusinessId && businesses.length > 1;

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

          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="hidden size-11 place-items-center rounded-md bg-cyan-900 text-amber-300 sm:grid">
                  <Sparkles size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{brand.appName}</p>
                  <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                    {selectedBusiness ? `${selectedBusiness.name} command center` : "Marketing command center"}
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-slate-600">A marketing team in an app, ready when you have a few minutes.</p>
                  <p className="mt-1 text-xs font-semibold text-cyan-800">{status}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Link href={scopedHref("/diagnostic/run?fresh=1", selectedBusinessId)} className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-900 px-5 py-3 text-sm font-semibold text-white">
                  Run New Diagnostic
                </Link>
                <BusinessSwitcher
                  businesses={businesses}
                  selectedBusinessId={selectedBusinessId}
                  selectedBusinessName={selectedBusiness?.name ?? ""}
                  businessStatus={businessStatus}
                  newBusinessName={newBusinessName}
                  isAddingBusiness={isAddingBusiness}
                  onSelect={selectBusiness}
                  onClear={clearBusinessSelection}
                  onNameChange={setNewBusinessName}
                  onAdd={addBusiness}
                />
              </div>
            </section>

            <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Marketing utilities</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">Choose the work you need to do now.</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    Pick a utility. Simple Marketing HQ will guide the steps and generate the asset.
                  </p>
                </div>
                <Link href={scopedHref("/advisor", selectedBusinessId)} className="text-sm font-semibold text-cyan-800">
                  Ask the Advisor
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {utilityCards.map((label) => {
                  const utility = utilityMap[label];
                  return (
                    <Link key={label} href={scopedHref(utility.href, selectedBusinessId)} className="group flex min-h-[126px] flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md sm:min-h-[136px]">
                      <span className={`grid size-10 place-items-center rounded-md ${utility.accent}`}>{utility.icon}</span>
                      <span className="mt-3 block text-sm font-semibold leading-5 text-slate-950 sm:text-[15px]">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{utilityLabels[label]}</span>
                    </Link>
                  );
                })}
              </div>
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
                          <p>Offer status: {latestBusinessDiagnostic ? "Foundation ready to refine" : "Needs context"}</p>
                          <p>Content plan status: {latestBusinessDiagnostic ? "Ready for focused ideas" : "Needs offer input"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <article className="rounded-lg border border-cyan-200 bg-cyan-950 p-5 text-white shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">Next recommended action</p>
                <h2 className="mt-3 text-2xl font-semibold">{recommendedAction.title}</h2>
                <p className="mt-3 text-sm leading-6 text-cyan-50">{recommendedAction.why}</p>
                <div className="mt-4 grid gap-2">
                  {recommendedAction.steps.map((step, index) => (
                    <p key={step} className="rounded-md bg-white/10 p-3 text-sm leading-6 text-cyan-50">
                      {index + 1}. {step}
                    </p>
                  ))}
                </div>
                <Link href={scopedHref(recommendedAction.href, selectedBusinessId)} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 font-semibold text-cyan-950">
                  {recommendedAction.cta}
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
  selectedBusinessName,
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
  selectedBusinessName: string;
  businessStatus: string;
  newBusinessName: string;
  isAddingBusiness: boolean;
  onSelect: (businessId: string) => void;
  onClear: () => void;
  onNameChange: (value: string) => void;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <details className="relative">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm marker:hidden">
        <span className="truncate">{selectedBusinessName ? `Business: ${selectedBusinessName}` : "Business: All businesses / clients"}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-[min(92vw,360px)] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">Active Business / Client</p>
        <p className="px-2 pb-2 text-sm font-semibold text-slate-950">{selectedBusinessName || "All businesses / clients"}</p>
        <div className="mt-2 grid gap-1">
          <button type="button" onClick={onClear} className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${selectedBusinessId ? "text-slate-700 hover:bg-cyan-50" : "bg-cyan-50 text-cyan-950"}`}>
            View all businesses / clients
          </button>
          {businesses.map((business) => (
            <button
              key={business.id}
              type="button"
              onClick={() => onSelect(business.id)}
              className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${selectedBusinessId === business.id ? "bg-cyan-50 text-cyan-950" : "text-slate-700 hover:bg-cyan-50"}`}
            >
              {business.name}
            </button>
          ))}
        </div>
        <form onSubmit={onAdd} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
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
        <p className="text-xs leading-5 text-slate-500">Free Diagnostic includes 1 business. Paid plans expand to 3, 10, or 25 businesses / clients.</p>
        {businessStatus ? <p className="text-sm font-semibold text-cyan-800">{businessStatus}</p> : null}
      </div>
    </details>
  );
}

function getSelectedBusinessId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("simple-marketing-hq:selected-business-id") ?? "";
}

function scopedHref(href: string, businessId: string) {
  if (!businessId) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}businessId=${encodeURIComponent(businessId)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
