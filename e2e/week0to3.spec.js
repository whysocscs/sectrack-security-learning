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

test('local page editor is available on Week 0 glossary and previews selected text without saving', async ({ page }) => {
  await open(page, '#/learn/week/0/glossary')
  await page.getByRole('button', { name: '페이지 편집', exact: true }).click()
  const editor = page.getByRole('dialog', { name: '화면 문구 직접 수정' })
  await expect(editor).toBeVisible()
  const glossaryTitle = page.locator('.glossary-detail h2')
  const originalTitle = await glossaryTitle.textContent()
  await glossaryTitle.click()
  const text = editor.getByLabel('수정 문구')
  await text.fill('화면에서 확인하는 보안 용어')
  await expect(glossaryTitle).toHaveText('화면에서 확인하는 보안 용어')
  await editor.getByRole('button', { name: '입력 취소' }).click()
  await expect(glossaryTitle).toHaveText(originalTitle)

  await editor.getByRole('button', { name: '페이지 편집 패널 닫기' }).click()
  await open(page, '#/')
  await expect(page.getByRole('button', { name: '페이지 편집', exact: true })).toBeVisible()
})

test('page navigation and local view selectors use current-page or pressed states instead of incomplete tabs', async ({ page }) => {
  await open(page, '#/learn/week/4')
  const weekNavigation = page.getByRole('navigation', { name: '주차 학습 메뉴' })
  await expect(weekNavigation.locator('[role="tab"]')).toHaveCount(0)
  await expect(weekNavigation.getByRole('button', { name: '이번 주' })).toHaveAttribute('aria-current', 'page')
  await weekNavigation.getByRole('button', { name: '개념 모듈' }).click()
  await expect(weekNavigation.getByRole('button', { name: '개념 모듈' })).toHaveAttribute('aria-current', 'page')

  await open(page, '#/labs/w4-reflected')
  const contexts = page.getByRole('group', { name: 'XSS 출력 컨텍스트' })
  await expect(contexts.locator('[role="tab"]')).toHaveCount(0)
  await expect(contexts.getByRole('button', { name: 'HTML Body' })).toHaveAttribute('aria-pressed', 'true')
  await contexts.getByRole('button', { name: 'JS Data' }).click()
  await expect(contexts.getByRole('button', { name: 'JS Data' })).toHaveAttribute('aria-pressed', 'true')
})

test('Week 0 glossary opens directly with five source-backed term groups', async ({ page }) => {
  await open(page, '#/learn/week/0/glossary')
  const weekZeroNavigation = page.getByRole('navigation', { name: 'Week 0 학습 메뉴' })
  await expect(weekZeroNavigation.getByRole('button', { name: '이번 주', exact: true })).toHaveCount(0)
  await expect(page.locator('.glossary-category-toggles > section')).toHaveCount(5)
  await expect(page.locator('.glossary-detail h2')).toHaveText('자산')
  await expect(page.locator('.glossary-detail section > h3')).toHaveText('설명')
  await expect(page.locator('.glossary-detail')).not.toContainText('한국어:')
  await expect(page.locator('.glossary-case-study > span')).toHaveText('예시)')
  await expect(page.getByText('Threat', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('textbox', { name: '보안 용어 검색' })).toBeVisible()

  await page.getByRole('textbox', { name: '보안 용어 검색' }).fill('Fuzzing')
  await page.getByRole('button', { name: /Fuzzing/ }).last().click()
  await expect(page.locator('.glossary-figure img')).toBeVisible()
  await expect(page.locator('.glossary-figure img')).toHaveJSProperty('naturalWidth', 1448)
})

test('Week 0 field and role map opens on domains without a market overview', async ({ page }) => {
  await open(page, '#/learn/week/0/concepts/w0-domains')
  const navigation = page.getByRole('navigation', { name: '직무 근거 탐색 보기' })
  await expect(navigation.getByRole('button', { name: '시장 개요', exact: true })).toHaveCount(0)
  await expect(navigation.getByRole('button', { name: '분야', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { name: '분야 하나를 열면 해당 직무군과 역할이 이어집니다.' })).toBeVisible()
})

test('Week 1 to 2 learning routes load their intended readers', async ({ page }) => {
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
  await open(page, '#/learn/week/1/concepts/w1-shell')
  await expect(page.locator('.reader-toc > button')).toHaveCount(10)
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
  await expect(page.locator('.lesson-question')).toHaveCount(0)
  await expect(page.getByText('예상 학습 시간', { exact: true })).toHaveCount(0)
  await expect(page.getByText('이 모듈의 질문', { exact: true })).toHaveCount(0)
  await expect(page.getByText('LEARNING QUESTION', { exact: true })).toHaveCount(0)
  await expect(page.getByText('터미널에서 입력한 명령은 어떤 과정을 거쳐 파일을 읽고 화면에 출력될까?', { exact: true })).toHaveCount(0)
  await expect(page.locator('.educational-code-notice')).toHaveCount(0)
  await expect(page.getByText('교육용 재구성 예제', { exact: true })).toHaveCount(0)

  await open(page, '#/learn/week/1/concepts/w1-navigation')
  const misconceptions = page.locator('.lesson-misconception li')
  await expect(misconceptions).toHaveCount(2)
  await expect(misconceptions.locator('> div')).toHaveCount(2)
  await expect(misconceptions.locator('> code')).toHaveCount(0)
  await expect(page.getByText('CODECURELAB CASE')).toHaveCount(0)
  await expect(page.locator('.lesson-checkpoint')).toHaveCount(2)
  const firstCheckpoint = page.locator('.lesson-checkpoint').first()
  await firstCheckpoint.getByRole('radio', { name: '`find . -type f -name "*.log"`', exact: true }).check()
  await expect(firstCheckpoint.getByRole('status')).toContainText('확인됨')
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

test('display Week 03 XSS guide shows CVE evidence, retests, and exactly four allowed activities', async ({ page }) => {
  await open(page, '#/learn/week/3/concepts/w4-nature')
  await expect(page.locator('.reader-document > header h2')).toHaveText('검색어는 언제 HTML이 되는가')
  await expect(page.getByText('예상 학습 시간', { exact: true })).toHaveCount(0)
  await expect(page.getByText('이 모듈의 질문', { exact: true })).toHaveCount(0)
  await expect(page.getByText('LEARNING QUESTION', { exact: true })).toHaveCount(0)
  await expect(page.locator('.lesson-concept-ref details')).toHaveCount(5)

  await open(page, '#/learn/week/3/concepts/w4-taint')
  await expect(page.getByRole('heading', { name: 'Reflected XSS: RESTEasy 오류 응답의 URL encoding' })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2020-10688', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-mechanism')).toContainText('REST API가 문자열을 Java 값으로 바꾸다 실패하는 정상 경로')
  await expect(page.locator('.educational-code-notice')).toHaveCount(0)
  await expect(page.getByText('교육용 재구성 예제', { exact: true })).toHaveCount(0)
  await expect(page.locator('.lesson-cve-case')).toContainText('RESTEasy는 Java 애플리케이션이 HTTP 요청을 JAX-RS resource 메서드와 Java parameter로 연결')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('공식 수정 diff')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('_encode(strVal)')
  await expect(page.locator('.lesson-impact-map')).toContainText('공격자가 직접 정할 수 없는 상태')
  const deepDiveOrder = await page.locator('.lesson-blocks > section').evaluateAll((sections) => sections.map((section) => {
    if (section.querySelector('.lesson-mechanism')) return 'mechanism'
    if (section.querySelector('.lesson-code-trace')) return 'code-trace'
    if (section.querySelector('.lesson-cve-case')) return 'cve'
    if (section.querySelector('.lesson-patch-analysis')) return 'patch'
    if (section.querySelector('.lesson-impact-map')) return 'impact'
    return null
  }).filter(Boolean))
  expect(deepDiveOrder).toEqual(['mechanism', 'code-trace', 'cve', 'patch', 'impact'])

  await open(page, '#/learn/week/3/concepts/w4-context')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('세 contact field를 같은 출력 계약으로 맞추다')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('escape(firstName)')

  await open(page, '#/learn/week/3/concepts/w4-impact')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('htmlPrefilter')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('return html;')

  await open(page, '#/learn/week/3/concepts/w4-validation')
  await expect(page.getByRole('heading', { name: '두 번째 확인의 증거 지도' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '로컬 안전 실습의 재시험 행렬' })).toBeVisible()
  await expect(page.locator('.lesson-practice-links button')).toHaveCount(4)
  await expect(page.locator('.lesson-practice-links')).toContainText('Reflected XSS · 검색어 반사')
  await expect(page.locator('.lesson-practice-links')).toContainText('Stored XSS · 게시글')
  await expect(page.locator('.lesson-practice-links')).toContainText('DOM-based XSS · fragment와 innerHTML')
  await expect(page.locator('.lesson-practice-links')).toContainText('공식 XSS Lab 연결')
})

test('display Week 03 reader keeps its evidence and retest blocks within a 360px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/3/concepts/w4-validation')
  await expect(page.locator('.lesson-evidence-board')).toBeVisible()
  await expect(page.locator('.lesson-retest')).toBeVisible()
  await open(page, '#/learn/week/3/concepts/w4-impact')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('activated Week 4 to Week 15 routes render a reader, assessment, and safe local lab', async ({ page }) => {
  await open(page, '#/learn/week/4/concepts/w5-query-boundary')
  await expect(page.getByRole('heading', { name: '데이터와 SQL 문장 구조의 경계', exact: true })).toBeVisible()

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
  await expect(page.getByRole('heading', { name: '파일 전송 웹 화면이 데이터베이스를 사용하는 정상 경로' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '처음 알아둘 데이터베이스 언어' })).toBeVisible()
  await expect(page.getByText('읽기 전용 검색 서비스 계정')).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2023-34362', { exact: true })).toBeVisible()
  await expect(page.locator('.cve-profile')).toContainText('managed file transfer')
  await expect(page.locator('.cve-profile')).toContainText('2023.0.1')
  await expect(page.locator('.educational-code-notice')).toHaveCount(0)
  await expect(page.getByText('교육용 재구성 예제', { exact: true })).toHaveCount(0)
  await expect(page.locator('.lesson-patch-analysis')).toContainText('실제 취약 source')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('db.query(sql, params)')
  await expect(page.locator('.lesson-impact-map')).toContainText('공격자가 직접 정할 수 없는 상태')

  await open(page, '#/learn/week/4/concepts/w5-query-boundary')
  await expect(page.getByRole('heading', { name: 'DBMS가 문장을 해석하고 값을 사용하는 두 단계' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('이 줄이 취약 구조의 정확한 실패 지점')

  await open(page, '#/learn/week/4/concepts/w5-parameterization')
  await expect(page.getByRole('heading', { name: '값은 바인딩하고 SQL 구조 선택은 허용 목록으로 제한한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText("newest: 'created_at DESC'")

  await open(page, '#/learn/week/4/concepts/w5-database-controls')
  await expect(page.getByRole('heading', { name: '최소 권한·오류 처리·로그는 왜 따로 필요한가', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '같은 DB 오류를 사용자 응답과 내부 증거로 나누는 방어 구조' })).toBeVisible()
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

test('display Week 04 deep SQLi blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/4/concepts/w5-db-basics')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 05 CSRF reader connects request legitimacy to safe endpoint review', async ({ page }) => {
  await open(page, '#/learn/week/5/concepts/w6-state-change')
  await expect(page.locator('.reader-document > header h2')).toHaveText('상태 변경 요청과 브라우저의 기본 동작')
  await expect(page.locator('.reader-toc > button')).toHaveCount(5)
  await expect(page.getByRole('heading', { name: '로컬 Gradio 화면에서 파일을 올리는 정상 경로' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '조회와 상태 변경을 구분하는 기준' })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2024-1727', { exact: true })).toBeVisible()
  await expect(page.locator('.cve-profile')).toContainText('4.19.2 미만')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('allow_origins=["*"]')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('origin_name not in localhost_aliases')
  await expect(page.locator('.lesson-patch-analysis .lesson-evidence-meta')).toContainText('공식 수정 diff')
  await expect(page.locator('.lesson-impact-map')).toContainText('UI:R')
  await expect(page.locator('.lesson-impact-map')).toContainText('피해자가 공격자가 준비한 외부 페이지')

  await open(page, '#/learn/week/5/concepts/w6-csrf-controls')
  await expect(page.getByRole('heading', { name: 'CSRF 방어 통제의 역할과 한계' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Token·SameSite·Origin은 서로 다른 단계에서 판단한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('이 줄이 보안 효과 지점')
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

test('display Week 05 Gradio patch and impact blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/5/concepts/w6-state-change')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 06 memory reader presents the sudo case as a safe boundary-review lesson', async ({ page }) => {
  await open(page, '#/learn/week/6/concepts/w7-c-values')
  await expect(page.locator('.reader-document > header h2')).toHaveText('값·주소·포인터의 구분')
  await expect(page.getByRole('heading', { name: '값을 저장하고 주소로 다시 읽는 정상 포인터 흐름' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('포인터 변수와 대상 값이 달라지는 네 줄')

  await open(page, '#/learn/week/6/concepts/w7-sudo-case')
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2021-3156', { exact: true })).toBeVisible()
  await expect(page.locator('.cve-profile')).toContainText('1.9.5p2')
  await expect(page.locator('.lesson-cve-case')).toContainText('권한 상승 절차를 제공하지 않습니다.')
  await expect(page.locator('.lesson-impact-map')).toContainText('AV:L')
  await expect(page.locator('.reader-document')).not.toContainText('sudoedit -s')

  await open(page, '#/learn/week/6/concepts/w7-sudo-patch')
  await expect(page.locator('.lesson-patch-analysis .lesson-evidence-meta')).toContainText('공식 수정 diff')
  await expect(page.locator('.lesson-patch-analysis')).toContainText("from[1] != '\\0'")
  await expect(page.locator('.lesson-patch-analysis')).toContainText('size - (to - user_args) < 1')

  await open(page, '#/learn/week/6/concepts/w7-memory-layout')
  await expect(page.getByRole('heading', { name: '스택과 힙을 주소가 아니라 생성·소유·종료 시점으로 읽기' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('strnlen(src, capacity)')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 06 pointer, patch, and memory blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/6/concepts/w7-c-values')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/6/concepts/w7-sudo-case')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/6/concepts/w7-sudo-patch')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 07 assembly reader separates calling-convention facts from the sudo CVE cause', async ({ page }) => {
  await open(page, '#/learn/week/7/concepts/w8-instruction-flow')
  await expect(page.locator('.reader-document > header h2')).toHaveText('명령 흐름과 레지스터')
  await expect(page.getByRole('heading', { name: 'CPU가 비교 결과를 분기로 바꾸는 정상 명령 흐름' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('C의 용량 검사가 합성 x86-64 분기로 이어지는 과정')

  await open(page, '#/learn/week/7/concepts/w8-sudo-control-flow')
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2021-3156', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('특정 x86-64 ABI')
  await expect(page.locator('.lesson-cve-case')).toContainText('원인이라는 공식 근거는 없습니다.')
  await expect(page.locator('.lesson-impact-map')).toContainText('ABI는 전달 규칙')

  await open(page, '#/learn/week/7/concepts/w8-sudo-mode-patch')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('#define EDIT_VALID_FLAGS MODE_NONINTERACTIVE')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('valid_flags = EDIT_VALID_FLAGS')

  await open(page, '#/learn/week/7/concepts/w8-stack-frame')
  await expect(page.getByRole('heading', { name: '호출자가 인자를 준비하고 callee가 반환하는 정상 call·ret 흐름' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace .lesson-evidence-meta')).toContainText('공식 표준 기반 모델')
  await expect(page.locator('.lesson-code-trace')).toContainText('mov  edi, 4')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 07 assembly, source patch, and impact blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/7/concepts/w8-instruction-flow')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/7/concepts/w8-sudo-control-flow')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/7/concepts/w8-sudo-mode-patch')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 08 debugger reader keeps the xz case at artifact-provenance review', async ({ page }) => {
  await open(page, '#/learn/week/8/concepts/w9-debugger-flow')
  await expect(page.locator('.reader-document > header h2')).toHaveText('GDB로 실행 흐름 관찰하기')
  await expect(page.getByRole('heading', { name: '디버거는 같은 산출물의 실행을 멈춰 상태 전이를 비교한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('정상값과 범위 밖 값을 같은 중단점에서 비교하는 합성 GDB 전사')
  await expect(page.locator('.educational-code-notice')).toHaveCount(0)

  await open(page, '#/learn/week/8/concepts/w9-xz-provenance')
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2024-3094', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('5.6.0·5.6.1 release tarball')
  await expect(page.locator('.lesson-cve-case')).toContainText('5.6.2 clean release')
  await expect(page.locator('.lesson-cve-case')).toContainText('Git 저장소에는 없었다')
  await expect(page.locator('.lesson-impact-map')).toContainText('오염된 release artifact와 실제 배포 경로')

  await open(page, '#/learn/week/8/concepts/w9-xz-response')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('lzma_resolver_attributes')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('#ifdef CRC_USE_IFUNC')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('전체 backdoor source')

  await open(page, '#/learn/week/8/concepts/w9-bytes-io')
  await expect(page.getByRole('heading', { name: '텍스트는 인코딩과 framing을 거쳐 parser가 읽는 byte가 된다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('len(body) == 3')

  await open(page, '#/learn/week/8/concepts/w9-local-driver')
  await expect(page.getByRole('heading', { name: '재현 가능한 local driver는 실행 조건과 관찰 결과를 함께 고정한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('process([artifact')
  await expect(page.locator('.lesson-code-trace')).toContainText('network 없이')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 08 debugger, xz cleanup, bytes, and local-driver blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/8/concepts/w9-debugger-flow')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/8/concepts/w9-xz-provenance')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/8/concepts/w9-xz-response')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 09 memory-safety reader preserves root-fix and safe-retest boundaries', async ({ page }) => {
  await open(page, '#/learn/week/9/concepts/w10-bounds')
  await expect(page.locator('.reader-document > header h2')).toHaveText('경계 검증과 메모리 안전성')
  await expect(page.getByRole('heading', { name: '복사 전에 데이터 길이·종료 byte·목적지 용량을 하나의 계약으로 계산한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText("dst[length] = '\\0'")
  await expect(page.locator('.lesson-code-trace')).toContainText('객체 경계를 처음 벗어난 정확한 실패·효과 지점')
  await expect(page.locator('.educational-code-notice')).toHaveCount(0)

  await open(page, '#/learn/week/9/concepts/w10-sudo-overflow')
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2021-3156', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('1.8.32')
  await expect(page.locator('.lesson-cve-case')).toContainText('1.9.5p2')
  await expect(page.locator('.lesson-cve-case')).toContainText('root fix의 대체물이 아닙니다.')
  await expect(page.locator('.lesson-impact-map')).toContainText('root 권한 영향 사이에는 여러 성립 조건')

  await open(page, '#/learn/week/9/concepts/w10-sudo-regression')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('ISSET(sudo_mode, MODE_RUN)')
  await expect(page.locator('.lesson-patch-analysis')).toContainText("from[1] != '\\0'")
  await expect(page.locator('.lesson-patch-analysis')).toContainText('size - (to - user_args) < 1')

  await open(page, '#/learn/week/9/concepts/w10-mitigations')
  await expect(page.getByRole('heading', { name: 'Root fix와 compiler·loader·page permission 완화는 서로 다른 실패 단계에 작동한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('RUNTIME_IDENTITY = training-unprivileged')
  await expect(page.getByRole('heading', { name: '방어층마다 막는 실패와 남는 한계가 다르다' })).toBeVisible()
  await expect(page.getByText('Build·config', { exact: true })).toBeVisible()

  await open(page, '#/learn/week/9/concepts/w10-retest')
  await expect(page.getByRole('heading', { name: '회귀 시험은 “초과 입력 거절”과 “정상 상태 보존”을 함께 증명한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('ERR_TOO_LONG')
  await expect(page.locator('.lesson-code-trace')).toContainText('raw_input == ABSENT')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 09 root-fix, mitigation, impact, and retest blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/9/concepts/w10-bounds')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/9/concepts/w10-sudo-overflow')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/9/concepts/w10-sudo-regression')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 10 AI-analysis reader uses xz only as evidence-verification context', async ({ page }) => {
  await open(page, '#/learn/week/10/concepts/w11-ai-claims')
  await expect(page.locator('.reader-document > header h2')).toHaveText('AI 답변을 주장 단위로 검증하기')
  await expect(page.getByRole('heading', { name: 'AI 답변은 결론이 아니라 검증 대기 중인 주장 묶음으로 처리한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('합성 claim ledger')
  await expect(page.locator('.lesson-code-trace')).toContainText('contradicted')
  await expect(page.locator('.educational-code-notice')).toHaveCount(0)

  await open(page, '#/learn/week/10/concepts/w11-xz-evidence')
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2024-3094', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('5.6.0·5.6.1 release tarball')
  await expect(page.locator('.lesson-cve-case')).toContainText('5.6.2 clean release')
  await expect(page.locator('.lesson-cve-case')).toContainText('Git repository에는 없었다')
  await expect(page.locator('.lesson-impact-map')).toContainText('모든 xz 설치가 위험')

  await open(page, '#/learn/week/10/concepts/w11-xz-incident')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('lzma_resolver_attributes')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('#ifdef CRC_USE_IFUNC')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('전체 trigger source가 아닙니다')

  await open(page, '#/learn/week/10/concepts/w11-local-triage')
  await expect(page.getByRole('heading', { name: 'Crash triage는 종료 신호에서 첫 잘못된 상태 전이까지 거슬러 올라간다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('checksum(body, declared)')
  await expect(page.locator('.lesson-code-trace')).toContainText('정확한 실패·효과 지점')

  await open(page, '#/learn/week/10/concepts/w11-retest')
  await expect(page.getByRole('heading', { name: '방어 가설은 같은 artifact의 실패·정상·인접 경로 oracle로 검증한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('checksum_calls=0')
  await expect(page.getByRole('heading', { name: 'AI 제안을 실제 방어로 바꿀 때 필요한 다섯 증거 층' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 10 claim, triage, patch, impact, and retest blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/10/concepts/w11-ai-claims')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/10/concepts/w11-xz-evidence')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/10/concepts/w11-xz-incident')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 11 crypto reader maps Terrapin to strict-KEX remediation without MITM reproduction', async ({ page }) => {
  await open(page, '#/learn/week/11/concepts/w12-crypto-boundaries')
  await expect(page.locator('.reader-document > header h2')).toHaveText('인코딩·해시·암호화의 목적')
  await expect(page.getByRole('heading', { name: '같은 byte라도 표현·동일성 비교·기밀성 보호는 서로 다른 변환을 쓴다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('training-key-handle')
  await expect(page.locator('.educational-code-notice')).toHaveCount(0)

  await open(page, '#/learn/week/11/concepts/w12-terrapin-flow')
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2023-48795', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('OpenSSH 9.6 이전')
  await expect(page.locator('.lesson-cve-case')).toContainText('OpenSSH 9.6')
  await expect(page.locator('.lesson-cve-case')).toContainText('active man-in-the-middle')
  await expect(page.locator('.lesson-impact-map')).toContainText('C:N, I:H, A:N')

  await open(page, '#/learn/week/11/concepts/w12-strict-kex')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('type == SSH2_MSG_NEWKEYS && ssh->kex->kex_strict')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('state->p_send.seqnr = 0')

  await open(page, '#/learn/week/11/concepts/w12-evidence-preservation')
  await expect(page.getByRole('heading', { name: '원본 식별값을 먼저 고정하고 검증된 분석 사본에서만 관찰한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('digest_match: true')

  await open(page, '#/learn/week/11/concepts/w12-forensic-interpretation')
  await expect(page.getByRole('heading', { name: '포렌식 결론은 관찰·가능한 설명·반증 자료·확신 수준을 분리해 만든다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('cause and impact unverified')
  await expect(page.getByRole('heading', { name: 'Code·config·permission·log·test를 암호·증거 경계에 연결하기' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 11 crypto, strict-KEX, impact, and evidence blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/11/concepts/w12-crypto-boundaries')
  await expect(page.locator('.lesson-mechanism')).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/11/concepts/w12-terrapin-flow')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/11/concepts/w12-strict-kex')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 12 network reader connects scoped PCAP evidence to the actual nghttp2 Rapid Reset patch', async ({ page }) => {
  await open(page, '#/learn/week/12/concepts/w13-pcap-scope')
  await expect(page.locator('.reader-document > header h2')).toHaveText('PCAP은 무엇을 보여 주고 무엇을 놓치는가')
  await expect(page.getByRole('heading', { name: 'PCAP은 특정 관찰 지점이 실제로 본 packet bytes와 capture 조건을 보존한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('capture_point: synthetic_client_side')

  await open(page, '#/learn/week/12/concepts/w13-http2-rapid-reset')
  await expect(page.getByRole('heading', { name: 'HTTP/2는 한 connection 안의 여러 stream을 frame state로 독립 관리한다' })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2023-44487', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('nghttp2 1.57.0 미만(<1.57.0)')
  await expect(page.locator('.lesson-cve-case')).toContainText('nghttp2 1.57.0')
  await expect(page.locator('.lesson-impact-map')).toContainText('C:N/I:N/A:H')

  await open(page, '#/learn/week/12/concepts/w13-nghttp2-budget')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('nghttp2_ratelim_drain')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('NGHTTP2_GOAWAY')

  await open(page, '#/learn/week/12/concepts/w13-wireshark-filters')
  await expect(page.getByRole('heading', { name: 'Display filter는 저장된 packet을 바꾸지 않고 분석 질문에 맞는 row만 선택한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('http2.type == 3')

  await open(page, '#/learn/week/12/concepts/w13-network-reporting')
  await expect(page.getByRole('heading', { name: 'Network finding은 packet fact를 server resource evidence와 상관분석해 만든다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('conclusion: normal cancellation consistent with available evidence')
  await expect(page.getByRole('heading', { name: 'Rapid Reset 방어를 code·config·permission·log·test로 나누기' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 12 PCAP, HTTP/2, patch, and impact blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/12/concepts/w13-pcap-scope')
  await expect(page.locator('.lesson-mechanism')).toHaveCount(1)
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/12/concepts/w13-http2-rapid-reset')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/12/concepts/w13-nghttp2-budget')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 13 fuzzing reader connects harness state to the actual Wasmtime empty-frame patch', async ({ page }) => {
  await open(page, '#/learn/week/13/concepts/w14-fuzzing-model')
  await expect(page.locator('.reader-document > header h2')).toHaveText('Fuzzing의 입력·harness·coverage 모델')
  await expect(page.getByRole('heading', { name: 'Coverage-guided fuzzing은 입력을 바꾸고 관찰 가능한 새 경로를 corpus에 되먹임한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('MAX_INPUT = 64')

  await open(page, '#/learn/week/13/concepts/w14-wasmtime-crash')
  await expect(page.getByRole('heading', { name: 'Wasmtime은 host와 Wasm 사이 trampoline 경계를 따라 stack trace의 끝을 찾아야 한다' })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2024-47763', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('21.0.0, 21.0.1')
  await expect(page.locator('.lesson-cve-case')).toContainText('21.0.2, 22.0.1, 23.0.3, 24.0.1, 25.0.2')
  await expect(page.locator('.lesson-impact-map')).toContainText('AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H')

  await open(page, '#/learn/week/13/concepts/w14-wasmtime-fix')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('reached_entry_sp(fp, trampoline_sp)')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('ControlFlow::Continue(())')

  await open(page, '#/learn/week/13/concepts/w14-crash-triage')
  await expect(page.getByRole('heading', { name: 'Crash triage는 증상 위치에서 시작해 재현 조건·실패 지점·근본 원인·영향을 따로 판정한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('security_impact: unconfirmed')

  await open(page, '#/learn/week/13/concepts/w14-minimize-retest')
  await expect(page.getByRole('heading', { name: 'Input minimization은 같은 oracle을 유지하는 불필요한 조각만 제거한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('same_oracle=true')
  await expect(page.getByRole('heading', { name: 'Code·config·permission·log·test를 fuzzing pipeline에 연결하기' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 13 fuzzing, stack-walk, patch, and impact blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/13/concepts/w14-fuzzing-model')
  await expect(page.locator('.lesson-mechanism')).toHaveCount(1)
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/13/concepts/w14-wasmtime-crash')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/13/concepts/w14-wasmtime-fix')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 14 cloud reader keeps Azure Arc remediation separate from IAM review and live systems', async ({ page }) => {
  await open(page, '#/learn/week/14/concepts/w15-shared-responsibility')
  await expect(page.locator('.reader-document > header h2')).toHaveText('공유 책임 모델을 자산별로 읽기')
  await expect(page.getByRole('heading', { name: '공유 책임은 자산·서비스·통제마다 구현자와 운영 증거의 소유자를 정하는 과정이다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('TRAINING-REPORT-STORE')

  await open(page, '#/learn/week/14/concepts/w15-azure-cluster-connect')
  await expect(page.getByRole('heading', { name: 'Cluster Connect는 Azure identity를 cluster API authorization까지 여러 경계로 전달한다' })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2022-37968', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('1.5.8+, 1.6.19+, 1.7.18+, 1.8.11+')
  await expect(page.locator('.lesson-cve-case')).toContainText('vendor security update의 대체가 아닙니다')
  await expect(page.locator('.lesson-impact-map')).toContainText('AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H')

  await open(page, '#/learn/week/14/concepts/w15-msrc-remediation')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('공식 공급자 수정 기록')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('2.2.2088.5593')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('내부 source code, faulty function·line, change diff, vendor regression test name을 공개하지 않았으므로')

  await open(page, '#/learn/week/14/concepts/w15-iam-least-privilege')
  await expect(page.getByRole('heading', { name: 'IAM decision은 principal·action·resource·condition과 모든 policy layer를 request context에서 계산한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('explicit_deny')
  await expect(page.getByRole('heading', { name: 'Code·config·permission·log·test를 cloud IAM 경계에 연결하기' })).toBeVisible()

  await open(page, '#/learn/week/14/concepts/w15-isolated-cloudgoat')
  await expect(page.getByRole('heading', { name: 'CloudGoat는 production 옆에서 쓰는 scanner가 아니라 별도 계정에 취약 resource를 만드는 lab이다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('decision: DO_NOT_EXECUTE')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 14 responsibility, remediation, and impact blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/14/concepts/w15-shared-responsibility')
  await expect(page.locator('.lesson-mechanism')).toHaveCount(1)
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/14/concepts/w15-azure-cluster-connect')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/14/concepts/w15-msrc-remediation')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Week 15 agent reader separates model proposals, policy authority, and the actual LlamaIndex patch', async ({ page }) => {
  await open(page, '#/learn/week/15/concepts/w16-agent-boundaries')
  await expect(page.locator('.reader-document > header h2')).toHaveText('Mock Agent의 신뢰 경계')
  await expect(page.getByRole('heading', { name: 'Agent는 model 답변이 아니라 data·proposal·policy·permission·execution을 잇는 상태 기계다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('instructions_authorized: false')

  await open(page, '#/learn/week/15/concepts/w16-llamaindex-engine')
  await expect(page.getByRole('heading', { name: 'PandasQueryEngine은 자연어 질문을 Python 표현식으로 바꾼 뒤 interpreter 경계를 통과시킨다' })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toHaveCount(1)
  await expect(page.locator('.lesson-cve-case').getByText('CVE-2024-3098', { exact: true })).toBeVisible()
  await expect(page.locator('.lesson-cve-case')).toContainText('0.10.24 미만')
  await expect(page.locator('.lesson-cve-case')).toContainText('2c92e88838a5f481d50840240b1dd3180066c6f5')
  await expect(page.locator('.lesson-cve-case')).toContainText('CVE-2023-39662의 bypass')
  await expect(page.locator('.lesson-impact-map')).toContainText('CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')

  await open(page, '#/learn/week/15/concepts/w16-llamaindex-lineage')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('공식 수정 diff')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('has_access_to_disallowed_builtin')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('or imports_modules')
  await expect(page.locator('.lesson-patch-analysis')).toContainText('test_default_output_processor_rce2')

  await open(page, '#/learn/week/15/concepts/w16-agent-controls')
  await expect(page.getByRole('heading', { name: '도구 통제는 model proposal을 매번 identity-bound permission으로 다시 계산한다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('ALLOW_ONCE')
  await expect(page.getByRole('heading', { name: 'Code·config·permission·log·test를 agent execution 경계에 연결하기' })).toBeVisible()

  await open(page, '#/learn/week/15/concepts/w16-final-threat-model')
  await expect(page.getByRole('heading', { name: '위협 모델은 이름 목록이 아니라 자산에서 실패 지점과 재시험까지 이어지는 검증 그래프다' })).toBeVisible()
  await expect(page.locator('.lesson-code-trace')).toContainText('educational_fixture_not_production_assurance')
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
})

test('display Week 15 agent, generated-code patch, and impact blocks fit a 360px reader', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await open(page, '#/learn/week/15/concepts/w16-agent-boundaries')
  await expect(page.locator('.lesson-mechanism')).toHaveCount(1)
  await expect(page.locator('.lesson-code-trace')).toBeVisible()

  await open(page, '#/learn/week/15/concepts/w16-llamaindex-engine')
  await expect(page.locator('.lesson-cve-case')).toBeVisible()
  await expect(page.locator('.lesson-impact-map')).toBeVisible()

  await open(page, '#/learn/week/15/concepts/w16-llamaindex-lineage')
  await expect(page.locator('.lesson-patch-analysis')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
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
  const blueTone = page.getByRole('radio', { name: '청색 색상', exact: true })
  await expect(blueTone).toBeVisible()
  await blueTone.check()
  await expect(blueTone).toBeChecked()
})

test('Career Explorer defaults to evidence and keeps graph as a secondary view', async ({ page }) => {
  await open(page, '#/mindmap')
  await expect(page.getByRole('heading', { name: '분야에서 직무군으로, 직무군에서 실제 역할로 내려가는 직무 지도' })).toBeVisible()
  await expect(page.getByText('전문 분야 16개 · 대표 역할 113개 · 상세 근거 카드 33개')).toBeVisible()
  await expect(page.locator('.react-flow__node')).toHaveCount(0)
  const graphView = page.getByRole('button', { name: '관계도' })
  await expect(graphView).toHaveAttribute('aria-pressed', 'false')
  await graphView.click()
  await expect(graphView).toHaveAttribute('aria-pressed', 'true')
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
