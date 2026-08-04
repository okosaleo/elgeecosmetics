"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart as addToCartAction,
  updateCartItemQuantity as updateQuantityAction,
  removeCartItem as removeItemAction,
} from "@/app/cart/actions";
import type { CartSummary } from "@/lib/cart";

type CartContextValue = {
  cart: CartSummary;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isBusy: boolean;
  error: string | null;
  addItem: (
    productId: string,
    variantId: string | null,
    quantity?: number
  ) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptyCart: CartSummary = {
  items: [],
  count: 0,
  subtotal: 0,
  subtotalFormatted: "₦0.00",
};

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart?: CartSummary;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartSummary>(initialCart ?? emptyCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback(
    async (productId: string, variantId: string | null, quantity = 1) => {
      setIsBusy(true);
      setError(null);
      const result = await addToCartAction(productId, variantId, quantity);
      setIsBusy(false);
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      setCart(result.summary);
      return true;
    },
    []
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsBusy(true);
    setError(null);
    const result = await updateQuantityAction(itemId, quantity);
    setIsBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCart(result.summary);
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setIsBusy(true);
    const result = await removeItemAction(itemId);
    setIsBusy(false);
    if (result.ok) setCart(result.summary);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        isBusy,
        error,
        addItem,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}