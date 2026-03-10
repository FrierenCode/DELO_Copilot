# Creator Deal Copilot

Creator Deal Copilot is a Next.js app for turning inbound brand inquiries into structured deal records, quote guidance, risk checks, and reply drafts.

The current codebase supports:

- LLM-based inquiry parsing with primary/fallback model routing
- Quote calculation from a creator profile plus parsed inquiry data
- Check generation for missing or risky deal terms
- Reply draft generation for `polite`, `quick`, and `negotiation` tones
- Deal persistence in Supabase with reply drafts, checks, status logs, and usage events
- Free/pro usage guards, dashboard alerts, structured logging, PostHog analytics, and optional Sentry reporting

## Stack

- Next.js 15
- React 19
- TypeScript
- Zod
- Supabase
- OpenAI SDK
- Google Generative AI SDK
- Anthropic SDK
- Sentry for error reporting
- PostHog for analytics

## Core Flow

1. A user submits raw inquiry text from email, DM, or another source.
2. `parseService` runs LLM parsing and normalizes the extracted fields.
3. The app computes quote guidance and unresolved deal checks.
4. The reply generator creates three draft variants.
5. `POST /api/deals` persists the deal, checks, drafts, and usage events.
6. `GET /api/deals` returns saved deals plus dashboard alert counts.

## API

### `GET /api/health`

Returns a simple health payload:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### `POST /api/inquiries/parse`

Runs the full parse -> quote -> checks -> reply flow without saving a deal.

Request body:

```json
{
  "raw_text": "Hello, we are interested in one Instagram reel and three story frames next month.",
  "source_type": "email"
}
```

Response data includes:

- `parsed_json`
- `quote_breakdown`
- `checks`
- `missing_fields`
- `reply_drafts`

### `GET /api/deals`

Authenticated endpoint that returns:

- `deals`
- `alerts`

Alerts currently include:

- `overdue_followups`
- `payment_overdue`
- `deadline_soon`
- `unresolved_checks`

### `POST /api/deals`

Authenticated endpoint that parses an inquiry if needed, builds the deal payload server-side, and persists:

- `deals`
- `deal_checks`
- `reply_drafts`
- `usage_events`

Request body:

```json
{
  "raw_text": "Hi, we'd like to discuss a paid TikTok collaboration.",
  "source_type": "dm",
  "selected_reply_tone": "negotiation"
}
```

Optional `parsed_json` can be supplied, but it is validated on the server before use.

## LLM Pipeline

Inquiry parsing uses `services/parse-llm-service.ts`.

- Primary and fallback models are selected through `lib/llm/registry.ts`
- Prompt text lives in `lib/llm/prompts/`
- Parse responses are normalized before schema validation
- Empty responses, fenced JSON, provider errors, and schema failures are handled explicitly

Negotiation replies use the same client abstraction and fall back to template output when generation fails or returns empty text.

## Data Model

The initial Supabase schema lives in [`supabase/migrations/001_create_deal_tables.sql`](/C:/Users/PC/Desktop/모음/business/creator-deal-copilot/supabase/migrations/001_create_deal_tables.sql).

Main tables:

- `deals`
- `deal_checks`
- `deal_status_logs`
- `reply_drafts`
- `user_plans`
- `usage_events`

The migration also enables row-level security policies scoped to the authenticated user.

## Local Setup

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

## Environment Variables

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional LLM providers:

```env
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ANTHROPIC_API_KEY=
```

Optional observability:

```env
SENTRY_DSN=
POSTHOG_API_KEY=
```

## Project Structure

```text
app/
  api/
    deals/
    health/
    inquiries/parse/
lib/
  analytics.ts
  llm/
  logger.ts
  sentry.ts
  supabase/
repositories/
services/
supabase/
  migrations/
tests/
  parse-dataset/
types/
```

## Current Limitations

- The creator profile used for quote generation is still a server-side stub.
- There is no dedicated dashboard UI in this repository yet; the main completed surface is the API layer.
- The `tests/parse-dataset/` folder contains fixture data, but there is no automated test runner wired into `package.json` yet.
- Free-plan limits are hard-coded in `services/usage-guard.ts`.
