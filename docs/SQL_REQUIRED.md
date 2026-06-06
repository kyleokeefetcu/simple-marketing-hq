# SQL Required

SQL is required for the production SaaS because Simple Marketing HQ uses user accounts, multiple Business / Client profiles, saved LaunchPad Diagnostics, LaunchPad Growth Scores, LaunchPad Action Plans, check-ins, visitor intelligence, referral foundations, and subscription-ready records.

No additional SQL is required for the current multi-business/client UI update if you already ran the SQL below. The existing schema supports:

- Multiple businesses per user through `public.businesses.owner_id`.
- Per-business diagnostics through `public.launchpad_diagnostics.business_id`.
- Per-business website analyses, recommendations, check-ins, generated assets, visitor records, referral records, and partner recommendations through existing `business_id` columns.
- RLS ownership by user and by owned business records.

Future team workspaces will require new workspace/membership tables, but the current requirement is supported by the existing user account as the account/workspace layer.

Run the full SQL below in the Supabase SQL Editor before depending on production persistence. The app can still preserve local diagnostic progress in the browser if Supabase environment variables are not configured.

```sql
-- Simple Marketing HQ production schema
-- Run this in the Supabase SQL Editor before relying on production persistence.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  website_url text,
  description text,
  services text,
  service_area text,
  ideal_customer text,
  booking_link text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.launchpad_diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  status text not null default 'completed',
  website_url text,
  summary jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.launchpad_answers (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.launchpad_diagnostics(id) on delete cascade,
  question_key text not null,
  answer_text text,
  answer_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.website_analyses (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid references public.launchpad_diagnostics(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  website_url text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.launchpad_scores (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.launchpad_diagnostics(id) on delete cascade,
  growth_score integer not null check (growth_score between 0 and 100),
  offer_strength integer,
  messaging_clarity_grade text,
  lead_flow_grade text,
  speed_to_lead_grade text,
  appointment_conversion_risk text,
  traffic_dependency_risk text,
  created_at timestamptz not null default now()
);

create table if not exists public.launchpad_action_plans (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid not null references public.launchpad_diagnostics(id) on delete cascade,
  biggest_bottleneck text not null,
  highest_leverage_next_move text not null,
  recommended_growth_path text,
  action_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.launchpad_recommendations (
  id uuid primary key default gen_random_uuid(),
  diagnostic_id uuid references public.launchpad_diagnostics(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  category text,
  priority integer not null default 1,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  leads_count integer,
  booked_calls_count integer,
  referrals_count integer,
  notes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  asset_type text not null,
  prompt text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_companies (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  company_name text,
  domain text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  visitor_company_id uuid references public.visitor_companies(id) on delete set null,
  event_type text not null,
  page_url text,
  source text,
  utm jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_profiles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  short_description text,
  best_referral_types text,
  referral_reward text,
  contact_method text,
  social_links jsonb not null default '{}'::jsonb,
  proof jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_partners (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  partner_business_id uuid references public.businesses(id) on delete set null,
  partner_name text not null,
  status text not null default 'invited',
  created_at timestamptz not null default now()
);

create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  referral_partner_id uuid references public.referral_partners(id) on delete set null,
  event_type text not null,
  contact_name text,
  value numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_recommendations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  diagnostic_id uuid references public.launchpad_diagnostics(id) on delete cascade,
  partner_type text not null,
  title text not null,
  reason text,
  url text,
  priority integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.launchpad_diagnostics enable row level security;
alter table public.launchpad_answers enable row level security;
alter table public.website_analyses enable row level security;
alter table public.launchpad_scores enable row level security;
alter table public.launchpad_action_plans enable row level security;
alter table public.launchpad_recommendations enable row level security;
alter table public.check_ins enable row level security;
alter table public.generated_assets enable row level security;
alter table public.visitor_companies enable row level security;
alter table public.visitor_events enable row level security;
alter table public.referral_profiles enable row level security;
alter table public.referral_partners enable row level security;
alter table public.referral_events enable row level security;
alter table public.subscriptions enable row level security;
alter table public.partner_recommendations enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

create policy "Businesses owned by user" on public.businesses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Diagnostics owned by user" on public.launchpad_diagnostics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Answers through owned diagnostics" on public.launchpad_answers
  for all using (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create policy "Website analyses through owned records" on public.website_analyses
  for all using (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "Scores through owned diagnostics" on public.launchpad_scores
  for all using (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create policy "Action plans through owned diagnostics" on public.launchpad_action_plans
  for all using (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create policy "Business-linked records owned by business owner" on public.launchpad_recommendations
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create policy "Check-ins owned by user" on public.check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Generated assets owned by user" on public.generated_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Visitor companies through owned business" on public.visitor_companies
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "Visitor events through owned business" on public.visitor_events
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "Referral profiles through owned business" on public.referral_profiles
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "Referral partners through owned business" on public.referral_partners
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "Referral events through owned business" on public.referral_events
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

create policy "Subscriptions owned by user" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Partner recommendations through owned business" on public.partner_recommendations
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.launchpad_diagnostics d
      where d.id = diagnostic_id and d.user_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
