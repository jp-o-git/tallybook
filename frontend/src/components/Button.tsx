export default function Button({
  Label,
  onClick,
  type = "button",
  disabled = false,
}: {
  Label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <button
      className="btn-dark-blue min-h-11 cursor-pointer enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {Label}
    </button>
  );
}
