import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Book = {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

export type CartItem = {
  book: Book
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (book: Book) => void
  removeFromCart: (bookId: number) => void
  updateQuantity: (bookId: number, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize from sessionStorage if exists
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = sessionStorage.getItem('bookstore_cart')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })

  // Persist to sessionStorage on every cart change
  useEffect(() => {
    sessionStorage.setItem('bookstore_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (book: Book) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.book.bookId === book.bookId)
      if (existingItem) {
        return prev.map((item) =>
          item.book.bookId === book.bookId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { book, quantity: 1 }]
    })
  }

  const removeFromCart = (bookId: number) => {
    setCart((prev) => prev.filter((item) => item.book.bookId !== bookId))
  }

  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.book.bookId === bookId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((total, item) => total + (item.book.price * item.quantity), 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
