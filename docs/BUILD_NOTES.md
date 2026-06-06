# Build Notes

## Setup Decisions

- Created a separate local app folder named `launchpad-marketing-hub`.
- Public product/app name: Simple Marketing HQ.
- Main deployment URL: simplemarketinghq.com.
- Positioning: AI marketing advisor for small businesses.
- LaunchPad is reserved for the internal diagnostic/advisor system inside the app.
- Chosen stack: Next.js, TypeScript, Tailwind CSS, App Router, Supabase-ready helpers, and Vercel-ready defaults.
- PWA-first foundation includes manifest metadata, app icons, mobile viewport support, and installable app naming.
- Current build target is a sellable SaaS product foundation with public website, account-ready flows, saved diagnostic fallback, customer dashboard, check-ins, content engine, visitor/referral workflows, and subscription-ready structure.

## Installed Packages

- Runtime: `next`, `react`, `react-dom`
- Supabase: `@supabase/supabase-js`
- UI helpers: `lucide-react`, `clsx`
- Tooling: `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`

## Current Foundation

- Quiz-style onboarding funnel
- Website URL input and server-side URL review route
- LaunchPad Diagnostic flow
- LaunchPad Growth Score
- LaunchPad Action Plan
- LaunchPad Recommendations output
- Lead capture/account creation-ready panel
- LaunchPad Advisor dashboard
- RB2B browser tracking remains disabled unless `NEXT_PUBLIC_RB2B_SCRIPT_ID` is configured.
- RB2B API access is prepared server-side with `RB2B_API_KEY`, without live API calls yet.
- Supabase-ready client/server helper files
- Exact Supabase SQL is documented in `docs/SQL_REQUIRED.md`.
- Local browser storage is used only as a progress/fallback layer when Supabase is unavailable.

## Next Implementation Steps

- Connect the LaunchPad Diagnostic flow to OpenAI after prompt and data contracts are finalized.
- Add the real RB2B script ID in `NEXT_PUBLIC_RB2B_SCRIPT_ID` only when the `reb2b.load("...")` browser snippet is available.
- Keep the private RB2B API key in `RB2B_API_KEY` only; do not expose it to the browser.
- Connect Stripe checkout before showing paid upgrade actions in the normal user interface.
