import { Bot } from 'lucide-react'

/**
 * Placeholder страницы саппорта без API; контент внутри AppLayout.
 */
export function SupportPage() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <Bot className="text-muted-foreground mb-4 size-12" aria-hidden />
      <p className="text-muted-foreground text-sm">Саппорт — скоро</p>
    </section>
  )
}
