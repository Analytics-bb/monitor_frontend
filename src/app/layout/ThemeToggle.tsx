import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/app/providers/useTheme'
import { Button } from '@/components/ui/button'

/**
 * Переключатель light/dark: Moon в light mode, Sun в dark mode.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={
        theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
      }
    >
      {theme === 'dark' ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </Button>
  )
}
