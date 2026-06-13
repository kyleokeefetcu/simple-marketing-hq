# Build Notes

## Setup Decisions

- Created a separate local app folder named `launchpad-marketing-hub`.
- Public product/app name: Simple Marketing HQ.
- Main deployment URL: simplemarketinghq.com.
- Positioning: AI marketing team and simple command center for small businesses, with an AI CMO, practical utilities, and a living marketing foundation.
- LaunchPad is reserved for the internal diagnostic/advisor system inside the app.
- Chosen stack: Next.js, TypeScript, Tailwind CSS, App Router, Supabase-ready helpers, and Vercel-ready defaults.
- PWA-first foundation includes manifest metadata, app icons, mobile viewport support, and installable app naming.
- Current build target is a sellable SaaS product foundation with public website, account-ready flows, saved diagnostic fallback, action-first command-center dashboard, persisted audience/offer/message/content/strategy/schedule/research/recommendation assets, persisted advisor threads/messages, visitor/referral workflows, and subscription-ready structure.

## Installed Packages

- Runtime: `next`, `react`, `react-dom`
- Supabase: `@supabase/supabase-js`
- UI helpers: `lucide-react`, `clsx`
- Tooling: `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `eslint`, `eslint-config-next`

## Current Foundation

- AI-first LaunchPad Diagnostic intake with early website URL input, multi-page website analysis, confidence-gated editable confirmation cards, and short current-state gap questions that avoid asking the user to choose the marketing strategy
- Public homepage now positions Simple Marketing HQ as an AI marketing team and command center: the diagnostic starts the work, the AI CMO recommends the next best move, utilities build the assets, and the living foundation improves over time.
- LaunchPad Diagnostic HQ at `/diagnostic` with latest diagnostic snapshot, current browser draft, Run New Diagnostic, Continue Draft, archived diagnostic history, and simple comparison against the prior snapshot
- Fresh diagnostic funnel at `/diagnostic/run?fresh=1`; draft resume is explicit through `/diagnostic/run?resume=1`
- Diagnostic output now infers the likely customer desired outcome, recommended first channel to prepare for, why that channel fits, preparation steps, and what channel to ignore for now
- Structured website analysis endpoint for inferred business profile fields, same-domain page discovery, sitemap discovery, source evidence, and field-level confidence
- LaunchPad Growth Score
- LaunchPad Action Plan
- Shared living-asset utility workflow for Audience HQ, Offer HQ, Messaging HQ, Content HQ, Strategy HQ, Execution HQ, Research HQ, and Tool Stack HQ
- Each utility now uses a compact tile-based workspace where clicking a tile opens a focused AI-first work session instead of rendering a large selected-block content panel
- The main utility page now prioritizes work-block tiles, a short Next Best Move strip, and the AI Working Session
- Content HQ includes Current Plan, Content Themes, Post Ideas, Create Post, Email Ideas, Video Scripts, Hooks, Campaign Results, Tests, and History tiles
- History and saved versions now live inside the History tile instead of a permanent bottom section
- Each utility uses selected Business / Client context, latest diagnostic, saved assets, and new raw feedback so the app recommends while the owner approves, corrects, or feeds better information
- Utility output is intentionally shorter and copy/paste-ready: best recommendation first, compressed customer-facing language, why it works, where to use it, and one next action
- Utility assets continue to save to Supabase through `marketing_assets` with the selected `business_id`, `role_id`, `asset_type`, structured input, structured output, summary, status, and history
- Audience HQ maintains the current best-fit customer recommendation, buyer pain, buying trigger, poor-fit filter, and belief needed before action
- Offer HQ maintains the current recommended offer, primary CTA, proof point, best-fit buyer, main problem, main outcome, and angle
- Messaging HQ maintains the current headline, subheadline, CTA, short pitch, follow-up opener, and short customer-facing copy
- Content HQ maintains active content themes, this week's recommended content, hooks, posts, email ideas, and publishing action
- Strategy HQ maintains the current priority, bottleneck, what to ignore, channel order, and next actions
- Execution HQ maintains this week's plan, tasks, content, follow-up action, review rhythm, and what to skip
- Research HQ maintains current market insights, objections, proof gaps, competitor notes, and language patterns
- Tool Stack HQ maintains recommended outside tools/channels only after the marketing foundation is clear enough for deployment
- Advisor next-action page with user question input, selected business context, current bottleneck, exact steps, copy/paste working note, per-business thread/message persistence, and saved advisor history
- Internal AI prompt-pack registry with role IDs, role-specific system prompts, required context, input fields, output schemas, asset types, and suggested next utilities
- Marketing Lab routes for Buyer Psychology Audit, Marketing Reality Check, Market Demand Check, Problem Narrative Builder, Messaging Sequence Builder, and Buyer Messaging Engine
- Marketing Lab audit workflow with selected Business / Client context, short input form, structured output, before/after, next 3 actions, save action, and saved history
- Market Demand Check prompt pack now includes offer-demand input fields, demand read JSON, demand diagnosis, buyer motivation, offer improvement, before/after, next 3 actions, and Offer Builder handoff actions
- Buyer Psychology Audit prompt pack now includes page/message review input fields, buyer psychology summary JSON, current-state read, psychology findings, before/after improvements, top changes, next 3 actions, and Message Builder/Content Engine handoff actions
- Buyer Messaging Engine prompt pack now includes messaging-use input fields, buyer-state messaging strategy, current/improved copy, core message assets, channel versions, objection responses, copy/paste blocks, next 3 actions, Content Engine/Strategy Map handoff actions, and `buyer_messaging_output` persistence
- Problem Narrative Builder prompt pack now includes customer-problem input fields, problem summary, short/medium/story/direct-response narratives, tension points, belief shift, content angles, copy/paste blocks, Content Engine/Message Builder handoff actions, and `problem_narrative` persistence
- Messaging Sequence Builder prompt pack now includes sequence-type input fields, EIA sequence strategy, ordered sequence map, channel copy blocks, before/after sequence, objection handling, Marketing Schedule/Content Engine handoff actions, and `messaging_sequence` persistence
- Marketing Reality Check prompt pack now includes foundation-audit input fields, reality summary, working/confusing/missing/ignore sections, highest-leverage fix, before/after, next 3 actions, recommended utility handoff, and `marketing_reality_check` persistence
- Lead capture/account creation-ready panel
- Logged-in marketing command center dashboard with desktop side navigation, mobile core navigation, top-bar Business / Client dropdown, Run New Diagnostic access, compact app-style utility launcher buttons as the primary view, Next Recommended Action panel, and channel deployment reminder.
- RB2B browser tracking for `simplemarketinghq.com` remains disabled unless `NEXT_PUBLIC_RB2B_SCRIPT_ID` is configured.
- Customer/client website visitor tracking is disabled until RB2B partner/OEM approval and domain configuration rules are confirmed.
- RB2B API access is prepared server-side with `RB2B_API_KEY`, without live API calls yet.
- Supabase-ready client/server helper files
- Exact Supabase SQL is documented in `docs/SQL_REQUIRED.md`, including `marketing_assets.role_id`, `marketing_assets`, `advisor_threads`, and `advisor_messages`.
- Local browser storage is used as a fallback until Supabase environment variables and SQL are configured.

## Next Implementation Steps

- Paste the full master prompt into `docs/PRODUCT_BRIEF.md`.
- Deepen the scoring model across offer clarity, audience clarity, message clarity, conversion readiness, lead capture, follow-up, content consistency, channel readiness, proof/trust, and next-action clarity.
- Connect the LaunchPad Diagnostic flow to OpenAI after prompt and data contracts are finalized.
- Add richer edit/export actions for saved command-center assets.
- Add OpenAI-backed generation for command-center tools after prompt and JSON contracts are finalized; current command-center workflows produce deterministic structured deliverables from saved business, diagnostic, website, and user input context.
- Add the real RB2B script ID in `NEXT_PUBLIC_RB2B_SCRIPT_ID` only when the `reb2b.load("...")` browser snippet is available for `simplemarketinghq.com`.
- Keep the private RB2B API key in `RB2B_API_KEY` only; do not expose it to the browser.
- Confirm RB2B API Partner or OEM Partner terms before building customer/client website tracking, domain registration, customer scripts, or webhook ingestion.
