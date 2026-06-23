import {
  ContextsTabPlaceholder,
  InstructionsTab,
} from '@/components/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Страница настроек агента: instructions (M6) и contexts (M15).
 */
export function AgentSettingsPage() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-6"
      data-testid="agent-settings-page"
    >
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Agent Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Управление instructions и contexts агентов.
        </p>
      </header>

      <Tabs defaultValue="instructions" className="w-full">
        <TabsList variant="line" aria-label="Секции настроек агента">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="contexts">Contexts</TabsTrigger>
        </TabsList>
        <TabsContent value="instructions" className="pt-4">
          <InstructionsTab />
        </TabsContent>
        <TabsContent value="contexts" className="pt-4">
          <ContextsTabPlaceholder />
        </TabsContent>
      </Tabs>
    </div>
  )
}
