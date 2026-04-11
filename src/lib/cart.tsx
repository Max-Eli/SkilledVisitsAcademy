'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  key: string
  title: string
  price: string
  priceInt: number
  subtitle: string
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (key: string) => void
  clearCart: () => void
  isInCart: (key: string) => boolean
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sva-cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem('sva-cart', JSON.stringify(items))
  }, [items, hydrated])

  function addItem(item: CartItem) {
    setItems((prev) => prev.some((i) => i.key === item.key) ? prev : [...prev, item])
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  function clearCart() {
    setItems([])
    localStorage.removeItem('sva-cart')
  }

  function isInCart(key: string) {
    return items.some((i) => i.key === key)
  }

  const total = items.reduce((sum, i) => sum + i.priceInt, 0)
  const count = items.length

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
