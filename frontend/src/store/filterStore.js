import { create } from "zustand";
import { persist } from "zustand/middleware";

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyTheme = (dark) => {
  if (typeof document === "undefined") return;
  if (dark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
};

const useFilterStore = create(
  persist(
    (set) => ({
      startDate: null,
      endDate: null,
      darkMode: prefersDark(),
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),
      clearDateRange: () => set({ startDate: null, endDate: null }),
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          applyTheme(next);
          return { darkMode: next };
        }),
      setDarkMode: (value) =>
        set(() => {
          applyTheme(value);
          return { darkMode: value };
        }),
    }),
    {
      name: "ecommerce-filters",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.darkMode);
      },
    }
  )
);

if (typeof window !== "undefined") {
  applyTheme(useFilterStore.getState().darkMode);
}

export default useFilterStore;
