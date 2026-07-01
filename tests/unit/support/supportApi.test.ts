import { describe, expect, it, beforeEach } from 'vitest'

import {
  getSupportChat,
  resetSupportChatFixtureStore,
  sendSupportMessage,
} from '@/api/support'
import { supportChatSnapshotFixture } from '@/api/fixtures/supportChatSnapshot'
import { ApiClientError } from '@/api/errors'

describe('support API fixtures', () => {
  beforeEach(() => {
    resetSupportChatFixtureStore()
  })

  it('parses valid snapshot via getSupportChat', async () => {
    const snapshot = await getSupportChat()

    expect(snapshot.chat_id).toBeDefined()
    expect(snapshot.state).toBe('active')
  })

  it('sendSupportMessage returns assistant reply in fixture mode', async () => {
    const snapshot = await sendSupportMessage({
      content: 'Тестовый вопрос',
    })

    expect(snapshot.messages.some((m) => m.role === 'assistant')).toBe(true)
  })

  it('throws 409 chat_processing when already processing', async () => {
    resetSupportChatFixtureStore()
    const { setFixtureSupportChatSnapshot } = await import('@/api/support')
    setFixtureSupportChatSnapshot({
      ...supportChatSnapshotFixture,
      state: 'processing',
    })

    await expect(
      sendSupportMessage({ content: 'ещё одно' }),
    ).rejects.toBeInstanceOf(ApiClientError)
  })
})
