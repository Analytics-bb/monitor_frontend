import { expect, test } from '@playwright/test'

test('monitoring page loads status panel and updates after poll', async ({
  page,
}) => {
  await page.goto('/monitoring')

  await expect(page.getByTestId('monitoring-page')).toBeVisible()
  await expect(page.getByTestId('status-panel')).toBeVisible()
  await expect(page.getByText('Live')).toBeVisible()
  await expect(page.getByTestId('conclusion-panel')).toContainText(
    /Трафик ниже нормы|Ожидание первого тика/,
  )
})
