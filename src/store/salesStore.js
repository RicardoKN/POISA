import { create } from 'zustand'

const useSalesStore = create((set) => ({
  cart: [],
  sales: [],
  loading: false,

  setCart: (cart) => set({ cart }),
  setSales: (sales) => set({ sales }),
  setLoading: (loading) => set({ loading }),
  clearCart: () => set({ cart: [] }),
}))

export default useSalesStore
