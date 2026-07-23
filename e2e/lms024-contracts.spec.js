import { expect, test as base } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { buildRouteManifest } from '../scripts/content-contract.mjs'
import { conceptRegistry } from '../src/content/conceptRegistry.js'
import { quizzes, weekContent } from '../src/courseData.js'
import { getLessonBlocks } from '../src/content/lessonSchema.js'
import { normalizeReportFindingId } from '../src/reportData.js'
import { getFindingStatusLabel, normalizeFindingStatus } from '../src/reportSchema.js'
import { STORAGE_KEY, STORAGE_SCHEMA_VERSION } from '../src/storage.js'

const weeks = Object.values(weekContent).sort((left, right) => left.index - right.index)
const routeManifest = buildRouteManifest()
const contractBaseUrl = String(process.env.SECTRACK_E2E_BASE_URL || '').replace(/\/$/, '')

function groupByWeek(routes) {
  return routes.reduce((groups, route) => {
    const current = groups.get(route.week) || []
    current.push(route)
    groups.set(route.week, current)
    return groups
  }, new Map())
}

const moduleRoutesByWeek = groupByWeek(routeManifest.modules)
const labRoutesByWeek = groupByWeek(routeManifest.labs)
const moduleRouteById = new Map(routeManifest.modules.map((route) => [route.id, route]))

const conceptSourceById = new Map()
for (const week of weeks) {
  for (const module of week.modules) {
    for (const block of getLessonBlocks(module)) {
      if (block.type !== 'concept-ref') continue
      for (const conceptId of block.conceptIds || []) {
        if (!conceptSourceById.has(conceptId)) conceptSourceById.set(conceptId, moduleRouteById.get(module.id))
      }
    }
  }
}

const test = base.extend({
  runtimeOracle: [async ({ page }, use, testInfo) => {
    const issues = []
    const onPageError = (error) => issues.push(`pageerror: ${error.message}`)
    const onConsole = (message) => {
      if (message.type() !== 'error') return
      const location = message.location()
      const expectedSandboxBlock = location.url === 'about:srcdoc'
        && message.text().startsWith("Blocked script execution in 'about:srcdoc' because the document's frame is sandboxed")
      if (expectedSandboxBlock) return
      issues.push(`console.error: ${message.text()}${location.url ? ` @ ${location.url}:${location.lineNumber}` : ''}`)
    }
    const onRequestFailed = (request) => issues.push(`requestfailed: ${request.method()} ${request.url()} · ${request.failure()?.errorText || 'unknown error'}`)
    page.on('pageerror', onPageError)
    page.on('console', onConsole)
    page.on('requestfailed', onRequestFailed)
    await use(issues)
    page.off('pageerror', onPageError)
    page.off('console', onConsole)
    page.off('requestfailed', onRequestFailed)
    expect.soft(issues, `${testInfo.title}: runtime oracle`).toEqual([])
  }, { auto: true }],
})

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function openDirectRoute(page, hash) {
  const response = await page.goto(contractBaseUrl ? `${contractBaseUrl}/${hash}` : `/${hash}`, { waitUntil: 'load' })
  if (response) expect.soft(response.ok(), `${hash} document response`).toBe(true)
  await expect(page.locator('#main-content')).toBeVisible()
  await expect.poll(() => new URL(page.url()).hash).toBe(hash)
  return page.locator('#main-content')
}

async function expectKnownRoute(main, hash) {
  await expect.soft(main, hash).not.toContainText('요청한 페이지를 찾을 수 없습니다.')
  await expect.soft(main, hash).not.toContainText('실습을 찾을 수 없습니다.')
  await expect.soft(main, hash).not.toContainText('이 화면을 표시하지 못했습니다.')
}

async function seedV3(page, data) {
  await page.addInitScript(({ key, schemaVersion, seededData }) => {
    localStorage.setItem(key, JSON.stringify({
      schemaVersion,
      generatedAt: '2026-07-15T00:00:00.000Z',
      appVersion: 'e2e-contract',
      data: { learningPlanVersion: 1, ...seededData },
    }))
  }, { key: STORAGE_KEY, schemaVersion: STORAGE_SCHEMA_VERSION, seededData: data })
}

test.describe('LMS-024 exhaustive desktop route and state contracts', () => {
  test.beforeEach(({ page }, testInfo) => {
    void page
    test.skip(testInfo.project.name !== 'desktop', 'The exhaustive matrix runs once in the desktop project; explicit viewport tests cover mobile and reflow.')
  })

  for (const week of weeks) {
    test(`Week ${String(week.index).padStart(2, '0')} direct module routes render all modeled modules`, async ({ page }) => {
      test.setTimeout(120_000)
      for (const route of moduleRoutesByWeek.get(week.index) || []) {
        await test.step(route.hash, async () => {
          const main = await openDirectRoute(page, route.hash)
          await expectKnownRoute(main, route.hash)
          await expect.soft(page, route.hash).toHaveTitle(new RegExp(escapeRegExp(route.title)), { timeout: 1_500 })
          if (route.week === 0) {
            await expect.soft(main.getByText(route.title, { exact: true }).first(), `${route.hash} must expose its canonical Week 00 module`).toBeVisible()
          } else {
            await expect.soft(page.locator('.reader-document > header h2'), route.hash).toHaveText(route.title)
          }
        })
      }
    })
  }

  for (const week of weeks) {
    test(`Week ${String(week.index).padStart(2, '0')} direct lab routes render all modeled labs`, async ({ page }) => {
      test.setTimeout(90_000)
      for (const route of labRoutesByWeek.get(week.index) || []) {
        await test.step(route.hash, async () => {
          const main = await openDirectRoute(page, route.hash)
          await expectKnownRoute(main, route.hash)
          const titleMarker = route.id === 'w0-map' ? '나의 보안 지도' : route.title
          await expect.soft(main, route.hash).toContainText(titleMarker)
          if (['w4-reflected', 'w4-stored', 'w4-dom'].includes(route.id)) {
            await expect(page.getByTitle(/격리 미리보기/), `${route.hash} preview must keep its scriptless sandbox boundary`).toHaveAttribute('sandbox', '')
          }
        })
      }
    })
  }

  for (const week of weeks) {
    test(`Week ${String(week.index).padStart(2, '0')} quiz and record direct routes match the content model`, async ({ page }) => {
      test.setTimeout(60_000)
      const quizRoute = routeManifest.quizzes.find((route) => route.week === week.index)
      const quizMain = await openDirectRoute(page, quizRoute.hash)
      await expectKnownRoute(quizMain, quizRoute.hash)
      await expect(page.locator('.quiz-page > header h2')).toHaveText(`${week.index}주차 이해 확인`)
      await expect(page.locator('.quiz-card')).toHaveCount(quizzes[week.index].length)

      const recordRoute = routeManifest.records.find((route) => route.week === week.index)
      if (!recordRoute) {
        expect(week.index).toBe(0)
        return
      }
      const recordMain = await openDirectRoute(page, recordRoute.hash)
      await expectKnownRoute(recordMain, recordRoute.hash)
      await expect(page.locator('.submission-form-panel > header h2')).toHaveText(week.recordBlueprint?.title || `${week.index}주차 학습 정리`)
      await expect(page.getByRole('textbox', { name: /학습 요약/ })).toBeVisible()
    })
  }

  test('Week 00 custom tabs, compatibility aliases, and canonical destinations remain recoverable', async ({ page }) => {
    test.setTimeout(90_000)
    const routes = [
      ['#/learn/week/0/overview', weekContent[0].title],
      ['#/learn/week/0/glossary', '보안 용어'],
      ['#/learn/week/0/careers', '분야'],
      ['#/learn/week/0/map', '나의 보안 지도'],
      ['#/learn/week/0/quiz', '0주차 이해 확인'],
      ['#/learn/week/0/concepts', '정보보안 핵심 용어'],
      ['#/learn/week/0/labs', '나의 보안 지도'],
      ['#/mindmap', '나의 보안 지도'],
      ['#/labs/w0-map', '나의 보안 지도'],
    ]
    for (const [hash, marker] of routes) {
      await test.step(hash, async () => {
        const main = await openDirectRoute(page, hash)
        await expectKnownRoute(main, hash)
        await expect.soft(main, hash).toContainText(marker)
      })
    }
  })

  for (const concept of Object.values(conceptRegistry)) {
    test(`concept link ${concept.id} resolves its canonical core anchor`, async ({ page }) => {
      const target = routeManifest.modules.find((route) => route.hash === concept.coreAnchor)
      expect(target, `${concept.id} coreAnchor`).toBeTruthy()
      const source = conceptSourceById.get(concept.id)
      if (source) {
        await openDirectRoute(page, source.hash)
        const details = page.locator('.lesson-concept-ref details').filter({ hasText: concept.label }).first()
        await expect(details, `${concept.id} must be rendered by its concept-ref block`).toBeVisible()
        await details.locator('summary').click()
        const link = details.getByRole('link', { name: '이 개념이 처음 나오는 곳으로' })
        await expect(link).toHaveAttribute('href', target.hash)
        await link.click()
        await expect.poll(() => new URL(page.url()).hash).toBe(target.hash)
      } else {
        await openDirectRoute(page, target.hash)
      }
      await expect(page.locator('.reader-document > header h2')).toHaveText(target.title)
    })
  }

  test('malformed and unknown hashes render a recovery destination without a blank screen', async ({ page }) => {
    const malformedHashes = [
      '#/learn/week/not-a-number',
      '#/learn/week/1/concepts/%E0%A4%A',
      '#/learn/week/1/concepts/w1-shell/extra',
      '#/learn/week/1/quiz/extra',
      '#/learn/week/999',
      '#/labs/not-a-real-lab',
      '#/totally-unknown/path',
    ]
    for (const hash of malformedHashes) {
      await test.step(hash, async () => {
        const response = await page.goto(contractBaseUrl ? `${contractBaseUrl}/${hash}` : `/${hash}`, { waitUntil: 'load' })
        if (response) expect.soft(response.ok(), hash).toBe(true)
        const main = page.locator('#main-content')
        await expect(main).toBeVisible()
        await expect.soft(main, hash).toContainText(/요청한 페이지를 찾을 수 없습니다|실습을 찾을 수 없습니다/)
      })
    }
  })

  test('direct route refresh and hash back-forward navigation preserve the selected module', async ({ page }) => {
    const first = moduleRouteById.get('w1-shell')
    const second = moduleRouteById.get('w3-http')
    await openDirectRoute(page, first.hash)
    await expect(page.locator('.reader-document > header h2')).toHaveText(first.title)

    await page.evaluate((hash) => { window.location.hash = hash }, second.hash)
    await expect.poll(() => new URL(page.url()).hash).toBe(second.hash)
    await expect(page.locator('.reader-document > header h2')).toHaveText(second.title)

    await page.goBack()
    await expect.poll(() => new URL(page.url()).hash).toBe(first.hash)
    await expect(page.locator('.reader-document > header h2')).toHaveText(first.title)
    await expect(page.locator('#main-content')).toBeFocused()

    await page.goForward()
    await expect.poll(() => new URL(page.url()).hash).toBe(second.hash)
    await expect(page.locator('.reader-document > header h2')).toHaveText(second.title)
    await page.reload({ waitUntil: 'load' })
    await expect.poll(() => new URL(page.url()).hash).toBe(second.hash)
    await expect(page.locator('.reader-document > header h2')).toHaveText(second.title)
  })

  test('section table of contents exposes a persistent deep link and current location', async ({ page }) => {
    const route = moduleRoutesByWeek.get(14)[0]
    await openDirectRoute(page, route.hash)
    const toc = page.locator('.reader-section-toc')
    const links = toc.getByRole('link')
    await expect(links.first()).toHaveAttribute('aria-current', 'location')
    const target = links.nth(1)
    const href = await target.getAttribute('href')
    expect(href).toContain(`${route.hash}/section/`)
    await target.click()
    await expect.poll(() => new URL(page.url()).hash).toBe(href)
    await expect(target).toHaveAttribute('aria-current', 'location')
    await page.reload({ waitUntil: 'load' })
    await expect.poll(() => new URL(page.url()).hash).toBe(href)
    await expect(toc.getByRole('link').nth(1)).toHaveAttribute('aria-current', 'location')
  })

  test('skip link moves focus without replacing the hash route', async ({ page }) => {
    await openDirectRoute(page, '#/')
    const skipLink = page.getByRole('link', { name: '본문으로 건너뛰기' })
    await skipLink.focus()
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect.poll(() => new URL(page.url()).hash).toBe('#/')
    await expect(page.locator('#main-content')).toBeFocused()
    await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다' })).toHaveCount(0)
  })

  test('invalid lab completion focuses the first invalid field and uses natural Korean feedback', async ({ page }) => {
    await openDirectRoute(page, moduleRouteById.get('w1-filesystem').hash)
    await page.evaluate(() => { window.location.hash = '#/labs/w1-treasure' })
    await expect(page.getByRole('button', { name: '활동 기록 검증' })).toBeVisible()
    await page.getByRole('button', { name: '활동 기록 검증' }).click()
    const firstInvalid = page.locator('.activity-record-fields textarea[aria-invalid="true"]').first()
    await expect(firstInvalid).toBeFocused()
    const summary = page.locator('.form-error-summary').filter({ hasText: '활동 기록 전 확인할 항목' })
    await expect(summary).not.toContainText(/을\(를\)|은\(는\)/)
  })

  test('corrupt storage is not overwritten and its exact raw value can be downloaded for recovery', async ({ page }) => {
    const raw = '{malformed-original'
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: STORAGE_KEY, value: raw })
    await openDirectRoute(page, '#/')
    const recovery = page.getByRole('alert').filter({ hasText: '자동 저장을 중지했습니다.' })
    await expect(recovery).toBeVisible()
    await expect(recovery).toContainText('기존 원본은 덮어쓰지 않았습니다.')
    await expect(recovery.getByRole('button', { name: '검증된 파일로 교체' })).toBeDisabled()
    await expect(recovery.getByRole('button', { name: '새 기록으로 초기화' })).toBeDisabled()
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(raw)

    const downloadPromise = page.waitForEvent('download')
    await recovery.getByRole('button', { name: '원본 데이터 내보내기' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('sectrack-recovery-v3.json')
    expect(await readFile(await download.path(), 'utf8')).toBe(raw)
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(raw)

    await recovery.getByRole('checkbox').check()
    await expect(recovery.getByRole('button', { name: '검증된 파일로 교체' })).toBeEnabled()
    await expect(recovery.getByRole('button', { name: '새 기록으로 초기화' })).toBeEnabled()
  })

  test('report index and editor expose the same persisted finding ID and completion state', async ({ page }) => {
    const title = '저장된 보고서 상태가 목록과 편집기에서 동일하게 표시되는 계약'
    const legacyFindingId = 'W4-XSS-777'
    const legacyStatus = 'completed'
    const findingId = normalizeReportFindingId(legacyFindingId)
    const status = normalizeFindingStatus(legacyStatus)
    const statusLabel = getFindingStatusLabel(status)
    await seedV3(page, {
      reports: {
        'local-xss-draft': {
          id: 'local-xss-draft',
          findingId: legacyFindingId,
          title,
          status: legacyStatus,
          profile: 'xss',
          updatedAt: '2026-07-15T00:00:00.000Z',
        },
      },
    })
    await openDirectRoute(page, '#/reports')
    const file = page.getByRole('button', { name: new RegExp(escapeRegExp(title)) })
    await expect(file).toContainText(findingId)
    await expect(file).toContainText(statusLabel)
    await expect(file).not.toContainText('초안')
    await file.click()
    await expect.poll(() => new URL(page.url()).hash).toBe('#/reports/new')
    await expect(page.getByLabel('상태')).toHaveValue(status)
    const outline = page.locator('.report-outline > header')
    await expect(outline).toContainText(findingId)
    await expect(outline).toContainText(statusLabel)
    await expect(outline).not.toContainText('초안')
  })

  test('home startup does not request Week 03–15 deep-guide modules', async ({ page }) => {
    const scriptRequests = []
    const fontRequests = []
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scriptRequests.push(new URL(request.url()).pathname)
      if (request.resourceType() === 'font') fontRequests.push(new URL(request.url()).pathname)
    })

    const main = await openDirectRoute(page, '#/')
    await expect(main.getByRole('heading', { name: 'Week 00~15 학습 흐름' })).toBeVisible()
    await page.waitForLoadState('networkidle')

    const deepGuideRequests = scriptRequests.filter((pathname) => /(?:^|\/)week(?:3|[4-9]|1[0-5])[^/]*DeepDive[^/]*\.js$/i.test(pathname))
    expect(deepGuideRequests, 'home startup must leave Week 03–15 deep content behind route-level boundaries').toEqual([])
    expect(fontRequests.filter((pathname) => pathname.endsWith('/PretendardVariable.woff2')), 'home startup must use the system font stack without downloading Pretendard').toEqual([])
  })

  test('representative documents do not create page-level horizontal overflow', async ({ page }) => {
    test.setTimeout(180_000)
    const representativeRoutes = [
      '#/',
      '#/learn',
      moduleRouteById.get('w1-navigation').hash,
      moduleRouteById.get('w4-validation').hash,
      moduleRoutesByWeek.get(14)[0].hash,
      moduleRoutesByWeek.get(15)[0].hash,
      labRoutesByWeek.get(15)[0].hash,
      '#/learn/week/15/quiz',
      '#/learn/week/15/record',
      '#/reports',
    ]
    const matrix = [
      { label: 'desktop-1440', viewport: { width: 1440, height: 900 }, routes: representativeRoutes },
      { label: 'mobile-360', viewport: { width: 360, height: 800 }, routes: representativeRoutes },
      { label: 'desktop-1366', viewport: { width: 1366, height: 768 }, routes: [moduleRouteById.get('w1-navigation').hash] },
      { label: 'tablet-768', viewport: { width: 768, height: 1024 }, routes: [moduleRoutesByWeek.get(14)[0].hash] },
      { label: 'mobile-390', viewport: { width: 390, height: 844 }, routes: [labRoutesByWeek.get(15)[0].hash] },
      { label: 'zoom-200-equivalent-720', viewport: { width: 720, height: 450 }, routes: [moduleRoutesByWeek.get(14)[0].hash] },
      { label: 'max-font-360', viewport: { width: 360, height: 800 }, fontScale: '150%', routes: [moduleRouteById.get('w3-dom').hash, '#/learn/week/15/record'] },
    ]

    for (const entry of matrix) {
      await page.setViewportSize(entry.viewport)
      for (const hash of entry.routes) {
        await test.step(`${entry.label} ${hash}`, async () => {
          const main = await openDirectRoute(page, hash)
          await expectKnownRoute(main, hash)
          await page.evaluate((fontScale) => document.documentElement.style.setProperty('--app-font-scale', fontScale || '100%'), entry.fontScale)
          const metrics = await page.evaluate(() => ({
            clientWidth: document.documentElement.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
          }))
          expect.soft(metrics.documentScrollWidth, `${entry.label} ${hash} document overflow`).toBeLessThanOrEqual(metrics.clientWidth + 1)
          expect.soft(metrics.bodyScrollWidth, `${entry.label} ${hash} body overflow`).toBeLessThanOrEqual(metrics.clientWidth + 1)
        })
      }
    }
  })
})
