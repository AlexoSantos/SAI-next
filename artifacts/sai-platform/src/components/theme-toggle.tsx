import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore, type Theme } from "../store/theme";
import { Button } from "./ui/button";

const THEMES: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Claro" },
  { value: "dark", icon: Moon, label: "Escuro" },
  { value: "system", icon: Monitor, label: "Sistema" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const current = THEMES.find((t) => t.value === theme) ?? THEMES[2]!;
  const Icon = current.icon;

  function cycle() {
    const idx = THEMES.findIndex((t) => t.value === theme);
    const next = THEMES[(idx + 1) % THEMES.length]!;
    setTheme(next.value);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      title={`Tema: ${current.label} — clique para trocar`}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon className="w-4 h-4" />
    </Button>
  );
}
