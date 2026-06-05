import Link from "next/link";
import { Sparkles } from "lucide-react";
import { brand, navLinks } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-cyan-900 text-amber-300">
            <Sparkles size={21} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">{brand.appName}</span>
            <span className="block text-xs text-slate-500">{brand.positioning}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-cyan-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/diagnostic"
          className="rounded-md bg-cyan-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800"
        >
          Start Diagnostic
        </Link>
      </div>
    </header>
  );
}
