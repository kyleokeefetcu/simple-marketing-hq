# RB2B Setup

Simple Marketing HQ has two separate RB2B use cases. They are not interchangeable.

## Use Case 1: Simple Marketing HQ Site Tracking

This tracks visits to our own public product website and app domain, `simplemarketinghq.com`.

Use `NEXT_PUBLIC_RB2B_SCRIPT_ID` only for our own browser tracking script if RB2B provides a script ID from a snippet such as:


```js
reb2b.load("YOUR_SCRIPT_ID")
```

Environment variable:

```bash
NEXT_PUBLIC_RB2B_SCRIPT_ID=
```

Rules:

- This value is browser-visible.
- Leave it blank until we have the browser script ID for `simplemarketinghq.com`.
- If it is blank, Simple Marketing HQ does not load the RB2B browser script.
- Do not put the private API key here.
- Do not use this as a universal script for customer/client websites.

## Use Case 2: Customer / Client Website Visitor Tracking

This is separate from our own site tracking.

Each business/client website needs its own approved tracking setup and domain configuration. Do not install one global Simple Marketing HQ RB2B script across all customer websites.

Customer/client website visitor tracking may require RB2B API Partner or OEM Partner approval. Activation depends on RB2B confirming the correct partner flow, domain management rules, customer/domain segmentation, webhook behavior, and allowed dashboard display terms.

Until that is confirmed:

- Do not generate customer-specific RB2B scripts or pixels.
- Do not make live RB2B API calls.
- Do not register customer domains through the API.
- Do not expose a customer installation snippet in the app.
- Do not use `NEXT_PUBLIC_RB2B_SCRIPT_ID` for customer/client websites.
- Keep customer visitor intelligence UI disabled and clearly marked as requiring partner/OEM setup.

## Private API Key

Use this for server-side RB2B API access from Postman/API docs.

Environment variable:

```bash
RB2B_API_KEY=YOUR_PRIVATE_RB2B_API_KEY
```

Rules:

- This value is private.
- Do not expose it to the browser.
- Do not prefix it with `NEXT_PUBLIC_`.
- Use it only in server-side routes, server actions, or server-only modules.
- Do not use it as the browser script ID.
- Do not use it to create a browser script.
- Do not use it for live customer website tracking until the partner/OEM integration flow is approved.

## Planned Customer Tracking Architecture

When approved, customer/client website visitor tracking should use a server-side integration pattern:

1. Store each approved business/client domain against the correct `business_id`.
2. Register or remove that domain through the RB2B-approved partner/OEM domain flow.
3. Provide the customer with only the approved install instructions for that domain.
4. Receive RB2B webhook/API data server-side.
5. Map every visitor/company event to the correct `business_id`.
6. Show each customer only their own visitor/company records.
7. Respect customer consent, privacy policy, and regional tracking requirements.

## Current Implementation

- Browser tracking for Simple Marketing HQ remains disabled unless `NEXT_PUBLIC_RB2B_SCRIPT_ID` exists.
- Customer/client website tracking is disabled.
- `RB2B_API_KEY` is prepared for server-side integration only and is not exposed to the browser.
- `/api/rb2b/status` reports whether RB2B values are configured without returning secrets.
- No live RB2B API calls are made yet.
