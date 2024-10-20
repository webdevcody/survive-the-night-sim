"use client";

import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const darkMode = useTheme().systemTheme;

  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={theme}
      onValueChange={(newTheme) => {
        // This check is needed because if the user clicks on a button twice the button gets unselected and the newTheme is undefined
        if (newTheme) {
          setTheme(newTheme);
        }
      }}
      className="flex rounded-md bg-blue-200 px-1 py-1 dark:bg-slate-700"
    >
      {theme === "light" || (theme === "system" && darkMode === "light") ? (
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
