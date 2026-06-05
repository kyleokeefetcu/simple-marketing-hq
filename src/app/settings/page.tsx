import { AppHeader } from "@/components/app-header";
import { brand } from "@/lib/brand";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto w-full max-w-4xl px-5 py-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">Settings</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">{brand.appName} account settings</h1>
        <div className="mt-6 grid gap-4">
          {["Business profile", "Account email", "Supabase auth connection", "RB2B script configuration", "OpenAI API provider", "Notification preferences"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">MVP placeholder ready for production settings.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
