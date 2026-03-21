import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export function Card({ title, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800", className)}
      {...props}
    >
      {title && (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
