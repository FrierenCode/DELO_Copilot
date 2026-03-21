type InquiryInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function InquiryInput({ value, onChange, disabled }: InquiryInputProps) {
  return (
    <textarea
      rows={8}
      placeholder="이곳에 문의 내용을 입력하세요..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="p-textarea w-full rounded-2xl border-none p-6 text-sm font-medium leading-relaxed transition-all disabled:opacity-50"
      style={{ resize: "vertical" }}
    />
  );
}
