# Build Notes

## Setup Decisions

- Created a separate local app folder named `launchpad-marketing-hub`.
- Public product/app name: Simple Marketing HQ.
- Main deployment URL: simplemarketinghq.com.
- Positioning: AI marketing advisor for small businesses.
- LaunchPad is reserved for the internal diagnostic/advisor system inside the app.
- Chosen stack: Next.js, TypeScript, Tailwind CSS, App Router, Supabase-ready helpers, and Vercel-ready defaults.
- PWA-first foundation includes manifest metadata, app icon placeholders, mobile viewport support, and installable app naming.
- Current build target is a sellable SaaS MVP foundation with public website, account-ready flows, saved diagnostic fallback, customer dashboard, check-ins, content engine, visitor/referral placeholders, and subscription-ready structure.

## Installed Packages

- Runtime: `next`, `react`, `react-dom`
- Supabase: `@supabase/supabase-js`
- UI helpers: `lucide-react`, `clsx`
- Tooling: `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`

## Current Foundation

- Quiz-style onboarding funnel placeholder
- Website URL input
- LaunchPad Diagnostic flow placeholder
- LaunchPad Growth Score placeholder
- LaunchPad Action Plan placeholder
- LaunchPad Recommendations output
- Lead capture/account creation-ready panel
- LaunchPad Advisor dashboard placeholder
- RB2B tracking-ready component and environment variable
- Supabase-ready client/server helper files
- Exact Supabase SQL is documented in `docs/SQL_REQUIRED.md`.
- Local browser storage is used as a fallback until Supabase environment variables and SQL are configured.

## Next Implementation Steps

- Paste the full master prompt into `docs/PRODUCT_BRIEF.md`.
- Define the onboarding question set and scoring model.
- Add Supabase schema once data requirements are known.
- Connect the LaunchPad Diagnostic flow to OpenAI after prompt and data contracts are finalized.
- Add authentication and lead capture persistence.
- Add the real RB2B script ID in environment variables when available.
