'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart'

const navLinks = [
  { href: '/pricing', label: 'Courses' },
  { href: '/#features', label: 'Features' },
  { href: '/contact', label: 'Contact' },
]

export function PublicNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const { items, count, total, removeItem } = useCart()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D9D9D9]">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="flex h-[90px] items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image
              src="/SkilledVisitsAcademyNEW.png"
              alt="Skilled Visits Academy"
              width={320}
              height={86}
              className="h-20 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] transition-colors ${
                  pathname === link.href
                    ? 'text-[#9E50E5] font-semibold'
                    : 'text-[#5B5B5B] hover:text-[#9E50E5]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Cart icon */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative p-2 rounded-lg text-[#5B5B5B] hover:bg-[#f5f5f5] transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#9E50E5] text-white text-[10px] font-bold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>

              {/* Mini cart dropdown */}
              {cartOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[#D9D9D9] shadow-xl z-50">
                  <div className="p-4">
                    <p className="text-xs font-semibold text-[#5B5B5B] uppercase tracking-wider mb-3">
                      Cart {count > 0 && `(${count})`}
                    </p>

                    {items.length === 0 ? (
                      <div className="py-6 text-center">
                        <ShoppingCart className="h-8 w-8 text-[#D9D9D9] mx-auto mb-2" />
                        <p className="text-sm text-[#5B5B5B]">Your cart is empty</p>
                        <Link
                          href="/pricing"
                          onClick={() => setCartOpen(false)}
                          className="inline-block mt-3 text-xs text-[#9E50E5] font-semibold hover:underline"
                        >
                          Browse courses →
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 mb-4 max-h-56 overflow-y-auto">
                          {items.map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center justify-between py-2.5 border-b border-[#EEEEEE] last:border-0"
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <p className="text-sm font-medium text-[#1a1a1a] truncate">{item.title}</p>
                                <p className="text-xs text-[#9E50E5] font-semibold">{item.price}</p>
                              </div>
                              <button
                                onClick={() => removeItem(item.key)}
                                className="text-[#D9D9D9] hover:text-red-500 transition-colors p-1 shrink-0"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-[#D9D9D9] pt-3 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#5B5B5B]">Subtotal</span>
                            <span className="text-sm font-bold text-[#1a1a1a]">
                              ${(total / 100).toFixed(0)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            href="/cart"
                            onClick={() => setCartOpen(false)}
                            className="block w-full text-center py-2.5 rounded-[30px] border border-[#9E50E5] text-[#9E50E5] text-sm font-semibold hover:bg-[#9E50E5] hover:text-white transition-colors"
                          >
                            View Cart
                          </Link>
                          <Link
                            href="/checkout?from=cart"
                            onClick={() => setCartOpen(false)}
                            className="block w-full text-center py-2.5 rounded-[30px] bg-[#9E50E5] text-white text-sm font-semibold hover:bg-[#7B3DB8] transition-colors"
                          >
                            Checkout — ${(total / 100).toFixed(0)}
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/login"
              className="text-[15px] font-semibold px-6 py-2.5 rounded-[30px] border border-[#9E50E5] text-[#9E50E5] hover:bg-[#9E50E5] hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="text-[15px] font-semibold px-6 py-2.5 rounded-[30px] bg-[#9E50E5] text-white hover:bg-[#7B3DB8] transition-colors"
            >
              Enroll Now
            </Link>
          </nav>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/cart" className="relative p-2 text-[#5B5B5B]">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#9E50E5] text-white text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-lg text-[#5B5B5B] hover:bg-[#f5f5f5]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#D9D9D9] bg-white px-4 py-5 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-[15px] text-[#5B5B5B] hover:text-[#9E50E5] py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-[30px] border border-[#9E50E5] text-[#9E50E5]"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-[30px] bg-[#9E50E5] text-white"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
