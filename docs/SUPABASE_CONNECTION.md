# Supabase Connection

Create `.env.local` in the project root with these values from your Supabase project.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RB2B_SCRIPT_ID=
RB2B_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Where to find them:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase dashboard, Project Settings, API, Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase dashboard, Project Settings, API, anon public key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase dashboard, Project Settings, API, service_role key.

Security rules:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are browser-safe.
- `SUPABASE_SERVICE_ROLE_KEY` is not browser-safe. Use it only in server-side code.
- Do not add real secrets to GitHub.
- Leave `NEXT_PUBLIC_RB2B_SCRIPT_ID` blank unless you have the browser script ID from `reb2b.load("...")` for `simplemarketinghq.com`.
- Store the private RB2B API key only in `RB2B_API_KEY`; never use it as the browser script ID.
- `NEXT_PUBLIC_RB2B_SCRIPT_ID` is only for Simple Marketing HQ site tracking, not customer/client websites.
- Customer/client website visitor tracking remains disabled until RB2B confirms the correct API Partner or OEM Partner integration flow and customer domain configuration process.

The app can use the tables created by `docs/SQL_REQUIRED.md` once these values are present and Supabase Auth is enabled.

Password reset uses these app routes:

- `/forgot-password`
- `/reset-password`

Add the reset URL to Supabase Auth redirect URLs for each environment:

- Local: `http://localhost:3000/reset-password`
- Production: `https://simplemarketinghq.com/reset-password`
