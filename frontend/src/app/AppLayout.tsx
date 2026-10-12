import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  X,
} from 'lucide-react'
import Button from '../components/Button'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const currentActive = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-900'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium ${
      isActive ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
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
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <nav
        ref={navRef}
        aria-label="Main"
        className="relative z-20 w-full border-b border-slate-200 bg-white"
      >
        <div className="mx-auto flex min-h-[4.5rem] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-3 rounded-lg"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#163a5f] text-white shadow-sm">
              <BookOpen size={20} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                Tallybook
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">Inventory & sales</span>
            </span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={currentActive}
              >
                <link.icon size={17} strokeWidth={1.8} aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}
            <Button Label="New order" onClick={goToNewOrder} className="ml-3" />
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          >
            {open ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-20 border-b border-slate-200 bg-white px-4 py-3 shadow-lg md:hidden"
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={mobileLink}
              >
                <link.icon size={18} strokeWidth={1.8} aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}

            <div className="pt-3 [&>button]:w-full">
              <Button Label="New Order" onClick={goToNewOrder} />
            </div>
          </div>
        )}
      </nav>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  )
}
