# KAABE AI Automation Platform

This is the new, isolated development track for KAABE's workflow automation engine. The original static site and Supabase integration on main remain untouched.

## Existing repository audit
- Static HTML/CSS/JavaScript site: index.html, dashboard.html, automations.html, flow-studio.html.
- Existing browser-side automation management: automations.js.
- Supabase browser client: supabase-config.js.
- Supabase Edge Functions: supabase/functions/.
- Existing root package.json is a pnpm workspace definition, not a verified standalone workflow engine.
- Existing README describes KAABE V4 as a GitHub Pages landing page.
- Existing deployment, policies, production integrations, and workflow execution have NOT been verified.

## Product architecture
- Three editors share one versioned workflow JSON format: AI chat builder, step-by-step wizard, advanced graph.
- Workflow runtime executes validated graphs on a secure server/worker, never in the public browser.
- Connector SDK handles OAuth, provider tokens, triggers, actions and normalized errors.
- Supabase/Postgres stores workspaces, workflows, versions, runs and audit events with enforced tenant isolation.
- AI agents require tool permissions and confirmation for consequential actions.
- Frontend should migrate incrementally; preserve existing functionality until replacements are tested.

## Development phases
1. Typed workflow schema, validation and safe execution design.
2. Server runtime, durable queue, idempotency, retries, persistence.
3. API and user-facing builder.
4. Gmail, Sheets, Telegram, Airtable, WhatsApp Business integrations.
5. AI agents, knowledge, billing, monitoring, multilingual UX.
6. Security, E2E tests and deployment.

No external integration is considered live until authorized credentials and real provider tests succeed.

## Safety rules
Do not remove the existing frontend or overwrite production settings. Never commit secrets. Implement on this branch and merge only after review.
