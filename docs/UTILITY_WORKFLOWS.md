# Utility Workflows

The core utilities are living marketing assets inside Simple Marketing HQ.

The operating rule is:

Simple Marketing HQ recommends. The owner approves, corrects, or feeds new information.

Each utility should:

1. Load the selected Business / Client context.
2. Use website analysis, confirmed profile data, diagnostic answers, latest Growth Score, Action Plan, and saved assets.
3. Show the current best recommendation first.
4. Explain what the app recommends, why it matters, what customer problem it targets, what outcome it should emphasize, and the next action.
5. Let the owner approve, improve, correct, or feed new raw information.
6. Accept raw business information such as customer questions, sales notes, objections, reviews, campaign results, competitor examples, what worked, what did not work, and new product/service details.
7. Generate an updated recommendation with a copy/paste-ready asset, why it works, where to use it, a practical test, and one next action.
8. Save to Supabase through `marketing_assets` with `role_id` and `asset_type`.
9. Show saved history/change log for the selected Business / Client.

## Active Utility Roles

- Audience HQ: `icp_builder`
- Offer HQ: `offer_builder`
- Messaging HQ: `message_builder`
- Content HQ: `content_engine`
- Strategy HQ: `strategy_map`
- Execution HQ: `marketing_schedule`
- Research HQ: `research_hub`
- Tool Stack HQ: `buyer_messaging_engine` / `recommendation`
- LaunchPad Advisor: `advisor`

## Utility Page Sections

Every major utility follows this page model:

1. Header with utility name, promise, Business / Client selector, and context status.
2. Current Asset with copy, save/approve, improve, and next-utility actions.
3. CMO Recommendation with what we recommend, why, customer problem, outcome, confidence, and next action.
4. Feed New Info with one raw-information input.
5. Test & Improve with where to test, what to measure, signal, and next move.
6. Use It Now with deployment locations and one next action.
7. History / Change Log with saved versions for the active Business / Client.

## Output Standard

Generated assets must use this order:

1. Best recommendation first.
2. Copy/paste asset.
3. Why this works.
4. Where to use it.
5. One next action.

Before writing final copy, raw business context must be compressed into short market-facing language. Long source phrases should not be repeated across output blocks.

## Persistence

Utility outputs save to `public.marketing_assets`.

Advisor conversations save to `public.advisor_threads` and `public.advisor_messages`.

Every saved output must be scoped to a `business_id` and protected by RLS ownership rules.
