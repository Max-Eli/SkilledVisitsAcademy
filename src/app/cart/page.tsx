'use client'

import Link from 'next/link'
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'

const SUGGESTED_COURSES = [
  { key: 'iv-therapy-foundation', title: 'IV Therapy Foundation', price: '$199', subtitle: 'Core Certification' },
  { key: 'complete-bundle', title: 'Complete IV Bundle', price: '$349', subtitle: 'Best Value' },
  { key: 'filler-fundamentals', title: 'Filler Fundamentals', price: '$249', subtitle: 'Aesthetics' },
]

export default function CartPage() {
  const { items, removeItem, clearCart, total, count } = useCart()

  const suggested = SUGGESTED_COURSES.filter((c) => !items.some((i) => i.key === c.key)).slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 py-10">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/pricing" className="flex items-center gap-1.5 text-sm text-[#5B5B5B] hover:text-[#9E50E5] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <div className="h-4 w-px bg-[#D9D9D9]" />
          <h1 className="text-xl font-bold text-[#1a1a1a]">
            Shopping Cart{count > 0 && <span className="text-[#5B5B5B] font-normal ml-2 text-base">({count} {count === 1 ? 'item' : 'items'})</span>}
          </h1>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <AnimateOnScroll className="py-24 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-[#FBF6FF] flex items-center justify-center mb-5">
              <ShoppingCart className="h-9 w-9 text-[#9E50E5]" />
            </div>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Your cart is empty</h2>
            <p className="text-[#5B5B5B] mb-7 max-w-sm">
              Browse our course catalog and add courses to get started.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-[30px] bg-[#9E50E5] text-white font-semibold hover:bg-[#7B3DB8] transition-colors"
            >
              Browse Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimateOnScroll>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: Cart items */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-[#D9D9D9] rounded-2xl overflow-hidden">
                {items.map((item, i) => (
                  <div
                    key={item.key}
                    className={`flex items-start gap-5 p-6 ${i < items.length - 1 ? 'border-b border-[#EEEEEE]' : ''}`}
                  >
                    {/* Course icon */}
                    <div className="h-12 w-12 rounded-xl bg-[#FBF6FF] border border-[#9E50E5]/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 text-[#9E50E5]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a1a1a] text-base leading-tight">{item.title}</p>
                      <p className="text-xs text-[#9E50E5] font-semibold mt-0.5 uppercase tracking-wide">{item.subtitle}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Lifetime access
                        </span>
                        <span className="text-[#D9D9D9]">·</span>
                        <span className="text-xs text-[#5B5B5B]">Instant access after payment</span>
                      </div>
                    </div>

                    {/* Price + remove */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-[#1a1a1a]">{item.price}</p>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="flex items-center gap-1 text-xs text-[#5B5B5B] hover:text-red-500 transition-colors mt-2 ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={clearCart}
                  className="text-xs text-[#5B5B5B] hover:text-red-500 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear cart
                </button>
              </div>

              {/* Suggested */}
              {suggested.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm font-semibold text-[#1a1a1a] mb-4">You might also like</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {suggested.map((c) => (
                      <Link
                        key={c.key}
                        href={`/course/${c.key}`}
                        className="flex flex-col p-4 bg-[#FBF6FF] rounded-xl border border-[#D9D9D9] hover:border-[#9E50E5] transition-colors group"
                      >
                        <p className="text-[11px] font-semibold text-[#9E50E5] uppercase tracking-wide mb-1">{c.subtitle}</p>
                        <p className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#9E50E5] transition-colors leading-snug">{c.title}</p>
                        <p className="text-sm font-extrabold text-[#1a1a1a] mt-2">{c.price}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="w-full lg:w-[360px] shrink-0 sticky top-24">
              <div className="bg-white border border-[#D9D9D9] rounded-2xl p-7">
                <h2 className="text-sm font-semibold text-[#5B5B5B] uppercase tracking-wider mb-5">Order Summary</h2>

                <div className="space-y-2.5 mb-5">
                  {items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-sm text-[#5B5B5B] truncate mr-3 flex-1">{item.title}</span>
                      <span className="text-sm font-semibold text-[#1a1a1a] shrink-0">{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#D9D9D9] pt-4 mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#5B5B5B]">Access</span>
                    <span className="text-sm font-semibold text-emerald-600">Lifetime</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-bold text-[#1a1a1a]">Total today</span>
                    <span className="text-xl font-extrabold text-[#9E50E5]">${(total / 100).toFixed(0)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout?from=cart"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white font-bold text-base transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#5B5B5B]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Secure payment via Square
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#5B5B5B]">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    Instant access after payment
                  </div>
                </div>

                <p className="text-xs text-[#5B5B5B] text-center mt-4 leading-relaxed">
                  One-time purchase · No subscriptions · Lifetime access to all purchased courses
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  )
}
