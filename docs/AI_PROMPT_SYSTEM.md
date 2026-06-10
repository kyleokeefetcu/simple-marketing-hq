# AI Prompt System

Simple Marketing HQ uses internal prompt packs, not external custom GPT links.

Each prompt pack lives inside the app and defines:

- `role_id`
- `display_name`
- `category`
- `purpose`
- `system_prompt`
- `required_context`
- `input_fields`
- `output_schema`
- `asset_type`
- `suggested_next_utility`

## Required Roles

Utility roles:

- `icp_builder`
- `offer_builder`
- `message_builder`
- `content_engine`
- `strategy_map`
- `marketing_schedule`
- `research_hub`
- `advisor`

Marketing Lab roles:

- `buyer_psychology_audit`
- `marketing_reality_check`
- `market_demand_check`
- `problem_narrative_builder`
- `messaging_sequence_builder`
- `buyer_messaging_engine`

## Context Contract

Every role should use:

1. Selected Business / Client context
2. Website analysis
3. Confirmed business profile
4. LaunchPad Diagnostic answers
5. Latest Growth Score and Action Plan
6. Prior saved assets
7. Focused user input
8. The selected role prompt

## Output Contract

Every role should return structured JSON with:

- title
- summary
- current-state assessment
- before/after improvement where relevant
- why the improvement matters
- role-specific sections
- next 3 actions
- recommended next utility
- copy/paste-ready deliverables

Internal prompt text must never be exposed to users. The app may store prompt metadata and output schemas for auditability, but not as the customer-facing experience.
