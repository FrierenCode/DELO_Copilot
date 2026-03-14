import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export function Card({ title, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border border-neutral-200 bg-white p-5 shadow-sm", className)}
      {...props}
    >
      {title && (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
