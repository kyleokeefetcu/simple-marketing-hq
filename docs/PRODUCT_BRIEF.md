# Product Brief

## Simple Marketing HQ Master Prompt

Public app name: Simple Marketing HQ
Main URL: simplemarketinghq.com
Internal framework name: LaunchPad

Positioning: Simple Marketing HQ is an AI marketing advisor and marketing foundation command center for small businesses.

Critical naming rule: Simple Marketing HQ is the public product name. LaunchPad is only the internal diagnostic, score, action-plan, advisor, and recommendation framework. Do not use LaunchPad Marketing Hub as a public product name.

Simple Marketing HQ is being built as a sellable SaaS from the beginning. It should support a public website, user accounts/login, saved diagnostics, saved business profiles, customer dashboard, diagnostic history, recurring check-ins, subscription-ready architecture, referral foundations, visitor intelligence foundations, and future paid upgrade paths.

Simple Marketing HQ must support users who manage more than one business:

- A business owner with multiple businesses or brands.
- A marketing agency with multiple client businesses.
- A consultant or advisor using the platform with different customer accounts.
- Future team accounts with multiple collaborators inside one workspace.

Data/product hierarchy:

User Account -> Workspace / Account -> Business or Client Profile -> LaunchPad Diagnostic -> Growth Score -> Action Plan -> Offer Builder assets -> Content Engine assets -> Strategy Map -> Advisor threads -> Recommendations.

In the current MVP, the user profile acts as the account/workspace layer. Business / Client profiles are stored as multiple `businesses` rows owned by that user. Future team collaboration can add explicit workspace and membership tables when team seats are implemented.

## Product Direction

Simple Marketing HQ is not just a website scanner, SEO scanner, diagnostic quiz, checklist app, generic CRM, automation platform, or content calendar. The LaunchPad Diagnostic is the intake and first assessment layer, not the core product.

The core product is a systematic AI-powered marketing workspace that prepares a small business for marketing takeoff.

Core metaphor:

- The rocket ship is the customer's marketing foundation: offer, message, audience, strategy, content, schedule, campaign plan, research, assets, recommendations, and next actions.
- Takeoff is channel deployment: cold email tools, social platforms, ad platforms, CRM platforms, websites, SEO tools, affiliate/recommended tools, and partner channels.
- Simple Marketing HQ prepares the rocket ship. External tools deploy it.

Users should always know:

1. What is wrong or missing.
2. Why it matters.
3. What to build next.
4. How to build it.
5. What asset or output was created.
6. What step comes after that.

## Core Product Modules

1. LaunchPad Diagnostic
   Initial intake and bottleneck finder across business, offer, audience, website, leads, sales process, content, follow-up, and goals.

2. LaunchPad Growth Score
   Scores foundational marketing readiness across offer clarity, audience clarity, message clarity, website/conversion readiness, lead capture, follow-up system, content consistency, channel readiness, proof/trust, and next-action clarity.

3. LaunchPad Action Plan
   Turns the score into the current bottleneck, highest-leverage objective, next 7 days, next 30 days, missing assets, recommended order of operations, and next action.

4. Offer Builder
   Builds the offer foundation using direct-response offer principles without naming those inspirations in the UI. It should cover dream outcome, pain/problem, target customer, value equation, speed to result, effort reduction, risk reversal, bonuses, guarantee ideas, pricing/package framing, why now, offer stack, and clear CTA.

5. Content Engine
   Creates robust content strategy and content assets, not generic posts. It should support clarity, authority hooks, problem/solution framing, mini-steps, outcome language, behavioral CTAs, stop-stack hooks, tension stacking, short-form derivatives, long-form scripts, social posts, lead magnet ideas, email sequences, and content repurposing.

6. Strategy Map
   Turns diagnosis into a practical marketing plan: current bottleneck, highest-leverage objective, next 7 days, next 30 days, channel readiness, missing assets, and recommended order of operations.

7. Marketing Schedule
   A guided execution rhythm for weekly content planning, campaign prep, offer refinement, lead magnet creation, follow-up assets, and review/iterate cycles.

8. Research Hub
   AI-assisted research for audience pains, objections, competitors, positioning, offer angles, content ideas, FAQs, and proof/trust gaps.

9. LaunchPad Advisor
   A conversational advisor that helps the user decide what to do next and generate the exact asset needed. Every output should include diagnosis/why it matters, recommended action, step-by-step execution, copy/assets when relevant, and what to do next.

10. LaunchPad Recommendations
   Recommends tools, channels, partners, and affiliate options only after foundation work is clear. It should not become a random marketplace.

## First Usable MVP Path

Prioritize this flow:

Diagnostic -> Growth Score -> Action Plan -> Offer Builder starter -> Content Engine starter -> Advisor next action.

The MVP should make the product spine obvious even when deeper persistence and AI generation are added later.

## AI Output Requirements

Every AI-generated or AI-style area must produce defined action steps, not vague advice. Outputs should include:

- Diagnosis or why it matters.
- Recommended action.
- Step-by-step execution.
- Copy, assets, or structured output when relevant.
- What to do next.

Use structured JSON where practical so the UI can reliably render scores, sections, bottlenecks, action items, recommendations, content assets, and advisor outputs.

## Public Website Direction

Public positioning should say that Simple Marketing HQ helps small businesses build the marketing foundation before launching into channels.

Hero idea:

- Headline: Build your marketing foundation before takeoff.
- Supporting copy: Simple Marketing HQ is an AI marketing advisor and foundation command center for small businesses. Diagnose what is missing, build the offer and assets, then choose the right channel to launch.
- Primary CTA: Start Your Free Diagnostic.
- Secondary CTA: See How It Works.

Avoid language that reduces the product to a website scanner, SEO scanner, generic dashboard, checklist, or quiz.

## SaaS Readiness

The app should support:

- Sign up, login, logout.
- One account/workspace with multiple Business / Client profiles.
- Business / Client switcher in the dashboard.
- Add Business / Client flow.
- Per-business diagnostic, score, action-plan, offer, content, strategy, advisor, and recommendation context.
- Saved diagnostics and growth scores.
- Saved business profile.
- Customer dashboard.
- Diagnostic history.
- Offer, strategy, content, advisor, and recommendation asset persistence when data contracts are finalized.
- Subscription-ready architecture.
- Future Stripe paid plans.
- RB2B/server-side visitor intelligence foundations.
- Referral partner foundations.

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

Existing Supabase tables support the current MVP persistence for profiles, businesses, LaunchPad diagnostics, answers, website analyses, scores, action plans, recommendations, check-ins, visitor foundations, referral foundations, subscriptions, and partner recommendations.

The existing `businesses.owner_id` relationship supports multiple businesses per user. The existing `launchpad_diagnostics.business_id` and related `business_id` columns support per-business scoping for diagnostics, recommendations, visitor records, referral records, generated assets, check-ins, and partner recommendations.

No new SQL is required for the current multi-business UI pass because the current schema already supports multiple Business / Client profiles under a user account. Add SQL only when explicit team workspaces/memberships or first-class saved offer, strategy, content, research, advisor, and schedule records are implemented.

## Acceptance Criteria

The MVP direction is successful when a user can:

1. Visit Simple Marketing HQ.
2. Understand it is an AI marketing advisor and foundation command center.
3. Start the LaunchPad Diagnostic.
4. Get a LaunchPad Growth Score and Action Plan.
5. Move into an Offer Builder starter.
6. Generate Content Engine starter ideas.
7. See a Strategy Map.
8. Ask the LaunchPad Advisor what to build next.
9. View focused Recommendations for takeoff channels/tools.
10. Save diagnostics and return to the dashboard.
11. Add/select multiple Business / Client profiles under one account.
12. View per-business status summaries and scoped module links.

Final instruction: Simple Marketing HQ is the public product. LaunchPad is the internal diagnostic/advisor framework. The app should feel like a calm command center that prepares a small business for better marketing launch decisions.
