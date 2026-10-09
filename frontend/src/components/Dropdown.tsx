type Option = { value: string; label: string }

export default function Dropdown({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Option[]
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-blue-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
