import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFilterStore = create(
  persist(
    (set) => ({
      startDate: null,
      endDate: null,
      darkMode: false,
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),
      clearDateRange: () => set({ startDate: null, endDate: null }),
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (next) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { darkMode: next };
        }),
    }),
    {
      name: "ecommerce-filters",
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);

export default useFilterStore;
