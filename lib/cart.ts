import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from './products'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  fulfillment: 'pickup' | 'delivery' | 'woodland-cove'
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setFulfillment: (type: 'pickup' | 'delivery' | 'woodland-cove') => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      fulfillment: 'pickup',
      addItem: (product, quantity = 1) => {
        const items = get().items
        const existing = items.find(i => i.product.id === product.id)
        if (existing) {
          set({ items: items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i) })
        } else {
          set({ items: [...items, { product, quantity }] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.product.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity } : i) })
      },
      setFulfillment: (type) => set({ fulfillment: type }),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'gg-farms-cart' }
  )
)

export const MINIMUM_ORDER = 20
export const DELIVERY_FEE = 0
