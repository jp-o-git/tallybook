import type { ReactNode } from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  busy = false,
  error,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="mt-4 text-sm leading-relaxed">{children}</div>

      {error && (
        <p role="alert" className="mt-4 text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="min-h-11 cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 font-bold hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="min-h-11 cursor-pointer rounded bg-rose-700 px-4 py-2 font-bold text-white enabled:hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
