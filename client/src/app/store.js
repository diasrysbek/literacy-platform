import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedChild: null,

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, selectedChild: null })
      },
      setSelectedChild: (child) => set({ selectedChild: child }),
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'literacy-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
