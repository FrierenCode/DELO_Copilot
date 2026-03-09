# Creator Deal Copilot

Initial SaaS boilerplate for creator-brand deal management built with Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Project Structure

- `app` - App Router pages and route handlers
- `app/api` - API endpoints (Route Handlers)
- `components` - Reusable UI components
- `lib` - Shared libraries and integrations (Supabase clients)
- `services` - Domain-level business services
- `db` - Database access layer placeholders
- `types` - Shared TypeScript types
- `utils` - Utility modules and env parsing

## Setup

```bash
npm install
```

Create a `.env.local` file from `.env.example` and fill in your Supabase values.

## Environment Variables

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Development

```bash
npm run dev
```

Health check endpoint:

- `GET /api/health`
- Response: `{ "status": "ok" }`
