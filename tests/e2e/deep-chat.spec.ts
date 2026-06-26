import { expect, test } from '@playwright/test'

test('list row opens chat and back link restores list query', async ({
  page,
}) => {
  await page.goto('/deep?gate_id=42&page=1')

  await expect(page.getByTestId('deep-list-page')).toBeVisible()
  const firstRow = page.getByTestId('deep-cases-table-row').first()
  await expect(firstRow).toBeVisible({ timeout: 10_000 })

  await firstRow.click()

  await expect(page).toHaveURL(/\/deep\/[0-9a-f-]+$/)
  await expect(page.getByTestId('deep-chat-page')).toBeVisible()

  await page
    .getByTestId('deep-chat-page')
    .getByRole('link', { name: 'Go back' })
    .click()

  await expect(page).toHaveURL(/\/deep\?/)
  await expect(page).toHaveURL(/gate_id=42/)
  await expect(page).toHaveURL(/page=1/)
  await expect(page.getByTestId('deep-list-page')).toBeVisible()
})

test('open analysis and send message on fixture chat', async ({ page }) => {
  await page.goto('/deep?gate_id=42&page=1')

  const firstRow = page.getByTestId('deep-cases-table-row').first()
  await expect(firstRow).toBeVisible({ timeout: 10_000 })
  await firstRow.click()

  await expect(page.getByTestId('deep-chat-open-cta')).toBeVisible({
    timeout: 10_000,
  })
  await page.getByTestId('deep-chat-open-cta').click()

  await expect(page.getByTestId('chat-message-list')).toBeVisible()
  await page.getByLabel('Сообщение агенту').fill('e2e test message')
  await page.getByRole('button', { name: 'Отправить сообщение' }).click()

  await expect(page.getByText('e2e test message')).toBeVisible()
})
