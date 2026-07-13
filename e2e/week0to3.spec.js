import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function open(page, hash) {
  await page.goto(`/${hash}`)
  await expect(page.locator('#main-content')).toBeVisible()
}

test('learning roadmap renders from its direct hash route', async ({ page }) => {
  await open(page, '#/learn')
  await expect(page.getByRole('heading', { name: '학습 로드맵' })).toBeVisible()
  await expect(page.locator('.roadmap-item').filter({ hasText: '보안 기초·Linux·도구' })).toBeVisible()
})

test('Week 0 to 2 learning routes load their intended reader or workspace', async ({ page }) => {
  await open(page, '#/learn/week/0/glossary')
  await expect(page.getByRole('heading', { name: '보안 용어는 정의와 함께, 헷갈리는 경계까지 읽습니다.' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: '보안 용어 검색' })).toBeVisible()

  for (const [week, moduleId, heading] of [
    [1, 'w1-navigation', '파일·탐색·텍스트·형식 관찰 명령'],
    [1, 'w1-permission', '사용자·그룹·소유권과 권한'],
    [2, 'w3-http', 'HTTP 요청·응답'],
  ]) {
    await open(page, `#/learn/week/${week}/concepts/${moduleId}`)
    await expect(page.locator('.reader-document > header h2')).toHaveText(heading)
    if ((page.viewportSize()?.width || 0) > 980) await expect(page.locator('nav[aria-label$="절 목차"]')).toBeVisible()
    else await expect(page.locator('nav[aria-label$="절 목차"]')).toBeHidden()
  }
})

test('merged Week 1 keeps Linux reader and shell layouts within the viewport', async ({ page }) => {
  await open(page, '#/learn/week/1/concepts/w1-navigation')
  await expect(page.locator('.reader-toc > button')).toHaveCount(10)
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
  const misconceptions = page.locator('.lesson-misconception li')
  await expect(misconceptions).toHaveCount(2)
  await expect(misconceptions.locator('> div')).toHaveCount(2)
  await expect(misconceptions.locator('> code')).toHaveCount(0)
  await expect(page.locator('.lesson-question')).toHaveCount(0)
  await expect(page.getByText('CODECURELAB CASE')).toHaveCount(0)
  await expect(page.getByText('QUESTION 1.', { exact: true })).toBeVisible()
  await page.getByText('정답 보기').first().click()
  await expect(page.locator('.question-review details strong')).toHaveText('정답:')
  if ((page.viewportSize()?.width || 0) <= 980) {
    const firstModule = page.locator('.reader-toc > button').first()
    await expect(firstModule).toHaveCSS('min-height', '64px')
  }

  await open(page, '#/labs/w1-treasure')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
  const terminalHeight = await page.locator('.terminal-window').evaluate((element) => Math.round(element.getBoundingClientRect().height))
  expect(terminalHeight).toBeLessThanOrEqual(360)

  await open(page, '#/labs/w1-command-ctf')
  await expect(page.getByRole('heading', { name: '사건 기록 CTF' })).toBeVisible()
  await expect(page.getByText('형식 확인')).toBeVisible()
  const command = page.locator('#linux-command')
  for (const value of ['ls -al', 'cat .briefing', 'file evidence/archive/packet.bin', 'cat evidence/archive/packet.bin', 'find . -type f', 'grep -n ACCESS_CODE evidence/archive/dispatch.log']) {
    await command.fill(value)
    await command.press('Enter')
  }
  await expect(page.locator('.linux-task-strip article.solved')).toHaveCount(3)
})

test('display Week 03 XSS guide shows deep concepts, evidence, retests, and a local report exercise', async ({ page }) => {
  await open(page, '#/learn/week/3/concepts/w4-nature')
  await expect(page.locator('.reader-document > header h2')).toHaveText('검색어는 언제 HTML이 되는가')
  await expect(page.getByText('이 모듈의 질문')).toBeVisible()
  await expect(page.locator('.lesson-concept-ref details')).toHaveCount(5)

  await open(page, '#/learn/week/3/concepts/w4-validation')
  await expect(page.getByRole('heading', { name: '합성 XSS Finding의 증거 지도' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Finding에 붙일 재시험 표' })).toBeVisible()

  await open(page, '#/labs/w4-report-evidence')
  await expect(page.getByRole('heading', { name: 'Finding 문장을 근거에 맞게 분리하기' })).toBeVisible()
  for (const [index, value] of ['fact', 'impact', 'condition', 'root-cause', 'control', 'retest'].entries()) {
    await page.getByRole('combobox', { name: `${index + 1}번 문장 분류` }).selectOption(value)
  }
  await page.getByRole('textbox', { name: '분류 근거' }).fill('고정 마커가 live DOM 구조로 나타났다는 문장은 실제로 관찰한 화면 변화다. 반면 사용자 기능과 데이터에 미칠 수 있는 결과는 역할, 화면의 기능, HttpOnly와 CSP 같은 조건을 추가로 확인해야 하는 영향 판단이다.')
  await page.getByRole('button', { name: '결과 판정' }).click()
  await expect(page.getByText('문장 구분과 근거 설명이 모두 맞습니다. 이 구조를 Finding 초안에도 유지하세요.')).toBeVisible()
})

test('display Week 03 reader keeps its evidence and retest blocks within a 360px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/3/concepts/w4-validation')
  await expect(page.locator('.lesson-evidence-board')).toBeVisible()
  await expect(page.locator('.lesson-retest')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
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

test('Week 5 SQLi reader connects database foundations, controls, and a safe design review', async ({ page }) => {
  await open(page, '#/learn/week/4/concepts/w5-db-basics')
  await expect(page.locator('.reader-document > header h2')).toHaveText('웹 서비스와 관계형 데이터베이스')
  await expect(page.locator('.reader-toc > button')).toHaveCount(5)
  await expect(page.getByRole('heading', { name: '처음 알아둘 데이터베이스 언어' })).toBeVisible()
  await expect(page.getByText('읽기 전용 검색 서비스 계정')).toBeVisible()

  await open(page, '#/learn/week/4/concepts/w5-database-controls')
  await expect(page.getByRole('heading', { name: '최소 권한·오류 처리·로그는 왜 따로 필요한가' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '각 통제가 줄이는 위험은 다르다' })).toBeVisible()

  await open(page, '#/labs/w5-query-review')
  for (const name of [
    '정렬 선택값을 코드에 정의한 허용 목록으로 매핑함',
    '검색 category 값은 별도 파라미터 배열로 전달됨',
    '읽기 전용 역할은 필요한 컬럼만 가진 view에 SELECT 권한을 가짐',
    '브라우저 응답은 일반 오류와 추적 ID만 표시하고 상세 오류는 내부 기록에 남김',
  ]) await page.getByRole('checkbox', { name }).check()
  await page.getByRole('button', { name: '결과 판정' }).click()
  await expect(page.getByText('선택한 증거와 연결 근거가 관찰 시나리오와 일치합니다.')).toBeVisible()
})

test('Week 05 CSRF reader connects request legitimacy to safe endpoint review', async ({ page }) => {
  await open(page, '#/learn/week/5/concepts/w6-state-change')
  await expect(page.locator('.reader-document > header h2')).toHaveText('상태 변경 요청과 브라우저의 기본 동작')
  await expect(page.locator('.reader-toc > button')).toHaveCount(5)
  await expect(page.getByRole('heading', { name: '조회와 상태 변경을 구분하는 기준' })).toBeVisible()

  await open(page, '#/learn/week/5/concepts/w6-csrf-controls')
  await expect(page.getByRole('heading', { name: 'CSRF 방어 통제의 역할과 한계' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cookie·Fetch Metadata 공식 참고' })).toBeVisible()

  await open(page, '#/labs/w6-request-review')
  for (const name of [
    '프로필 표시값 변경은 POST endpoint에서 처리됨',
    '서버가 세션과 연결된 token 누락·불일치를 403으로 거절함',
    '허용되지 않은 Origin은 상태 변경 전에 거절함',
    'Sec-Fetch-Site가 cross-site이면 정책에 따라 차단하고 미지원 클라이언트 fallback을 둠',
    '인증된 사용자도 자신이 변경할 수 있는 프로필인지 서버에서 인가 확인함',
  ]) await page.getByRole('checkbox', { name }).check()
  await page.getByRole('button', { name: '결과 판정' }).click()
  await expect(page.getByText('선택한 증거와 연결 근거가 관찰 시나리오와 일치합니다.')).toBeVisible()
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
