import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import type { ReplyDrafts } from "@/types/parse-api";

type ReplyCardProps = {
  drafts: ReplyDrafts;
};

type ReplyBlockProps = {
  label: string;
  text: string | null;
  locked?: boolean;
};

function ReplyBlock({ label, text, locked }: ReplyBlockProps) {
  if (locked || text === null) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {label}
          </span>
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
            Pro
          </span>
        </div>
        <p className="text-sm text-neutral-400">Upgrade to Pro to unlock this reply.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <CopyButton text={text} />
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{text}</pre>
    </div>
  );
}

export function ReplyCard({ drafts }: ReplyCardProps) {
  return (
    <Card title="Reply Drafts">
      <div className="flex flex-col gap-4">
        <ReplyBlock label="Polite reply" text={drafts.polite} />
        <ReplyBlock label="Quick reply" text={drafts.quick} />
        <ReplyBlock label="Negotiation reply" text={drafts.negotiation} />
      </div>
    </Card>
  );
}
