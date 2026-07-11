import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function open(page, hash) {
  await page.goto(`/${hash}`)
  await expect(page.locator('#main-content')).toBeVisible()
}

test('Week 0 to 3 concept deep links load their Technical Reader', async ({ page }) => {
  for (const [week, moduleId, heading] of [
    [0, 'w0-platform', '플랫폼 사용법'],
    [1, 'w1-navigation', '탐색·검색·읽기·도움말 명령'],
    [2, 'w2-permissions', '소유권과 권한'],
    [3, 'w3-http', 'HTTP 요청·응답'],
  ]) {
    await open(page, `#/learn/week/${week}/concepts/${moduleId}`)
    await expect(page.locator('.reader-document > header h2')).toHaveText(heading)
    await expect(page.locator('nav[aria-label$="절 목차"]')).toBeVisible()
  }
})

test('Week 3 tool triangle remains a required, local-only activity', async ({ page }) => {
  await open(page, '#/labs/w3-tool-triangle')
  await expect(page.getByRole('heading', { name: 'HTTP Tool Triangle' })).toBeVisible()
  await expect(page.locator('.lab-scope')).toContainText('외부 요청·실제 Cookie·값 변조는 수행하지 않습니다.')
  await expect(page.getByRole('radio', { name: '청색 색상 선택' })).toBeVisible()
  await page.getByRole('radio', { name: '청색 색상 선택' }).click()
  await expect(page.getByRole('radio', { name: '청색 색상 선택' })).toHaveAttribute('aria-checked', 'true')
})

test('Career Explorer exposes all job families before role expansion', async ({ page }) => {
  await open(page, '#/mindmap')
  await expect(page.getByRole('heading', { name: '직무를 연결하고, 근거의 한계를 함께 읽기' })).toBeVisible()
  await expect(page.locator('.react-flow__node')).toHaveCount(12)
  await page.getByText('GRC·개인정보').click()
  await expect(page.locator('.react-flow__node')).toHaveCount(20)
})

test('core reader screen has no serious or critical axe violations', async ({ page }) => {
  await open(page, '#/learn/week/3/concepts/w3-http')
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact))
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
})

test('reader keeps keyboard access at maximum app font scale and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, '#/learn/week/3/concepts/w3-http')
  const comparison = page.locator('.lesson-comparison > div').first()
  await comparison.focus()
  await expect(comparison).toBeFocused()
  await page.getByRole('button', { name: '글자 크기와 데이터 설정' }).click()
  await page.locator('.font-scale-options button').filter({ hasText: '150%' }).click()
  await expect(page.locator('html')).toHaveCSS('font-size', '24px')
  await expect(page.locator('.sidebar')).toHaveCSS('transition-duration', '0s')
})

test('reader content remains reachable at 200% visual page scale', async ({ page }) => {
  await open(page, '#/learn/week/3/concepts/w3-http')
  const client = await page.context().newCDPSession(page)
  await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect(page.locator('.reader-document > header h2')).toBeVisible()
  await page.locator('.lesson-summary').scrollIntoViewIfNeeded()
  await expect(page.locator('.lesson-summary')).toBeVisible()
  await expect.poll(() => page.evaluate(() => visualViewport.scale)).toBe(2)
})
