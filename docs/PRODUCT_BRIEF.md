# Product Brief

## Simple Marketing HQ Master Prompt

Source of truth for the MVP build.

Public app name: Simple Marketing HQ
Main URL: simplemarketinghq.com
Internal framework name: LaunchPad
Positioning: AI marketing advisor for small businesses.

Critical naming rule: Do not use "LaunchPad Marketing Hub" as the public product name. Use Simple Marketing HQ for the app, PWA, metadata, landing page, auth, dashboard, pricing, account, settings, legal, and customer-facing references. Use LaunchPad only for the internal diagnostic/advisor experience: LaunchPad Diagnostic, LaunchPad Growth Score, LaunchPad Action Plan, LaunchPad Advisor, LaunchPad Recommendations, LaunchPad Growth Plan, re-entry check-ins, and diagnostic history.

Simple Marketing HQ is being built as a sellable SaaS from the beginning, not a demo or internal tool. It should support a public marketing website, user accounts/login, saved diagnostics, customer dashboard, mobile-first PWA experience, polished desktop experience, subscription-ready architecture, future paid upgrade paths, saved business profiles, recurring check-ins, diagnostic history, referral partner foundation, visitor intelligence/RB2B tracking foundation, and customer dashboards.

Simple Marketing HQ is not a generic CRM, complicated analytics dashboard, all-in-one marketing automation platform, app store marketplace, social network, or replacement for every marketing tool. It is a simple AI marketing advisor, marketing diagnostic platform, business growth guidance system, practical action-plan tool, PWA-first SaaS product, and tool that diagnoses marketing bottlenecks and recommends the next best move.

Core promise: Simple Marketing HQ helps small businesses figure out what is blocking their marketing growth and what action to take next.

Core experience: A user comes to Simple Marketing HQ, completes the LaunchPad Diagnostic, gets a LaunchPad Growth Score, receives a LaunchPad Action Plan, and can use the LaunchPad Advisor to understand and execute the next best marketing move.

## MVP Requirements

Before coding, inspect the repo, identify the app structure, search for old naming, identify renames, identify SQL/database changes, provide full SQL if required, identify environment variables, and state what will be built.

Create or update a central brand/config file with constants for APP_NAME, APP_SHORT_NAME, APP_DOMAIN, APP_URL, and FRAMEWORK_NAME.

PWA metadata: name Simple Marketing HQ, short_name Simple HQ, description AI marketing advisor for small businesses, theme color matching the app, installable/mobile-first.

Public routes: /, /pricing, /how-it-works, /login, /signup.

App routes: /dashboard, /diagnostic, /diagnostic/result, /dashboard/message, /dashboard/customers, /dashboard/website, /dashboard/visibility, /dashboard/referrals, /dashboard/follow-up, /dashboard/momentum, /content-engine, /check-in, /settings, /billing.

Landing page sections: hero, how it works, LaunchPad Diagnostic, LaunchPad Growth Score, LaunchPad Action Plan, who it is for, free vs paid value, CTA to start diagnostic.

Hero headline: Simple marketing guidance for small businesses that want more leads.
Hero subheadline: Complete the LaunchPad Diagnostic, get your Growth Score, and see the next best move to improve your marketing.
Primary CTA: Start Your Free Diagnostic.
Secondary CTA: See How It Works.

Auth/SaaS readiness: sign up, login, logout, user account, saved diagnostics, saved business profile, customer dashboard, diagnostic history, upgrade path placeholders, subscription-ready architecture. Supabase is the clean production approach. SQL must be exact and available before relying on production persistence.

Core tables: profiles, businesses, launchpad_diagnostics, launchpad_answers, website_analyses, launchpad_scores, launchpad_action_plans, launchpad_recommendations, check_ins, generated_assets, visitor_events, visitor_companies, referral_profiles, referral_events, referral_partners, subscriptions or billing_status placeholder, partner_recommendations.

## Core App Flow

1. User lands on Simple Marketing HQ public site.
2. User starts the LaunchPad Diagnostic.
3. User creates account or begins a lightweight quiz first.
4. User enters business website URL early.
5. App analyzes the website with a placeholder or crawler/API later.
6. Diagnostic asks simple confirmation and prioritization questions.
7. App generates LaunchPad Growth Score, bottleneck diagnosis, LaunchPad Action Plan, and recommended next move.
8. User lands in the Simple Marketing HQ dashboard.
9. Dashboard shows their LaunchPad Growth Plan and modules.
10. User can return later for weekly check-ins, updated recommendations, referral tracking, visitor insights, and content generation.

## LaunchPad Diagnostic

Quiz style inspired by Mad Muscles: one question per screen, progress bar, simple choices, large tap targets, mobile-first, clean desktop layout, encouraging but not cheesy, insight reveals throughout, minimal typing, and plain business-owner language.

Gather: what are you selling, who are you selling to, what result customers want most, current offer, how leads come in, where leads fall through, response speed, and current marketing channels. Ask for the website URL early.

Website analysis should eventually extract business name, services, offer, homepage headline, primary CTA, trust signals, lead capture methods, testimonials/reviews, service area, SEO basics, page title/meta basics, positioning, unclear messaging, weak/missing CTA, missing proof, and conversion bottlenecks.

Final free output: LaunchPad Growth Score, Offer Strength Score, Messaging Clarity Grade, Lead Flow Grade, Speed-to-Lead Grade, Appointment Conversion Risk, Traffic Dependency Risk, Biggest Bottleneck, Highest-Leverage Next Move, LaunchPad Action Plan, Recommended Growth Path, Top 3 Action Items.

Free philosophy: diagnosis, clarity, and momentum. Paid philosophy: execution, optimization, and scale.

## Dashboard

Dashboard is branded Simple Marketing HQ and should feel like “Your business growth game plan.” Use light KPI cards only: leads, booked calls, repeat visitors, high-intent visitors, referral shares, referrals received, missed opportunities, current LaunchPad Growth Score.

Dashboard modules: Your Message, Your Customers, Your Website, Your Visibility, Your Referrals, Your Follow-Up, Your Momentum.

Your Message: offer, headline, positioning, elevator pitch, scripts.
Your Customers: ideal customer, pain points, goals, industries/neighborhoods, referral sources.
Your Website: website diagnosis, CTA review, trust signals, lead capture, Fred AI/chat placeholder, RB2B visitor intelligence placeholder.
Your Visibility: SEO, Google Business Profile, social content, paid ads, recommendations.
Your Referrals: referral partner profile, shareable profile, ideal referral description, referral tracking foundation, power team concept.
Your Follow-Up: speed-to-lead, missed opportunity warnings, scripts, email/SMS placeholders, response recommendations.
Your Momentum: weekly traction, check-ins, leads, booked calls, referrals, repeat visitors, recommended next action.

## Check-ins, Content, Visitors, Referrals

Re-entry check-in after inactivity: “Welcome back. Let’s update your LaunchPad Growth Plan.” Ask what changed, what works, what does not, what service to push, what customer to pursue, offer changes, and lead flow changes.

Weekly check-ins ask leads, booked calls, objections, customer comments, content performance, business changes, referrals, and missed follow-ups.

Stop Stack Content Engine: first 1.5 seconds matter most. Stop first, then stack meaning and tension with visual, audio, text, and statement hooks. Generate short-form hooks, ads, social posts, YouTube hooks, email subject lines, landing page openers, and campaign ideas. Avoid generic copy.

RB2B/Visitor Intelligence: company-level by default, privacy-conscious, not creepy, no unnecessary personal data. Track repeat visits, high-intent behavior, pages viewed, frequency, company-level identification, source/UTM, pricing/contact/services page views, form submissions, Fred usage placeholder, and lead conversion. Personal fields optional/config-controlled.

Visitor UI cards: Repeat Visitors, High Intent Visitors, Companies Visiting, Hot Pages, Suggested Follow-Up.

Referral partner foundation: professional referral partner network, trusted referral partners, business referral circle, power teams. Referral-ready profile includes business name, logo, description, services, service area, ideal customer, referral types, reward, contact method, booking link, website, social links, proof. Actions: Share Profile, Refer Someone, Request Intro, Invite Referral Partner, Save Trusted Partner, Create Power Team placeholder.

Partner recommendations should be focused, not a marketplace. Language: “Based on your diagnosis, ignore everything else. This is your next highest-leverage move.”

Industry-agnostic: local businesses, professional services, agencies, creators, digital products, home services, coaches, consultants, B2B services, and real estate/wholesaling as one use case.

AI should analyze website data, summarize positioning, infer ideal customers, score diagnostics, generate LaunchPad Growth Score, create LaunchPad Action Plan, generate Stop Stack hooks, action items, recommendations, summarize check-ins, and update recommendations over time using structured JSON when practical.

## Build Phases

Phase 1: rebrand, PWA metadata, public landing page, auth-ready structure, mobile-first LaunchPad Diagnostic, website URL capture, website analysis placeholder or crawler if feasible, diagnostic result, LaunchPad Growth Score, LaunchPad Action Plan, saved diagnostic architecture.

Phase 2: customer dashboard, modules, check-in flow, diagnostic history, Stop Stack content engine.
Phase 3: RB2B/visitor intelligence architecture, visitor events model, simple intent UI.
Phase 4: referral profile, referral tracking foundation, referral KPI cards.
Phase 5: paid plan gates, billing/subscription placeholders, partner recommendation engine, richer AI recommendations.

Design requirements: mobile-first, PWA-first, polished desktop, large tap targets, clean spacing, simple language, practical business-owner tone, no clutter, no CRM overload, no giant analytics dashboard, no public-facing LaunchPad Marketing Hub references, clear CTAs, clear free-to-paid upgrade path, action-first recommendations.

## Acceptance Criteria

The MVP is successful when a user can visit Simple Marketing HQ, understand that it is an AI marketing advisor for small businesses, start the LaunchPad Diagnostic, enter a website URL, complete a simple quiz one question at a time, get a LaunchPad Growth Score, see their biggest marketing bottleneck, receive a LaunchPad Action Plan, create or log into an account, save their diagnostic, land on a Simple Marketing HQ dashboard, view core modules, generate at least one Stop Stack content/campaign idea, complete a simple check-in, see RB2B/visitor intelligence placeholders, create a basic referral-ready business profile, and see a clear free vs paid upgrade path.

Final instruction: Build this as a real SaaS MVP, not just a mockup. Simple Marketing HQ is the public product. LaunchPad is the internal diagnostic/advisor framework. Keep the app simple, practical, mobile-first, monetization-ready, and focused on helping small businesses know what to do next to get more leads and booked calls.
