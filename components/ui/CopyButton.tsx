"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  text: string;
  className?: string;
};

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "rounded-md border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100",
        copied && "border-green-300 text-green-700",
        className,
      )}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
