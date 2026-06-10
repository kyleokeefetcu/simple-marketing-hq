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

## Buyer Psychology Audit

Role ID: `buyer_psychology_audit`

Asset type: `buyer_psychology_audit`

Location: Marketing Lab.

Purpose: evaluate a website, landing page, offer, or message through buyer psychology so the business can see what buyers likely notice, misunderstand, trust, doubt, want, avoid, and need before taking action.

Input fields:

- What page, offer, or message do you want reviewed?
- What should this page/message help the buyer do?
- Who is the intended buyer?

Output includes:

- `buyer_psychology_summary`
- `current_state_read`
- `psychology_findings`
- `before_after_improvements`
- `top_3_changes`
- `next_3_actions`
- `recommended_next_utility`

The generated output saves to Supabase as `asset_type = buyer_psychology_audit` and `role_id = buyer_psychology_audit`.

## Buyer Messaging Engine

Role ID: `buyer_messaging_engine`

Asset type: `buyer_messaging_output`

Location: Marketing Lab and Message Builder context.

Purpose: generate buyer-facing messaging that is clear, specific, practical, and ready to use across website copy, ads, emails, social posts, follow-up scripts, and sales conversations.

Input fields:

- What do you need messaging for?
- What are you trying to sell or promote?
- Who is this message for?
- What is the current version, if any?

Output includes:

- `messaging_strategy`
- `current_vs_improved`
- `core_message_assets`
- `channel_versions`
- `objection_responses`
- `copy_paste_blocks`
- `next_3_actions`
- `recommended_next_utility`

The generated output saves to Supabase as `asset_type = buyer_messaging_output` and `role_id = buyer_messaging_engine`.

Message Builder loads the latest Buyer Psychology Audit and Buyer Messaging Engine output for the selected Business / Client so saved lab work can be reused in practical website, sales, email, and follow-up copy.

## Problem Narrative Builder

Role ID: `problem_narrative_builder`

Asset type: `problem_narrative`

Location: Marketing Lab, Message Builder context, and Content Engine context.

Purpose: turn the customer's problem into a clear narrative that creates recognition, urgency, and trust without hype.

Input fields:

- What customer problem do you want to explain?
- Who experiences this problem?
- Where will this narrative be used?

Output includes:

- `problem_summary`
- `problem_narrative`
- `tension_points`
- `belief_shift`
- `before_after_message`
- `content_angles`
- `copy_paste_blocks`
- `next_3_actions`
- `recommended_next_utility`

The generated output saves to Supabase as `asset_type = problem_narrative` and `role_id = problem_narrative_builder`.

Message Builder and Content Engine load the latest Problem Narrative for the selected Business / Client so the saved problem framing can power copy, hooks, emails, ads, landing pages, and sales conversations.
