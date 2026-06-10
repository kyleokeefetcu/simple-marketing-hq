# Utility Workflows

The core utilities are specialized consultant roles inside Simple Marketing HQ.

Each utility should:

1. Load the selected Business / Client context.
2. Use website analysis, confirmed profile data, diagnostic answers, latest Growth Score, Action Plan, and saved assets.
3. Ask only 1-3 focused questions.
4. Generate a structured deliverable.
5. Show before/after improvements where relevant.
6. Explain why the improvement matters.
7. Provide next 3 actions.
8. Recommend the next utility.
9. Provide copy/paste-ready deliverables where useful.
10. Save to Supabase through `marketing_assets` with `role_id` and `asset_type`.
11. Show saved history for the selected Business / Client.

## Active Utility Roles

- ICP Builder / Audience Match: `icp_builder`
- Offer Builder: `offer_builder`
- Message Builder: `message_builder`
- Content Engine: `content_engine`
- Strategy Map: `strategy_map`
- Marketing Schedule: `marketing_schedule`
- Research Hub: `research_hub`
- LaunchPad Advisor: `advisor`

## Persistence

Utility outputs save to `public.marketing_assets`.

Advisor conversations save to `public.advisor_threads` and `public.advisor_messages`.

Every saved output must be scoped to a `business_id` and protected by RLS ownership rules.
