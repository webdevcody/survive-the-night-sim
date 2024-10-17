"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const darkMode = useTheme().systemTheme;

  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={theme}
      onValueChange={(e) => setTheme(e)}
      className={`${"flex px-1 py-1 rounded-md"} ${theme == "light" || (theme == "system" && darkMode == "light") ? "bg-blue-200" : "bg-slate-700"}`}
    >
      {theme == "light" || (theme == "system" && darkMode == "light") ? (
        <ToggleGroupItem value="dark" aria-label="Dark">
          <MoonIcon />
        </ToggleGroupItem>
      ) : (
        <ToggleGroupItem value="light" aria-label="Light">
          <SunIcon />
        </ToggleGroupItem>
      )}
      <ToggleGroupItem value="system" aria-label="System">
        <DesktopIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
