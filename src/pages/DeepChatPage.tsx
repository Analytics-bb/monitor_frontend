import { useParams } from 'react-router'

export function DeepChatPage() {
  const { auditId } = useParams()

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Deep chat</h1>
      <p className="mt-2 text-sm text-muted-foreground">Audit: {auditId}</p>
    </section>
  )
}
