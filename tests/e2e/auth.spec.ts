import { expect, test } from '@playwright/test'

const SESSION_STORAGE_KEY = 'monitor-auth-session'

async function clearSession(page: import('@playwright/test').Page) {
  await page.addInitScript((storageKey) => {
    localStorage.removeItem(storageKey)
  }, SESSION_STORAGE_KEY)
}

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Логин').fill('admin')
  await page.getByLabel('Пароль').fill('admin')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/monitoring$/)
}

test.describe('session auth', () => {
  test('login redirect to monitoring', async ({ page }) => {
    await clearSession(page)
    await login(page)
    await expect(page.getByTestId('monitoring-page')).toBeVisible()
  })

  test('guarded route redirects to login without session', async ({ page }) => {
    await clearSession(page)
    await page.goto('/deep')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible()
  })

  test('logout returns to login and blocks monitoring', async ({ page }) => {
    await clearSession(page)
    await login(page)

    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/monitoring')
    await expect(page).toHaveURL(/\/login$/)
  })
})
