import { useEffect, useRef, type ReactNode } from 'react'

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      // Focus the first field instead of the close button
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }

    // Stop the page behind the modal from scrolling
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose} // fires on Escape
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="m-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto border border-gray-300 bg-stone-50 p-0 text-stone-900 backdrop:bg-black/40 max-sm:m-0 max-sm:h-dvh max-sm:max-h-none max-sm:max-w-none"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-2xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 flex size-11 cursor-pointer items-center justify-center text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </dialog>
  )
}
