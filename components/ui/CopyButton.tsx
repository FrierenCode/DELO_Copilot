"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { trackClientEvent } from "@/lib/analytics-client";

type CopyButtonProps = {
  text: string;
  className?: string;
  onAfterCopy?: () => void;
};

export function CopyButton({ text, className, onAfterCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackClientEvent("reply_copied");
      setTimeout(() => setCopied(false), 2000);
      if (onAfterCopy) onAfterCopy();
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "rounded-md border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700",
        copied && "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400",
        className,
      )}
    >
      {copied ? "복사됨!" : "복사"}
    </button>
  );
}
