import { Input } from "@/components/ui/input";

export function TimeInput({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  return (
    <Input
      type="time"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-32"
    />
  );
}
