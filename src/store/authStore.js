import { create } from 'zustand'

const useAuthStore = create((set) => ({
  staff: null,
  isAuthenticated: false,

  login: (staffData) =>
    set({ staff: staffData, isAuthenticated: true }),

  logout: () =>
    set({ staff: null, isAuthenticated: false }),
}))

export default useAuthStore
