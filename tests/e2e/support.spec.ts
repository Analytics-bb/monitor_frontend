import { expect, test } from '@playwright/test'

const MOCK_SESSION_STORAGE_KEY = 'monitor-mock-auth'

async function loginWithMockAuth(page: import('@playwright/test').Page) {
  await page.addInitScript((storageKey) => {
    localStorage.removeItem(storageKey)
  }, MOCK_SESSION_STORAGE_KEY)
  await page.goto('/login')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/monitoring$/)
}

test('support send message on fixture chat', async ({ page }) => {
  await loginWithMockAuth(page)
  await page.goto('/support')

  await expect(page.getByTestId('support-page')).toBeVisible()
  await page.getByLabel('Сообщение в support').fill('e2e support message')
  await page.getByRole('button', { name: 'Отправить сообщение' }).click()

  await expect(page.getByText('e2e support message')).toBeVisible()
})
