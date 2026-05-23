import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "sai_theme";

export function applyThemeToDOM(theme: Theme) {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

const initialTheme = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system";
applyThemeToDOM(initialTheme);

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme(t) {
    localStorage.setItem(THEME_KEY, t);
    applyThemeToDOM(t);
    set({ theme: t });
  },
}));
