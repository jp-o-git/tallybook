export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search Products',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 border border-gray-300 bg-white px-3 py-2 focus:outline-2 focus:outline-blue-900"
      />
    </label>
  )
}
