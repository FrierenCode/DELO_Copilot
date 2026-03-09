import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="container flex min-h-screen flex-col items-start justify-center gap-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Creator Deal Copilot
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Manage creator-brand partnerships from outreach to payout.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Initial app scaffold is ready with Next.js 15, Tailwind, shadcn/ui, and Supabase.
        </p>
        <Button asChild>
          <a href="/api/health">Check API Health</a>
        </Button>
      </section>
    </main>
  );
}
