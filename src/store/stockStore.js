import { create } from 'zustand'

const useStockStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
}))

export default useStockStore
