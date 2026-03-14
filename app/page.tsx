import { ParseInterface } from "@/components/ParseInterface";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Creator Deal Copilot
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Paste a brand inquiry to get a parsed deal structure, quote, checks, and reply drafts.
        </p>
      </div>
      <ParseInterface />
    </div>
  );
}
