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
        className={`min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-none transition-colors hover:border-gray-200 hover:shadow-none focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10 ${className}`}
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
