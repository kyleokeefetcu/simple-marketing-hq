# RB2B Setup

Simple Marketing HQ supports two different RB2B-related configuration values. They are not interchangeable.

## Browser Script ID

Use this only when you have the ID from a browser snippet like:

```js
reb2b.load("YOUR_SCRIPT_ID")
```

Environment variable:

```bash
NEXT_PUBLIC_RB2B_SCRIPT_ID=
```

Rules:

- This value is browser-visible.
- Leave it blank until you have the browser script ID.
- If it is blank, Simple Marketing HQ does not load the RB2B browser script.
- Do not put the private API key here.

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

## Current Implementation

- Browser tracking remains disabled unless `NEXT_PUBLIC_RB2B_SCRIPT_ID` exists.
- `RB2B_API_KEY` is prepared for server-side integration only.
- `/api/rb2b/status` reports whether RB2B values are configured without returning secrets.
- No live RB2B API calls are made yet.
