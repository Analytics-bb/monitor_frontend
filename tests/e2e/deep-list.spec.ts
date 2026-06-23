import { expect, test } from '@playwright/test'

test('deep list loads and gate filter narrows fixture rows', async ({ page }) => {
  await page.goto('/deep')

  await expect(page.getByTestId('deep-list-page')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Deep Analytics/ })).toBeVisible()

  await expect(page.getByTestId('deep-cases-table-row')).toHaveCount(3, {
    timeout: 10_000,
  })

  await page.getByLabel('Gate ID').fill('42')
  await page.getByRole('button', { name: 'Применить' }).click()

  await expect(page).toHaveURL(/gate_id=42/)
  await expect(page.getByTestId('deep-cases-table-row')).toHaveCount(2)
})
