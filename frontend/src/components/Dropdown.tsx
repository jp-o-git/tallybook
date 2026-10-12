type Option = { value: string; label: string };

export default function Dropdown({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}) {
  return (
    <label className="relative flex flex-col gap-1 text-sm">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`field-control min-h-11 cursor-pointer text-sm ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
