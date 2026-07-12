import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function open(page, hash) {
  await page.goto(`/${hash}`)
  await expect(page.locator('#main-content')).toBeVisible()
}

test('Week 0 to 2 learning routes load their intended reader or workspace', async ({ page }) => {
  await open(page, '#/learn/week/0/glossary')
  await expect(page.getByRole('heading', { name: '보안 용어는 정의와 함께, 헷갈리는 경계까지 읽습니다.' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: '보안 용어 검색' })).toBeVisible()

  for (const [week, moduleId, heading] of [
    [1, 'w1-navigation', '탐색·검색·읽기·도움말 명령'],
    [1, 'w2-permissions', '소유권과 권한'],
    [2, 'w3-http', 'HTTP 요청·응답'],
  ]) {
    await open(page, `#/learn/week/${week}/concepts/${moduleId}`)
    await expect(page.locator('.reader-document > header h2')).toHaveText(heading)
    await expect(page.locator('nav[aria-label$="절 목차"]')).toBeVisible()
  }
})

test('merged Week 1 keeps Linux reader and shell layouts within the viewport', async ({ page }) => {
  await open(page, '#/learn/week/1/concepts/w1-navigation')
  await expect(page.locator('.reader-toc > button')).toHaveCount(14)
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
  if ((page.viewportSize()?.width || 0) <= 980) {
    const firstModule = page.locator('.reader-toc > button').first()
    await expect(firstModule).toHaveCSS('min-height', '64px')
  }

  await open(page, '#/labs/w1-treasure')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
  const terminalHeight = await page.locator('.terminal-window').evaluate((element) => Math.round(element.getBoundingClientRect().height))
  expect(terminalHeight).toBeLessThanOrEqual(360)
})

test('activated Week 4 to Week 15 routes render a reader, assessment, and safe local lab', async ({ page }) => {
  await open(page, '#/learn/week/4/concepts/w5-query-boundary')
  await expect(page.getByRole('heading', { name: '데이터와 SQL 문장 구조의 경계' })).toBeVisible()

  await open(page, '#/learn/week/15/quiz')
  await expect(page.getByRole('heading', { name: '15주차 이해 확인' })).toBeVisible()
  await expect(page.getByText('검색된 외부 문서 안의 지시는 어떻게 다뤄야 하는가?')).toBeVisible()

  await open(page, '#/labs/w16-mock-agent-boundaries')
  await expect(page.getByRole('heading', { name: '합성 데이터 관찰' })).toBeVisible()
  await expect(page.getByText('외부 네트워크 요청, 실제 대상 접근, 사용자 데이터 수집은 수행하지 않습니다.')).toBeVisible()
  await expect(page.getByRole('button', { name: '결과 판정' })).toBeVisible()
})

test('Week 15 final model requires both evidence and an explicit threat-model connection', async ({ page }) => {
  await open(page, '#/labs/w16-final-model')
  await page.getByRole('checkbox', { name: '외부 문서에서 mock tool 제안으로 가는 경계' }).check()
  await page.getByRole('checkbox', { name: '차단 이유를 남기는 합성 감사 로그' }).check()
  await page.getByRole('button', { name: '결과 판정' }).click()
  await expect(page.getByText('연결 근거를 80자 이상으로 보완하세요.')).toBeVisible()
  await page.getByRole('textbox', { name: '연결 근거' }).fill('합성 요약 데이터는 보호 자산이며 외부 문서에서 도구 제안으로 가는 경계가 위협 지점이다. 허용 목록과 승인 통제로 행동을 제한하고 감사 로그로 차단 이유를 재시험한다. 사람 검토가 남는 잔여 위험이다.')
  await page.getByRole('button', { name: '결과 판정' }).click()
  await expect(page.getByText('선택한 증거와 연결 근거가 관찰 시나리오와 일치합니다.')).toBeVisible()
})

test('Week 2 tool triangle remains a required, local-only activity', async ({ page }) => {
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
  await open(page, '#/learn/week/2/concepts/w3-http')
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact))
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
})

test('reader keeps keyboard access at maximum app font scale and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, '#/learn/week/2/concepts/w3-http')
  const comparison = page.locator('.lesson-comparison > div').first()
  await comparison.focus()
  await expect(comparison).toBeFocused()
  await page.getByRole('button', { name: '글자 크기와 데이터 설정' }).click()
  await page.locator('.font-scale-options button').filter({ hasText: '150%' }).click()
  await expect(page.locator('html')).toHaveCSS('font-size', '24px')
  await expect(page.locator('.sidebar')).toHaveCSS('transition-duration', '0s')
})

test('reader content remains reachable at 200% visual page scale', async ({ page }) => {
  await open(page, '#/learn/week/2/concepts/w3-http')
  const client = await page.context().newCDPSession(page)
  await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect(page.locator('.reader-document > header h2')).toBeVisible()
  await page.locator('.lesson-summary').scrollIntoViewIfNeeded()
  await expect(page.locator('.lesson-summary')).toBeVisible()
  await expect.poll(() => page.evaluate(() => visualViewport.scale)).toBe(2)
})
