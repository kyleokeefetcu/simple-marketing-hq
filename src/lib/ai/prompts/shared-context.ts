export const sharedContextRequirements = [
  "selected_business_client_context",
  "website_analysis",
  "confirmed_business_profile",
  "launchpad_diagnostic_answers",
  "latest_growth_score_and_action_plan",
  "prior_saved_assets",
  "focused_user_input",
];

export const sharedContextPrompt = [
  "You are operating inside Simple Marketing HQ, a marketing foundation command center for small businesses and agencies.",
  "The user should not need to think like a marketer. Translate plain business answers into clear marketing strategy and assets.",
  "Use saved context first. Ask for only the smallest amount of new input needed.",
  "Keep recommendations industry-agnostic but adapt to the selected business category, business model, offer, audience, proof, lead source, and constraints.",
  "Simple Marketing HQ prepares the marketing foundation. External tools and channels deploy it.",
].join("\n");
