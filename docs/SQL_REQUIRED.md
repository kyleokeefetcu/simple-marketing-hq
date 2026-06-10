# SQL Required

SQL is required for the production SaaS because Simple Marketing HQ uses user accounts, multiple Business / Client profiles, saved LaunchPad Diagnostics, LaunchPad Growth Scores, LaunchPad Action Plans, command-center assets, advisor threads, check-ins, visitor intelligence, referral foundations, and subscription-ready records.

## Current SQL State

The Supabase project now supports the current production persistence layer:

- Multiple businesses per user through `public.businesses.owner_id`.
- Per-business diagnostics through `public.launchpad_diagnostics.business_id`.
- Starter ICP inputs through `public.launchpad_answers`.
- Starter ICP and industry-match summary values through `public.launchpad_diagnostics.summary`.
- Confirmed website profile data through `public.website_analyses.analysis` and `public.businesses` profile fields.
- Per-business recommendations, check-ins, generated assets, visitor records, referral records, and partner recommendations through existing `business_id` columns.
- Production command-center outputs through `public.marketing_assets`.
- Prompt-pack and Marketing Lab outputs through `public.marketing_assets.role_id`.
- Advisor conversation persistence through `public.advisor_threads` and `public.advisor_messages`.
- RLS ownership by user and by owned business records.

## Module Persistence Classification

Fully persisted now:

- Businesses / Clients
- LaunchPad Diagnostics
- Growth Scores
- Action Plans
- ICP Builder assets
- Offer Builder assets
- Message Builder assets
- Content Engine assets
- Strategy Maps
- Marketing Schedules
- Research records
- Advisor threads/messages
- Recommendations
- Check-ins
- Referral profiles

Partially persisted:

- Billing/subscription status
- Visitor intelligence records
- Referral partner/event workflows

Disabled until partner approval:

- Live customer/client RB2B tracking

Static UI only in active command-center navigation:

- None after the command-center persistence update.

## Current Requirement

No additional SQL is required right now because the `marketing_assets.role_id` prompt-pack upgrade, `marketing_assets`, `advisor_threads`, `advisor_messages`, and `buyer_messaging_output` asset-type SQL were run successfully.

Future team workspaces, membership roles, Stripe checkout records, OpenAI usage logging, and activated RB2B customer-domain tracking may require additional SQL when those workflows are implemented.

## Buyer Messaging Engine SQL Already Run

This SQL was required for Prompt Pack 3 so Buyer Messaging Engine outputs save as `asset_type = buyer_messaging_output` while keeping `role_id = buyer_messaging_engine`.

```sql
alter table public.marketing_assets
drop constraint if exists marketing_assets_asset_type_check;

alter table public.marketing_assets
add constraint marketing_assets_asset_type_check
check (
  asset_type in (
    'icp',
    'offer',
    'message',
    'content',
    'strategy_map',
    'marketing_schedule',
    'research',
    'recommendation',
    'buyer_psychology_audit',
    'marketing_reality_check',
    'market_demand_check',
    'problem_narrative_builder',
    'messaging_sequence_builder',
    'buyer_messaging_engine',
    'buyer_messaging_output'
  )
);

create index if not exists marketing_assets_buyer_messaging_output_idx
  on public.marketing_assets (business_id, created_at desc)
  where asset_type = 'buyer_messaging_output';
```

## Command-Center Persistence SQL Already Run

This is the SQL that was required for the current command-center persistence pass. It is kept here as the current reference and is idempotent around policies/triggers.

```sql
create extension if not exists pgcrypto;

create table if not exists public.marketing_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role_id text not null default 'advisor' check (
    role_id in (
      'icp_builder',
      'offer_builder',
      'message_builder',
      'content_engine',
      'strategy_map',
      'marketing_schedule',
      'research_hub',
      'advisor',
      'buyer_psychology_audit',
      'marketing_reality_check',
      'market_demand_check',
      'problem_narrative_builder',
      'messaging_sequence_builder',
      'buyer_messaging_engine'
    )
  ),
  asset_type text not null check (
    asset_type in (
      'icp',
      'offer',
      'message',
      'content',
      'strategy_map',
      'marketing_schedule',
      'research',
      'recommendation',
      'buyer_psychology_audit',
      'marketing_reality_check',
      'market_demand_check',
      'problem_narrative_builder',
      'messaging_sequence_builder',
      'buyer_messaging_engine',
      'buyer_messaging_output'
    )
  ),
  title text not null,
  prompt jsonb not null default '{}'::jsonb,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  summary text,
  status text not null default 'active' check (
    status in ('draft', 'active', 'archived')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advisor_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null default 'Advisor thread',
  status text not null default 'active' check (
    status in ('active', 'archived')
  ),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advisor_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.advisor_threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role text not null check (
    role in ('user', 'assistant', 'system')
  ),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists marketing_assets_user_business_type_created_idx
  on public.marketing_assets (user_id, business_id, asset_type, created_at desc);

create index if not exists marketing_assets_user_business_role_created_idx
  on public.marketing_assets (user_id, business_id, role_id, created_at desc);

create index if not exists marketing_assets_business_updated_idx
  on public.marketing_assets (business_id, updated_at desc);

create index if not exists marketing_assets_business_role_updated_idx
  on public.marketing_assets (business_id, role_id, updated_at desc);

create index if not exists marketing_assets_role_type_idx
  on public.marketing_assets (role_id, asset_type);

create index if not exists advisor_threads_user_business_updated_idx
  on public.advisor_threads (user_id, business_id, updated_at desc);

create index if not exists advisor_messages_thread_created_idx
  on public.advisor_messages (thread_id, created_at);

create index if not exists advisor_messages_user_business_created_idx
  on public.advisor_messages (user_id, business_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_marketing_assets_updated_at on public.marketing_assets;

create trigger set_marketing_assets_updated_at
before update on public.marketing_assets
for each row
execute function public.set_updated_at();

drop trigger if exists set_advisor_threads_updated_at on public.advisor_threads;

create trigger set_advisor_threads_updated_at
before update on public.advisor_threads
for each row
execute function public.set_updated_at();

alter table public.marketing_assets enable row level security;
alter table public.advisor_threads enable row level security;
alter table public.advisor_messages enable row level security;

grant select, insert, update, delete on public.marketing_assets to authenticated;
grant select, insert, update, delete on public.advisor_threads to authenticated;
grant select, insert, update, delete on public.advisor_messages to authenticated;

drop policy if exists "Marketing assets are owned by business owner" on public.marketing_assets;

create policy "Marketing assets are owned by business owner"
on public.marketing_assets
for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.businesses b
    where b.id = marketing_assets.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.businesses b
    where b.id = marketing_assets.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "Advisor threads are owned by business owner" on public.advisor_threads;

create policy "Advisor threads are owned by business owner"
on public.advisor_threads
for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.businesses b
    where b.id = advisor_threads.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.businesses b
    where b.id = advisor_threads.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "Advisor messages are owned by business owner" on public.advisor_messages;

create policy "Advisor messages are owned by business owner"
on public.advisor_messages
for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.advisor_threads t
    where t.id = advisor_messages.thread_id
      and t.user_id = auth.uid()
      and t.business_id = advisor_messages.business_id
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.advisor_threads t
    where t.id = advisor_messages.thread_id
      and t.user_id = auth.uid()
      and t.business_id = advisor_messages.business_id
  )
);
```
