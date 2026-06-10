# Marketing Lab

Marketing Lab contains deeper audit-style consultant roles for buyer psychology, demand, narratives, and messaging.

These are not external GPT links. They are internal Simple Marketing HQ prompt packs.

## Active Lab Roles

- Buyer Psychology Audit: `buyer_psychology_audit`
- Marketing Reality Check: `marketing_reality_check`
- Market Demand Check: `market_demand_check`
- Problem Narrative Builder: `problem_narrative_builder`
- Messaging Sequence Builder: `messaging_sequence_builder`
- Buyer Messaging Engine: `buyer_messaging_engine`

## Workflow

Each Marketing Lab audit:

1. Loads selected Business / Client context.
2. Uses diagnostic and website context where available.
3. Asks a short focused input form.
4. Generates a structured consultant-grade output.
5. Shows before/after, why it matters, next 3 actions, recommended next utility, and copy/paste-ready deliverables.
6. Saves to `public.marketing_assets` with the matching `role_id` and lab `asset_type`.
7. Shows saved history for that Business / Client.

## Product Rule

Marketing Lab should help the owner make a better marketing decision without needing to know marketing strategy upfront. The app translates business context into buyer insight, demand checks, problem narratives, sequences, and copy blocks.

## Market Demand Check

Role ID: `market_demand_check`

Asset type: `market_demand_check`

Location: Marketing Lab and Offer Builder context.

Purpose: evaluate whether the selected Business / Client has an offer that matches real market demand, urgent buyer pain, clear motivation, and a strong enough reason to act now. Then generate sharper offer direction.

Input fields:

- What are you trying to sell or promote right now?
- Who do you want to sell this to?
- What is the current offer or promise?
- What have people already paid for, asked about, or shown interest in?

Output includes:

- `market_demand_read`
- `demand_diagnosis`
- `buyer_motivation`
- `offer_improvement`
- `before_after`
- `next_3_actions`
- `recommended_next_utility`

The generated output saves to Supabase as `asset_type = market_demand_check` and `role_id = market_demand_check`.
