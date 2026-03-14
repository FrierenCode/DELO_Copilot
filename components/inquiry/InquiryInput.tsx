import { TextArea } from "@/components/ui/TextArea";

type InquiryInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function InquiryInput({ value, onChange, disabled }: InquiryInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">
        Paste inquiry message
      </label>
      <TextArea
        rows={8}
        placeholder="Paste the brand's email or DM here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
