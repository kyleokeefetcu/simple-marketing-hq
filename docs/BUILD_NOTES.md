# Build Notes

## Setup Decisions

- Created a separate local app folder named `launchpad-marketing-hub`.
- Public product/app name: Simple Marketing HQ.
- Main deployment URL: simplemarketinghq.com.
- Positioning: AI marketing advisor and marketing foundation command center for small businesses.
- LaunchPad is reserved for the internal diagnostic/advisor system inside the app.
- Chosen stack: Next.js, TypeScript, Tailwind CSS, App Router, Supabase-ready helpers, and Vercel-ready defaults.
- PWA-first foundation includes manifest metadata, app icons, mobile viewport support, and installable app naming.
- Current build target is a sellable SaaS product foundation with public website, account-ready flows, saved diagnostic fallback, command-center dashboard, offer builder, message builder, strategy map, marketing schedule, research hub, advisor next action, content engine, visitor/referral workflows, and subscription-ready structure.

## Installed Packages

- Runtime: `next`, `react`, `react-dom`
- Supabase: `@supabase/supabase-js`
- UI helpers: `lucide-react`, `clsx`
- Tooling: `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`

## Current Foundation

- Quiz-style onboarding funnel
- Website URL input
- LaunchPad Diagnostic flow
- LaunchPad Growth Score
- LaunchPad Action Plan
- ICP Builder / Audience Match starter with industry-aware recommendations
- LaunchPad Recommendations output
- Offer Builder starter
- Message Builder starter
- Strategy Map starter
- Marketing Schedule starter
- Research Hub starter
- Advisor next-action page
- Lead capture/account creation-ready panel
- Logged-in marketing command center dashboard with desktop side navigation, mobile core navigation, Business / Client switcher, KPI tiles, Next Action panel, square utility launcher cards, recent work, and channel deployment reminder.
- RB2B browser tracking for `simplemarketinghq.com` remains disabled unless `NEXT_PUBLIC_RB2B_SCRIPT_ID` is configured.
- Customer/client website visitor tracking is disabled until RB2B partner/OEM approval and domain configuration rules are confirmed.
- RB2B API access is prepared server-side with `RB2B_API_KEY`, without live API calls yet.
- Supabase-ready client/server helper files
- Exact Supabase SQL is documented in `docs/SQL_REQUIRED.md`.
- Local browser storage is used as a fallback until Supabase environment variables and SQL are configured.

## Next Implementation Steps

- Paste the full master prompt into `docs/PRODUCT_BRIEF.md`.
- Deepen the scoring model across offer clarity, audience clarity, message clarity, conversion readiness, lead capture, follow-up, content consistency, channel readiness, proof/trust, and next-action clarity.
- Connect the LaunchPad Diagnostic flow to OpenAI after prompt and data contracts are finalized.
- Add persistence for generated offer, strategy, content, advisor, and recommendation assets when the data contract is finalized.
- Add persistence for generated message, schedule, research, and saved/exported asset records when the data contract is finalized.
- Add the real RB2B script ID in `NEXT_PUBLIC_RB2B_SCRIPT_ID` only when the `reb2b.load("...")` browser snippet is available for `simplemarketinghq.com`.
- Keep the private RB2B API key in `RB2B_API_KEY` only; do not expose it to the browser.
- Confirm RB2B API Partner or OEM Partner terms before building customer/client website tracking, domain registration, customer scripts, or webhook ingestion.
