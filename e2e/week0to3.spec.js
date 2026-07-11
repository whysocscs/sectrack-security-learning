import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function open(page, hash) {
  await page.goto(`/${hash}`)
  await expect(page.locator('#main-content')).toBeVisible()
}

test('Week 0 to 3 learning routes load their intended reader or workspace', async ({ page }) => {
  await open(page, '#/learn/week/0/glossary')
  await expect(page.getByRole('heading', { name: '보안 용어는 정의와 함께, 헷갈리는 경계까지 읽습니다.' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: '보안 용어 검색' })).toBeVisible()

  for (const [week, moduleId, heading] of [
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

test('Career Explorer defaults to evidence and keeps graph as a secondary view', async ({ page }) => {
  await open(page, '#/mindmap')
  await expect(page.getByRole('heading', { name: '분야에서 직무군으로, 직무군에서 실제 역할로 내려가는 직무 지도' })).toBeVisible()
  await expect(page.getByText('전문 분야 16개 · 대표 역할 113개 · 상세 근거 카드 33개')).toBeVisible()
  await expect(page.locator('.react-flow__node')).toHaveCount(0)
  await page.getByRole('tab', { name: '관계도' }).click()
  await expect(page.locator('.react-flow__node')).toHaveCount(16)
  const viewportTransform = await page.locator('.react-flow__viewport').getAttribute('style')
  await page.getByTestId('rf__node-domain-ot').click()
  await expect(page.locator('.react-flow__node')).toHaveCount(26)
  await expect(page.locator('.react-flow__viewport')).toHaveAttribute('style', viewportTransform || '')
  await expect(page.getByRole('heading', { name: 'OT·ICS 보안 마인드맵' })).toBeVisible()
  await page.getByTestId('rf__node-role-catalog-ot-security-engineer').click()
  await expect(page.getByRole('heading', { name: 'OT 보안 엔지니어' })).toBeVisible()
  await page.getByTestId('rf__node-domain-detection').click()
  await expect(page.locator('.react-flow__node')).toHaveCount(26)
  await page.getByTestId('rf__node-role-catalog-siem-engineer').click()
  await expect(page.getByText('보안 제품·플랫폼 개발 조직에서는 수집기, 파서, 검색·분석 기능을 구현하는 역할로도 채용될 수 있습니다.')).toBeVisible()
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
