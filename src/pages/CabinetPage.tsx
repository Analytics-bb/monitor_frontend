import { UserCircle } from 'lucide-react'

/**
 * Placeholder личного кабинета без API; контент внутри AppLayout.
 */
export function CabinetPage() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <UserCircle
        className="text-muted-foreground mb-4 size-12"
        aria-hidden
      />
      <p className="text-muted-foreground text-sm">Личный кабинет — скоро</p>
    </section>
  )
}
