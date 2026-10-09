import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Button from '../components/Button'

const links = [
  { to: '/', label: 'Overview' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const currentActive = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'underline underline-offset-5 decoration-gray-700' : ''

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center px-6 ${
      isActive
        ? 'font-bold underline underline-offset-5 decoration-gray-700'
        : ''
    }`

  // Close the mobile menu on outside click, Escape, scroll, or growing to desktop
  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)

    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onResize = () => {
      if (window.innerWidth >= 768) close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  function goToNewOrder() {
    setOpen(false)
    navigate('/orders/new')
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <nav
        ref={navRef}
        aria-label="Main"
        className="relative w-full border-b border-stone-300"
      >
        <div className="flex flex-row items-center justify-between px-4 py-4 sm:px-6">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="text-2xl Georgia"
          >
            Tallybook
          </NavLink>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={currentActive}>
                {link.label}
              </NavLink>
            ))}
            <Button Label="New Order" onClick={goToNewOrder} />
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex size-11 cursor-pointer items-center justify-center md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-20 border-b border-stone-300 bg-stone-50 py-2 md:hidden"
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={mobileLink}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="px-6 pb-2 pt-3 [&>button]:w-full">
              <Button Label="New Order" onClick={goToNewOrder} />
            </div>
          </div>
        )}
      </nav>

      <main className="p-4 sm:p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  )
}
