import { expect, test } from '@playwright/test'

async function loginWithMockAuth(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/monitoring$/)
}

test('usage list drill-down opens run detail page', async ({ page }) => {
  await loginWithMockAuth(page)
  await page.goto('/usage')

  await expect(page.getByTestId('usage-page')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Использование' })).toBeVisible()
  await expect(page.getByTestId('usage-runs-table-row').first()).toBeVisible({
    timeout: 10_000,
  })

  await page.getByTestId('usage-runs-table-row').first().click()

  await expect(page).toHaveURL(/\/usage\/[0-9a-f-]+$/)
  await expect(page.getByTestId('usage-run-detail-page')).toBeVisible()
  await expect(page.getByTestId('usage-step-breakdown-table')).toBeVisible()
})
