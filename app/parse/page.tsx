import { ParseInterface } from "@/components/ParseInterface";

export default function ParsePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Parse</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Test the parse pipeline. Paste any brand inquiry to inspect the full parse output.
        </p>
      </div>
      <ParseInterface />
    </div>
  );
}
