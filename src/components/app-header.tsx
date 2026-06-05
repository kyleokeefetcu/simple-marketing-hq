import Link from "next/link";
import { LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { brand } from "@/lib/brand";

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-cyan-900 text-amber-300">
            <Sparkles size={21} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">{brand.appName}</span>
            <span className="block text-xs text-slate-500">Your business growth dashboard</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="grid size-10 place-items-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
            aria-label="Dashboard"
          >
            <LayoutDashboard size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/login"
            className="grid size-10 place-items-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
            aria-label="Logout"
          >
            <LogOut size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
