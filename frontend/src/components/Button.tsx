export default function Button({
  Label,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: {
  Label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`btn-dark-blue inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {Label}
    </button>
  );
}
