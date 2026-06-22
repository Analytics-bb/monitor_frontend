import { expect, test } from '@playwright/test'

test('redirects root to monitoring', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/monitoring$/)
  await expect(page.getByRole('heading', { name: 'Мониторинг' })).toBeVisible()
})
