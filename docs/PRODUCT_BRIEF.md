# Product Brief

## Simple Marketing HQ Master Prompt

Public app name: Simple Marketing HQ
Main URL: simplemarketinghq.com
Internal framework name: LaunchPad

Positioning: Simple Marketing HQ is an AI marketing team and simple command center for small businesses. It gives owners an AI CMO, practical marketing utilities, and a living marketing foundation that improves as the business changes.

Critical naming rule: Simple Marketing HQ is the public product name. LaunchPad is only the internal diagnostic, score, action-plan, advisor, and recommendation framework. Do not use LaunchPad Marketing Hub as a public product name.

Simple Marketing HQ is being built as a sellable SaaS from the beginning. It should support a public website, user accounts/login, saved diagnostics, saved business profiles, customer dashboard, diagnostic history, recurring check-ins, subscription-ready architecture, referral foundations, visitor intelligence foundations, and future paid upgrade paths.

Simple Marketing HQ must support users who manage more than one business:

- A business owner with multiple businesses or brands.
- A marketing agency with multiple client businesses.
- A consultant or advisor using the platform with different customer accounts.
- Future team accounts with multiple collaborators inside one workspace.

Data/product hierarchy:

User Account -> Workspace / Account -> Business or Client Profile -> LaunchPad Diagnostic -> Growth Score -> ICP Builder / Audience Match -> Offer Builder assets -> Content Engine assets -> Strategy Map -> Advisor threads -> Recommendations.

In the current production architecture, the user profile acts as the account/workspace layer. Business / Client profiles are stored as multiple `businesses` rows owned by that user. Team collaboration can add explicit workspace and membership tables when team seats are implemented.

## Product Direction

Simple Marketing HQ is not just a website scanner, SEO scanner, diagnostic quiz, checklist app, generic CRM, automation platform, content calendar, static report, or one-time marketing audit. The LaunchPad Diagnostic is the intake and first snapshot, not the core product.

The core product is an AI CMO command center that helps small business owners decide what to fix first, open the right utility, build or improve the actual asset, and come back often as the business changes.

Core product frame:

- The AI CMO recommends the next best move.
- The command center keeps offer, audience, message, content, strategy, execution, research, recommendations, and next actions in one simple place.
- The utilities build and improve the actual marketing assets.
- The marketing foundation is living: customer questions, sales notes, objections, reviews, campaign results, new offers, and ideas should improve future recommendations.
- External tools and channels come after the foundation is clear enough to use them well.

Users should always know:

1. What is wrong or missing.
2. Why it matters.
3. What to build next.
4. How to build it.
5. What asset or output was created.
6. What step comes after that.

## Logged-In Command Center Direction

The logged-in dashboard should be the user's marketing home base. It should not feel like a quiz result page, website scanner report, Growth Score report, passive checklist, or generic software dashboard.

The LaunchPad Diagnostic remains the starting point and intake layer. Once logged in, the user should be able to choose the marketing utility they need right now:

- I need help with my offer.
- I need help defining my customer.
- I need content ideas.
- I need a strategy.
- I need a schedule.
- I need research.
- I need to know what to do next.
- I need recommendations for tools or channels.

Dashboard layout requirements:

- Left-hand navigation on desktop.
- Mobile-friendly navigation for core actions.
- Top bar with Simple Marketing HQ branding, Run New Diagnostic access, and active Business / Client selector.
- Business / Client selector dropdown with current businesses/clients, View all businesses / clients, and Add Business / Client.
- Compact app-style utility buttons as the first and primary dashboard section for Build My Offer, Define My ICP, Message Builder, Create Content, Build Strategy, Plan This Week, Research My Audience, Ask Advisor, and View Recommendations.
- A clear Next Recommended Action panel below the utility grid with what to do next, why it matters, 1-2-3 steps, and a button to open the correct utility.
- A channel deployment reminder: Simple Marketing HQ prepares the foundation; external tools deploy.
- Recent work and saved diagnostic history should not clutter the command center homepage. Keep history inside relevant utilities, Growth Score & Suggestions, LaunchPad Diagnostic, or future saved-assets/history views.

Growth Score is one dashboard utility and can appear inside saved diagnostic context. It should not dominate the logged-in home screen.

KPI-style status cards should not dominate the dashboard homepage. Growth Score and diagnostic status can appear inside the Growth Score utility, saved diagnostic cards, and diagnostic detail views.

Core logged-in navigation:

- Home / Command Center
- LaunchPad Diagnostic
- Growth Score & Suggestions
- ICP Builder / Audience Match
- Offer Builder
- Message Builder
- Content Engine
- Strategy Map
- Marketing Schedule
- Research Hub
- LaunchPad Advisor
- Recommendations
- Visitor Intelligence
- Referrals
- Settings / Billing

Each utility should be action-oriented:

1. User opens the utility.
2. User enters a small amount of context or uses saved business context.
3. The system returns a useful deliverable.
4. The deliverable includes clear next steps.
5. The user can save, export, or use it in the chosen deployment channel when persistence/export flows are added.

## Core Product Modules

1. LaunchPad Diagnostic
   Initial intake and bottleneck finder across business, offer, audience, website, leads, sales process, content, follow-up, and goals.

   The diagnostic should be AI-first and short. The user enters a website URL early, Simple Marketing HQ analyzes the public website, shows an editable confirmation screen for inferred business profile fields, then asks only the missing human-judgment questions needed to create the Growth Score, Action Plan, ICP starter, Offer Builder starter, Content Engine starter, and Strategy Map.

   Do not ask users to manually answer fields the website can reasonably infer, including business name, industry/category, basic services, homepage headline, primary CTA, service area if visible, basic target audience, trust signals, testimonials/reviews, and visible lead capture. Present these as confirmation/edit cards instead.

   Website analysis must be confidence-gated. Do not present low-confidence guesses as facts. Each extracted field should retain value, confidence, source URL, source evidence, source text snippet, and extraction reason. If confidence is low, show that the field could not be confirmed and ask the user to fill it in.

   Gap questions should stay short and focused on what a business owner already knows from real life: what they sell, what kind of customer they want more of, what customers usually need help with, what customers say when they first call or message, how customers find the business now, what marketing has been tried, where leads get stuck, response speed, whether the business sells locally/online/both, and realistic weekly marketing time.

   Do not ask the user to provide strategic marketing answers during onboarding. Avoid questions like "What result do customers want most?", "What channel do you want to focus on first?", "What is your positioning?", "What is your acquisition strategy?", "What is your conversion bottleneck?", or "What is your buyer journey?" Simple Marketing HQ should infer the likely customer desired outcome, message angle, recommended first channel, why that channel fits, what foundation must be built before using it, what channel to ignore for now, and which utility to open next.

2. LaunchPad Growth Score
   Scores foundational marketing readiness across ICP clarity, industry fit, buyer pain clarity, urgency/trigger clarity, offer-to-ICP fit, channel-to-ICP fit, offer clarity, message clarity, website/conversion readiness, lead capture, follow-up system, content consistency, proof/trust, and next-action clarity.

3. LaunchPad Action Plan
   Turns the score into the current bottleneck, highest-leverage objective, next 7 days, next 30 days, missing assets, recommended order of operations, and next action.

4. ICP Builder / Audience Match
   Defines the best-fit customer, not just a generic audience. It should cover industry/niche, business type, buyer type, company size, revenue range or budget level, location/service area, urgent pain, buying trigger, desired outcome, current alternative, objections, decision maker, lead source/channel fit, offer fit, proof needed, and bad-fit customer traits.

5. Offer Builder
   Builds the offer foundation using direct-response offer principles without naming those inspirations in the UI. It should cover dream outcome, pain/problem, target customer, value equation, speed to result, effort reduction, risk reversal, bonuses, guarantee ideas, pricing/package framing, why now, offer stack, and clear CTA.

6. Message Builder
   Turns customer language into clearer positioning. It should ask what problem people usually come for, what customers say when they call or message, and what type of customer the business wants more of. Then Simple Marketing HQ should answer: here is what your customers likely want most, here is why, and here is how to message it.

7. Content Engine
   Creates robust content strategy and content assets, not generic posts. It should support clarity, authority hooks, problem/solution framing, mini-steps, outcome language, behavioral CTAs, stop-stack hooks, tension stacking, short-form derivatives, long-form scripts, social posts, lead magnet ideas, email sequences, and content repurposing.

8. Strategy Map
   Turns diagnosis into a practical marketing plan: current bottleneck, highest-leverage objective, next 7 days, next 30 days, channel readiness, missing assets, and recommended order of operations.

9. Marketing Schedule
   A guided execution rhythm for weekly content planning, campaign prep, offer refinement, lead magnet creation, follow-up assets, and review/iterate cycles.

10. Research Hub
   AI-assisted research for audience pains, objections, competitors, positioning, offer angles, content ideas, FAQs, and proof/trust gaps.

11. LaunchPad Advisor
   A conversational advisor that helps the user decide what to do next and generate the exact asset needed. Every output should include diagnosis/why it matters, recommended action, step-by-step execution, copy/assets when relevant, and what to do next.

12. LaunchPad Recommendations
   Recommends tools, channels, partners, and affiliate options only after foundation work is clear. It should not become a random marketplace.

## Industry Matching

Simple Marketing HQ should identify the user's industry/category and adapt recommendations based on it. Supported starter profiles include local service business, contractor/home services, medical/wellness, real estate, legal/professional services, restaurant/retail, B2B services, SaaS/software, coaching/consulting, creator/course business, agency, and ecommerce.

Industry matching should adjust likely buyer pains, common objections, best content angles, best lead magnets, recommended channels, follow-up style, proof needed, offer structure, conversion bottlenecks, and next best action.

ICP Builder output should include:

- Best-fit customer summary.
- Bad-fit customer warning.
- Top pains.
- Buying triggers.
- Objections.
- Message angles.
- Lead magnet ideas.
- Best channels to consider.
- Offer adjustments.
- Next action steps.

## First Usable Production Path

Prioritize this flow:

Website URL -> AI website review -> Confirm/edit profile -> short gap questions -> Command Center -> Growth Score -> ICP Builder -> Offer Builder starter -> Strategy Map -> Content Engine starter -> Advisor next action -> Recommendations.

The product should make the spine obvious while each prompt pack is added, wired, saved, tested, and differentiated.

## AI Output Requirements

Every AI-generated or AI-style area must produce defined action steps, not vague advice. Outputs should include:

- Diagnosis or why it matters.
- Recommended action.
- Step-by-step execution.
- Copy, assets, or structured output when relevant.
- What to do next.

Use structured JSON where practical so the UI can reliably render scores, sections, bottlenecks, action items, recommendations, content assets, and advisor outputs.

## Public Website Direction

Public positioning should say that Simple Marketing HQ is an AI marketing team and simple command center for small businesses. It should feel practical, owner-friendly, and action-oriented, not like a report product, one-time diagnostic, quiz app, giant dashboard, or channel deployment tool.

Hero direction:

- Eyebrow: AI marketing team and command center for small businesses.
- Headline: Your marketing team in a simple command center.
- Supporting copy: Simple Marketing HQ gives small business owners an AI CMO and easy marketing utilities that keep your offer, audience, message, content, and weekly plan moving as your business changes.
- Primary CTA: Start Free Diagnostic.
- Secondary CTA: See the Command Center.

Public section structure:

1. Hero with AI CMO / command center positioning and a short next-best-move card.
2. The Diagnostic starts the work and turns plain business-owner answers into a clear recommendation.
3. Your AI CMO tells you what to fix first, why it matters, what to ignore, which utility to open, and what asset to build next.
4. Easy utilities build the assets: Audience HQ, Offer HQ, Messaging HQ, Content HQ, Strategy HQ, Execution HQ, Research HQ, Advisor, and Tool Stack HQ.
5. Your marketing gets better over time as owners add customer questions, sales notes, campaign results, objections, reviews, new offers, and ideas.
6. Built for owners who need more leads, booked jobs, sales, and clarity.
7. Pricing / CTA: start free, build the foundation, upgrade when ready to execute deeper.

Use simple words like customers, leads, sales, booked jobs, revenue, follow-up, website visitors, what is not working, and what to fix first. Avoid overusing diagnostic, score, assessment, report, ICP, funnel, positioning, value proposition, and conversion readiness in public homepage copy.

## SaaS Readiness

The app should support:

- Sign up, login, logout.
- One account/workspace with multiple Business / Client profiles.
- Business / Client switcher in the dashboard.
- Add Business / Client flow.
- Per-business diagnostic, score, ICP, action-plan, offer, content, strategy, advisor, and recommendation context.
- Saved diagnostics and growth scores.
- Saved business profile.
- Customer dashboard.
- Diagnostic history.
- Offer, strategy, content, advisor, and recommendation asset persistence when data contracts are finalized.
- Subscription-ready architecture.
- Future Stripe paid plans.
- RB2B/server-side visitor intelligence foundations.
- Referral partner foundations.

## RB2B / Visitor Intelligence Direction

There are two separate RB2B use cases:

1. Simple Marketing HQ tracking
   This is browser tracking for `simplemarketinghq.com` only. `NEXT_PUBLIC_RB2B_SCRIPT_ID` may be used for our own site tracking only if RB2B provides a browser script ID.

2. Customer/client website tracking
   This is tracking for each Business / Client website. It must not use one universal Simple Marketing HQ script across all customer websites. Customer tracking requires RB2B API Partner or OEM Partner approval, customer domain configuration, approved customer installation instructions, and a confirmed data routing model.

Current product rule: do not make live RB2B API calls, register customer domains, generate customer scripts, or expose customer tracking setup until RB2B confirms the correct partner/OEM integration flow. `RB2B_API_KEY` remains server-only.

## Pricing Direction

Simple Marketing HQ is priced as a marketing foundation command center, not a cheap scanner.

1. Free Diagnostic: $0
   1 business, 1 LaunchPad Diagnostic, Basic Growth Score, limited recommendations, no full saved asset library.

2. Starter: $25/month
   1 business, saved diagnostic history, LaunchPad Action Plan, Basic Offer Builder, Basic Content Engine, limited AI generations.

3. Owner: $75/month
   Up to 3 businesses, Full Offer Builder, Full Content Engine, Strategy Map, LaunchPad Advisor access, saved assets, exportable action plans.

4. Growth / Agency Lite: $150/month
   Up to 10 businesses/clients, higher AI usage, client/business switcher, saved content plans, saved advisor threads, branded/exportable reports later.

5. Agency Pro: $300/month
   Up to 25 businesses/clients, team seats, higher AI limits, client workspace/reporting, priority workflows, white-label-ready structure later.

6. Additional Business / Client: $15/month per additional Business / Client after plan limit.

## Data Direction

Supabase tables support the current production persistence for profiles, businesses, LaunchPad diagnostics, answers, website analyses, scores, action plans, recommendations, command-center assets, advisor threads/messages, check-ins, visitor foundations, referral foundations, subscriptions, and partner recommendations.

The existing `businesses.owner_id` relationship supports multiple businesses per user. The existing `launchpad_diagnostics.business_id` and related `business_id` columns support per-business scoping for diagnostics, recommendations, visitor records, referral records, generated assets, check-ins, and partner recommendations.

Command-center modules persist to `marketing_assets` by `asset_type`: ICP, offer, message, content, strategy map, marketing schedule, research, and recommendations. The LaunchPad Advisor persists to `advisor_threads` and `advisor_messages`. All records are scoped to the selected Business / Client and protected by RLS ownership policies.

Simple Marketing HQ uses internal role-based AI prompt packs, not external custom GPT links. Each consultant role defines a role ID, display name, category, purpose, system prompt, required context, input fields, output schema, asset type, and suggested next utility. Prompt packs live inside the app and should not expose raw internal prompt instructions to users.

Required roles include ICP Builder, Offer Builder, Message Builder, Content Engine, Strategy Map, Marketing Schedule, Research Hub, Advisor, Buyer Psychology Audit, Marketing Reality Check, Market Demand Check, Problem Narrative Builder, Messaging Sequence Builder, and Buyer Messaging Engine.

Marketing Lab audits are production app workflows. They load selected Business / Client context, ask short focused questions, generate structured consultant-grade output, show before/after, explain why it matters, provide next 3 actions, recommend the next utility, and save to `marketing_assets` with `role_id`.

Each active marketing utility must behave like a living marketing asset, not a static report or one-time generator. The standard is:

1. Load the selected Business / Client context, latest diagnostic, website analysis, and saved asset history where available.
2. Show the current best recommendation first.
3. Explain what Simple Marketing HQ recommends, why it recommends it, what customer problem it targets, what outcome it should emphasize, and the next action.
4. Let the owner approve, improve, correct, or feed new raw information.
5. Accept real-world inputs such as customer questions, objections, reviews, campaign results, competitor examples, sales notes, new offer details, or what felt off.
6. Turn that new information into an updated recommendation, compact copy/paste asset, test idea, use-it-now guidance, and one next action.
7. Save the approved or improved asset to Supabase for the selected Business / Client.
8. Show saved history/change log inside the utility.

The product rule is: Simple Marketing HQ recommends; the owner approves, corrects, or feeds new information. The owner should not be forced to invent the marketing strategy from scratch.

The current production utility model uses:
- Audience HQ for the current best-fit customer recommendation.
- Offer HQ for the current offer, CTA, proof point, buyer, problem, outcome, and angle.
- Messaging HQ for the current headline, subheadline, CTA, short pitch, hook, and follow-up opener.
- Content HQ for current themes, hooks, posts, email ideas, and content priority.
- Strategy HQ for current priority, bottleneck, what to ignore, channel order, and next actions.
- Execution HQ for this week's plan, tasks, content, follow-up, review, and what to skip.
- Research HQ for customer pains, objections, proof gaps, competitor notes, and language patterns.
- Tool Stack HQ for outside tools/channels only when the foundation is ready.

Global output standard: best recommendation first, then copy/paste asset, why it works, where to use it, and one clear next action. Raw business context must be compressed into short customer-facing language before it appears in generated assets.

Utility pages should feel like app-style AI workspaces, not long reports. Each HQ utility uses compact work-block tiles near the top so the owner chooses what to work on now. Clicking a tile opens a focused AI working session for that job. The selected work block becomes AI context rather than another large visible content card. History, tests, saved versions, results, and reference material are accessed through compact controls inside the focused workspace.

Every utility workspace includes a concise Next Best Move strip and an AI Working Session. The working session is specific to the current utility and selected work block, uses the selected Business / Client, latest diagnostic, saved assets, and current recommendation, and either creates the requested asset or tells the owner the next best action.

LaunchPad Diagnostic follows the same operating philosophy with one important distinction: each completed diagnostic is a fresh point-in-time snapshot. The left navigation opens LaunchPad Diagnostic HQ, not the quiz funnel. Diagnostic HQ shows the latest diagnostic, an optional current draft, a clear Run New Diagnostic action, archived previous diagnostics, and a comparison against the prior snapshot when available.

Run New Diagnostic starts a fresh session at step 1 and does not reuse old quiz answers. Existing business context, saved assets, and previous diagnostics may inform the app in the background, but the owner answers the current-state questions again. Continue Draft is the only action that resumes an incomplete diagnostic. Completed diagnostics save as separate timestamped records and older diagnostics remain archived snapshots.

Diagnostic questions must use plain business-owner language. The diagnostic asks about what the business sells, who pays, how customers find them, what is not working, what changed, what customers ask, and what would make the month better. Simple Marketing HQ translates those plain answers into buyer, offer, message, channel, bottleneck, and next-action strategy behind the scenes.

Future team workspaces and membership roles will require additional SQL when collaborative seats are implemented.

## Acceptance Criteria

The production direction is successful when a user can:

1. Visit Simple Marketing HQ.
2. Understand it is an AI marketing advisor and foundation command center.
3. Start the LaunchPad Diagnostic.
4. Get a LaunchPad Growth Score and Action Plan.
5. Move into an ICP Builder starter with industry-aware Audience Match.
6. Move into an Offer Builder starter.
7. Generate Content Engine starter ideas.
8. See a Strategy Map.
9. Ask the LaunchPad Advisor what to build next.
10. View focused Recommendations for takeoff channels/tools.
11. Save diagnostics, generated command-center assets, and advisor threads to the selected Business / Client.
12. Return to the dashboard and see saved asset status.
13. Add/select multiple Business / Client profiles under one account.
14. View per-business status summaries and scoped module links.

Final instruction: Simple Marketing HQ is the public product. LaunchPad is the internal diagnostic/advisor framework. The app should feel like a calm command center that prepares a small business for better marketing launch decisions.
