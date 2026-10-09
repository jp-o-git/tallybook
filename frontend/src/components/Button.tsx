export default function Button({
  Label,
  onClick,
  type = 'button',
}: {
  Label: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}) {
  return (
    <button
      className="btn-dark-blue min-h-11 cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={onClick}
      type={type}
    >
      {Label}
    </button>
  )
}
