import { expect, test } from '@playwright/test'

const MOCK_SESSION_STORAGE_KEY = 'monitor-mock-auth'

async function clearMockSession(page: import('@playwright/test').Page) {
  await page.addInitScript((storageKey) => {
    localStorage.removeItem(storageKey)
  }, MOCK_SESSION_STORAGE_KEY)
}

async function loginWithMockAuth(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/monitoring$/)
}

test.describe('mock auth', () => {
  test('login redirect to monitoring', async ({ page }) => {
    await clearMockSession(page)
    await loginWithMockAuth(page)
    await expect(page.getByTestId('monitoring-page')).toBeVisible()
  })

  test('guarded route redirects to login without session', async ({ page }) => {
    await clearMockSession(page)
    await page.goto('/deep')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible()
  })

  test('logout returns to login and blocks monitoring', async ({ page }) => {
    await clearMockSession(page)
    await loginWithMockAuth(page)

    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/monitoring')
    await expect(page).toHaveURL(/\/login$/)
  })
})
