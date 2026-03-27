import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Represents the structure of a Book object returned from the API.
 */

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

/**
 * Defines the shape of the Cart Context, providing cart state and modifier functions.
 */
type CartContextType = {
  cart: CartItem[]
  addToCart: (book: Book) => void
  removeFromCart: (bookId: number) => void
  updateQuantity: (bookId: number, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

// Instantiate the globally accessible context
const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * CartProvider wraps the application and manages the global state of the shopping cart.
 * It utilizes HTML5 sessionStorage to ensure that cart data survives browser refreshes
 * but clears out when the browsing session ends.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state directly from sessionStorage if data exists to prevent hydration mismatches
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

  // Effect hook: Synchronize local state with sessionStorage whenever the cart mutates
  useEffect(() => {
    sessionStorage.setItem('bookstore_cart', JSON.stringify(cart))
  }, [cart])

  /**
   * Adds a book to the cart. If the book already exists in the cart, it increments
   * the existing quantity by 1 instead of duplicating the item.
   * @param book The complete book object to add
   */
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

  /**
   * Removes a specific item completely from the cart array based on its ID.
   */
  const removeFromCart = (bookId: number) => {
    setCart((prev) => prev.filter((item) => item.book.bookId !== bookId))
  }

  /**
   * Hard-updates the quantity of an existing cart item. 
   * Defensively removes the item if the requested quantity drops to 0 or below.
   */
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

  /** Wipes the cart entirely by resetting tracking state to an empty array */
  const clearCart = () => setCart([])

  // Derived state calculations (recalculated efficiently on render)
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

/**
 * Custom hook to consume the Cart Context. 
 * Defensively throws an error if a developer attempts to use it outside of a CartProvider tree.
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
