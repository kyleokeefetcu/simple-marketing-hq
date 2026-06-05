import type { ReactNode } from "react";

export function StatCard({
  icon,
  label,
  value,
  body,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-slate-100 text-cyan-900">{icon}</div>
        <p className="text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
