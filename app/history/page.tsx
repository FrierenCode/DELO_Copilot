export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">History</h1>
        <p className="mt-1 text-sm text-neutral-500">Your past deal inquiries.</p>
      </div>
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
        <p className="text-sm text-neutral-500">Deal history will appear here.</p>
      </div>
    </div>
  );
}
