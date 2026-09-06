import { Product } from "./sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderPlacementStep =
  | "validating"
  | "creating"
  | "emailing"
  | "redirecting";

interface StoreState {
  items: CartItem[];
  addItem: (product: Product) => void;
  addMultipleItems: (
    products: Array<{ product: Product; quantity: number }>
  ) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getTotalDiscount: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];
  // favorite
  favoriteProduct: Product[];
  addToFavorite: (product: Product) => Promise<void>;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;
  // order placement state
  isPlacingOrder: boolean;
  orderStep: OrderPlacementStep;
  setOrderPlacementState: (
    isPlacing: boolean,
    step?: OrderPlacementStep
  ) => void;
}

const useCartStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteProduct: [],
      addItem: (product) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product._id === product._id
          );
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            };
            return { items: updatedItems };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),
      addMultipleItems: (products) =>
        set((state) => {
          const itemMap = new Map<string, CartItem>(
            state.items.map((item) => [item.product._id, { ...item }])
          );

          for (const { product, quantity } of products) {
            const existing = itemMap.get(product._id);
            if (existing) {
              existing.quantity += quantity;
            } else {
              itemMap.set(product._id, { product, quantity });
            }
          }

          return { items: Array.from(itemMap.values()) };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product._id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),
      deleteCartProduct: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product?._id !== productId),
        })),
      resetCart: () => set({ items: [] }),
      getTotalPrice: () => {
        // Final payable amount (current/discounted prices)
        return get().items.reduce(
          (total, item) => total + (item.product.price ?? 0) * item.quantity,
          0
        );
      },
      getSubTotalPrice: () => {
        // Gross amount (before discount)
        return get().items.reduce((total, item) => {
          const currentPrice = item.product.price ?? 0;
          const discount = item.product.discount ?? 0;
          const discountAmount = (discount * currentPrice) / 100;
          const grossPrice = currentPrice + discountAmount;
          return total + grossPrice * item.quantity;
        }, 0);
      },
      getTotalDiscount: () => {
        // Total discount amount
        return get().items.reduce((total, item) => {
          const currentPrice = item.product.price ?? 0;
          const discount = item.product.discount ?? 0;
          const discountAmount = (discount * currentPrice) / 100;
          return total + discountAmount * item.quantity;
        }, 0);
      },
      getItemCount: (productId) => {
        const item = get().items.find(
          (item) => item.product._id === productId
        );
        return item ? item.quantity : 0;
      },
      getGroupedItems: () => get().items,
      addToFavorite: async (product: Product) => {
        set((state: StoreState) => {
          const isFavorite = state.favoriteProduct.some(
            (item) => item._id === product._id
          );
          return {
            favoriteProduct: isFavorite
              ? state.favoriteProduct.filter(
                  (item) => item._id !== product._id
                )
              : [...state.favoriteProduct, { ...product }],
          };
        });
      },
      removeFromFavorite: (productId: string) => {
        set((state: StoreState) => ({
          favoriteProduct: state.favoriteProduct.filter(
            (item) => item?._id !== productId
          ),
        }));
      },
      resetFavorite: () => {
        set({ favoriteProduct: [] });
      },
      // order placement state
      isPlacingOrder: false,
      orderStep: "validating",
      setOrderPlacementState: (isPlacing, step = "validating") => {
        set({
          isPlacingOrder: isPlacing,
          orderStep: step,
        });
      },
    }),
    { name: "cart-store" }
  )
);

export default useCartStore;

