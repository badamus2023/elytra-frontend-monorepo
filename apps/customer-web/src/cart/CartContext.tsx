import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type CartLine = {
  productId: string
  name: string
  price: number
  quantity: number
}

type CartContextValue = {
  restaurantId: string | null
  restaurantName: string | null
  lines: CartLine[]
  itemCount: number
  subtotal: number
  setRestaurant: (restaurantId: string, restaurantName: string) => void
  addItem: (item: Omit<CartLine, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  loadCart: (
    restaurantId: string,
    restaurantName: string,
    lines: CartLine[],
  ) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurantName, setRestaurantName] = useState<string | null>(null)
  const [lines, setLines] = useState<CartLine[]>([])

  const setRestaurant = useCallback((nextRestaurantId: string, nextRestaurantName: string) => {
    setRestaurantId((current) => {
      if (current && current !== nextRestaurantId) {
        setLines([])
      }
      return nextRestaurantId
    })
    setRestaurantName(nextRestaurantName)
  }, [])

  const addItem = useCallback((item: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === item.productId)
      if (existing) {
        return current.map((line) =>
          line.productId === item.productId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        )
      }
      return [...current, { ...item, quantity }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((current) => current.filter((line) => line.productId !== productId))
      return
    }
    setLines((current) =>
      current.map((line) =>
        line.productId === productId ? { ...line, quantity } : line,
      ),
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId))
  }, [])

  const loadCart = useCallback(
    (nextRestaurantId: string, nextRestaurantName: string, nextLines: CartLine[]) => {
      setRestaurantId(nextRestaurantId)
      setRestaurantName(nextRestaurantName)
      setLines(nextLines)
    },
    [],
  )

  const clearCart = useCallback(() => {
    setRestaurantId(null)
    setRestaurantName(null)
    setLines([])
  }, [])

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  )

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [lines],
  )

  const value = useMemo(
    () => ({
      restaurantId,
      restaurantName,
      lines,
      itemCount,
      subtotal,
      setRestaurant,
      addItem,
      updateQuantity,
      removeItem,
      loadCart,
      clearCart,
    }),
    [
      restaurantId,
      restaurantName,
      lines,
      itemCount,
      subtotal,
      setRestaurant,
      addItem,
      updateQuantity,
      removeItem,
      loadCart,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
