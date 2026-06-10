# Build Notes

## Setup Decisions

- Created a separate local app folder named `launchpad-marketing-hub`.
- Public product/app name: Simple Marketing HQ.
- Main deployment URL: simplemarketinghq.com.
- Positioning: AI marketing advisor and marketing foundation command center for small businesses.
- LaunchPad is reserved for the internal diagnostic/advisor system inside the app.
- Chosen stack: Next.js, TypeScript, Tailwind CSS, App Router, Supabase-ready helpers, and Vercel-ready defaults.
- PWA-first foundation includes manifest metadata, app icons, mobile viewport support, and installable app naming.
- Current build target is a sellable SaaS product foundation with public website, account-ready flows, saved diagnostic fallback, action-first command-center dashboard, persisted ICP/offer/message/content/strategy/schedule/research/recommendation assets, persisted advisor threads/messages, visitor/referral workflows, and subscription-ready structure.

## Installed Packages

- Runtime: `next`, `react`, `react-dom`
- Supabase: `@supabase/supabase-js`
- UI helpers: `lucide-react`, `clsx`
- Tooling: `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`

## Current Foundation

- AI-first LaunchPad Diagnostic intake with early website URL input, visible website analysis, editable confirmation cards, and short gap-question flow
- Structured website analysis endpoint for inferred business profile fields
- LaunchPad Growth Score
- LaunchPad Action Plan
- ICP Builder / Audience Match with industry-aware output, per-business save action, and saved history
- LaunchPad Recommendations output with per-business save action and saved history
- Offer Builder with per-business save action and saved history
- Message Builder with per-business save action and saved history
- Strategy Map with per-business save action and saved history
- Marketing Schedule with per-business save action and saved history
- Research Hub with per-business save action and saved history
- Advisor next-action page with user question input, per-business thread/message persistence, and saved advisor history
- Lead capture/account creation-ready panel
- Logged-in marketing command center dashboard with desktop side navigation, mobile core navigation, top-bar Business / Client dropdown, Run New Diagnostic access, compact app-style utility launcher buttons as the primary view, Next Recommended Action panel, and channel deployment reminder.
- RB2B browser tracking for `simplemarketinghq.com` remains disabled unless `NEXT_PUBLIC_RB2B_SCRIPT_ID` is configured.
- Customer/client website visitor tracking is disabled until RB2B partner/OEM approval and domain configuration rules are confirmed.
- RB2B API access is prepared server-side with `RB2B_API_KEY`, without live API calls yet.
- Supabase-ready client/server helper files
- Exact Supabase SQL is documented in `docs/SQL_REQUIRED.md`, including `marketing_assets`, `advisor_threads`, and `advisor_messages`.
- Local browser storage is used as a fallback until Supabase environment variables and SQL are configured.

## Next Implementation Steps

- Paste the full master prompt into `docs/PRODUCT_BRIEF.md`.
- Deepen the scoring model across offer clarity, audience clarity, message clarity, conversion readiness, lead capture, follow-up, content consistency, channel readiness, proof/trust, and next-action clarity.
- Connect the LaunchPad Diagnostic flow to OpenAI after prompt and data contracts are finalized.
- Add edit/export actions for saved command-center assets.
- Add OpenAI-backed generation for command-center tools after prompt and JSON contracts are finalized.
- Add the real RB2B script ID in `NEXT_PUBLIC_RB2B_SCRIPT_ID` only when the `reb2b.load("...")` browser snippet is available for `simplemarketinghq.com`.
- Keep the private RB2B API key in `RB2B_API_KEY` only; do not expose it to the browser.
- Confirm RB2B API Partner or OEM Partner terms before building customer/client website tracking, domain registration, customer scripts, or webhook ingestion.
