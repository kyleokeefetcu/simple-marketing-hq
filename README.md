# Simple Marketing HQ

Simple Marketing HQ is a PWA-first AI marketing advisor and marketing foundation command center for small businesses, built with Next.js, TypeScript, Tailwind CSS, Supabase-ready helpers, and Vercel deployment defaults.

LaunchPad is the internal diagnostic and advisor experience inside the app, including the LaunchPad Diagnostic, LaunchPad Growth Score, LaunchPad Action Plan, LaunchPad Advisor, and LaunchPad Recommendations.

The product prepares the marketing foundation before channel takeoff: offer, message, audience, strategy, content, schedule, campaign plan, research, assets, recommendations, and next actions. External tools and channels handle deployment after the foundation is ready.

## Local Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add real values when you are ready to connect Supabase, OpenAI, and RB2B.

Supabase setup details live in `docs/SUPABASE_CONNECTION.md`.
RB2B setup details live in `docs/RB2B_SETUP.md`.

## Product Direction

Use `docs/PRODUCT_BRIEF.md` as the source of truth for product direction and implementation priorities.
