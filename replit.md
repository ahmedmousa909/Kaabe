# AUNO AI Automation Platform

AUNO helps small and medium-sized businesses build AI assistants and visual workflows, manage customer work, and monitor automation activity.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (managed PORT)
- `pnpm --filter @workspace/auno run typecheck` — check the frontend
- `pnpm --filter @workspace/auno run build` — build the static site and SPA fallback
- `pnpm run typecheck` — check the workspace
- The managed frontend workflow is `artifacts/auno: web`.
- Public client configuration: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Do not use a Supabase service-role key in any `VITE_` variable.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React, TypeScript, Vite, Tailwind, shadcn component scaffold, React Router and Lucide
- Flow Studio: XYFlow and Zustand
- Authentication: the Supabase JavaScript client
- Existing workspace libraries include Express, OpenAPI code generation and Drizzle, but AUNO does not currently use the built-in database.

## Where things live

- `artifacts/auno/src/App.tsx` — routes, guards and auth forms
- `artifacts/auno/src/lib/` — Supabase client and verified session provider
- `artifacts/auno/src/components/` — marketing site, workspace shell, onboarding and Flow Studio
- `artifacts/auno/src/store/workflow-editor.ts` — editable graph and local editor history
- `artifacts/auno/.env.example` — empty public-client configuration example
- `artifacts/auno/README.md` — current capabilities and setup boundaries

## Architecture decisions

- The user explicitly requires their existing Supabase backend. Do not silently replace it with a Replit database or apply migrations to an unknown existing schema.
- Existing infrastructure: Supabase project `zrjuflogyaxortzktmbh` and GitHub repository `ahmedmousa909/Kaabe`. Preserve existing tables, workflows, Auth and WhatsApp subscriptions.
- Conceptual entity names are not instructions to recreate tables. Review legacy `automations`/`automation_runs` mappings and actual policies before any migration; never silently deploy database changes.
- The GitHub Pages frontend targets `/Kaabe/`; run `pnpm --filter @workspace/auno run build:pages`. Server execution remains separate.
- Supabase Auth is configured separately from the business data schema. Auth user metadata stores onboarding preferences only; it must never be used to authorize business membership or roles.
- All business routes require a verified Supabase session. Shared data still requires schema-aware membership enforcement and Supabase RLS/server-side authorization.
- Current workspace records are user-scoped browser drafts, not production business records. No live execution engine or provider connection is configured.

## Product

- Public marketing website using the supplied official AUNO logo and brand palette.
- Supabase sign-in, signup, recovery, OAuth entry point, callback, session and logout code; client settings supplied, successful real account flow not yet verified.
- Six-step business onboarding saves preferences to the signed-in Supabase account profile.
- Visual Flow Studio supports node creation, positioning, connections, reconnection, validation, graph editing history, duplication, copy/paste, auto-layout and saved browser drafts.
- Business database CRUD, genuine activity/analytics, customer channels, workflow execution, billing and advanced version/edge-routing features are unfinished and must remain accurately labeled.

## User preferences

- AUNO Flow Studio is the core product and must support editing on touch devices, not just desktop viewing.
- Never show fabricated customer messages or pretend sample activity is live business data.
- Every visible action must perform a meaningful operation or be explicitly unavailable with a reason.
- Mark a node production-available only when its actual execution handler exists. Drawing a connection is never proof of backend connectivity.
- Build in phases: foundation, core workflows, real execution, WhatsApp, business tools, then SaaS expansion. Never claim a phase production-ready before its working acceptance flow is executed.
- Progress reports must separate implemented/tested, implemented/untested, external configuration requirements and not-yet-implemented functionality. Mark tests passed only after execution.
- Store integration credentials only through authenticated server-side credential handling; never in workflow parameters, browser drafts or logs.
- Never ask customers to send credentials through chat.
- Never automatically migrate or modify a WhatsApp Business App number. Any supported onboarding or coexistence requires explicit customer authorization.
- Static GitHub Pages only hosts the frontend; reliable automation requires a separately hosted server/Edge Functions and durable background processing.
- Do not copy n8n’s interface, branding or visual design.
- English is the initial language unless the user changes it; support Somali, German and Arabic with Arabic RTL. Never translate stored identifiers or user-owned data.
- Use the official supplied logo; do not invent a replacement.

## Gotchas

- Supabase public client configuration has been supplied; the existing business schema/RLS policies are still missing.
- Server execution/security library code is not a configured production worker or live WhatsApp webhook. See `artifacts/api-server/src/lib/automation/README.md`.
- No provider credentials or billing provider have been connected.
- Live metadata inspection returned HTTP 401. Repository observations do not verify the deployed schema or RLS. See `artifacts/auno/docs/BACKEND_COMPATIBILITY.md`.
- For GitHub Pages, set `BASE_PATH` to the repository subpath during build and register matching Supabase callback URLs.
- API contract changes must precede code generation and corresponding backend/client changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
