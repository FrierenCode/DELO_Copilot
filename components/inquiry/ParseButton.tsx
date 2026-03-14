import { Button } from "@/components/ui/button";

type ParseButtonProps = {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
};

export function ParseButton({ onClick, loading, disabled }: ParseButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full sm:w-auto"
    >
      {loading ? "Analyzing…" : "Analyze Deal"}
    </Button>
  );
}
