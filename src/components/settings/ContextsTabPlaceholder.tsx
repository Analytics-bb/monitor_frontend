/**
 * Заглушка вкладки Contexts до задачи m5-contexts-list.
 */
export function ContextsTabPlaceholder() {
  return (
    <p className="text-muted-foreground text-sm" data-testid="contexts-tab-stub">
      Contexts — контент появится после подключения API.
    </p>
  )
}
