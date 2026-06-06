# Product Brief

## Simple Marketing HQ Master Prompt

Public app name: Simple Marketing HQ
Main URL: simplemarketinghq.com
Internal framework name: LaunchPad

Positioning: Simple Marketing HQ is an AI marketing advisor and marketing foundation command center for small businesses.

Critical naming rule: Simple Marketing HQ is the public product name. LaunchPad is only the internal diagnostic, score, action-plan, advisor, and recommendation framework. Do not use LaunchPad Marketing Hub as a public product name.

Simple Marketing HQ is being built as a sellable SaaS from the beginning. It should support a public website, user accounts/login, saved diagnostics, saved business profiles, customer dashboard, diagnostic history, recurring check-ins, subscription-ready architecture, referral foundations, visitor intelligence foundations, and future paid upgrade paths.

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
- Saved diagnostics and growth scores.
- Saved business profile.
- Customer dashboard.
- Diagnostic history.
- Offer, strategy, content, advisor, and recommendation asset persistence when data contracts are finalized.
- Subscription-ready architecture.
- Future Stripe paid plans.
- RB2B/server-side visitor intelligence foundations.
- Referral partner foundations.

## Data Direction

Existing Supabase tables support the current MVP persistence for profiles, businesses, LaunchPad diagnostics, answers, website analyses, scores, action plans, recommendations, check-ins, visitor foundations, referral foundations, subscriptions, and partner recommendations.

No new SQL is required for the current command-center UI pass because new module outputs are generated from the saved diagnostic and local state. Add SQL only when generated offer, strategy, content, research, advisor, and schedule assets need first-class saved records.

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

Final instruction: Simple Marketing HQ is the public product. LaunchPad is the internal diagnostic/advisor framework. The app should feel like a calm command center that prepares a small business for better marketing launch decisions.
