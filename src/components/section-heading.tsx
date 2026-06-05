export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-cyan-800">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-600">{body}</p>
    </div>
  );
}
