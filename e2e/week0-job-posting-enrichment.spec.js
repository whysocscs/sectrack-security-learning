import { expect, test } from '@playwright/test'

async function openRoleExplorer(page) {
  await page.goto('/#/learn/week/0/concepts/w0-domains')
  await expect(page.locator('#main-content')).toBeVisible()
  await page.getByRole('navigation', { name: '직무 근거 탐색 보기' })
    .getByRole('button', { name: '세부 직무', exact: true })
    .click()
  await expect(page.getByLabel('전문 분야 선택')).toBeVisible()
}

async function selectRole(page, domainId, roleTitle) {
  await page.getByLabel('대표 역할 검색').fill('')
  await page.getByLabel('전문 분야 선택').selectOption(domainId)
  await page.getByLabel('대표 역할 검색').fill(roleTitle)
  const roleButton = page.locator('.research-role-index button').filter({ hasText: roleTitle }).first()
  await roleButton.click()
  await expect(roleButton).toHaveClass(/selected/)
  await expect(page.locator('.research-role-document h2')).toBeVisible()
  await expect(page.locator('.role-posting-research')).toBeVisible()
}

test('Week 0 careers exposes verified research for roles across ten different security areas', async ({ page }) => {
  await openRoleExplorer(page)

  const roles = [
    ['governance', 'GRC Analyst·Engineer'],
    ['appsec', 'Application Security Engineer'],
    ['offensive', 'Penetration Tester'],
    ['detection', 'Detection Engineer'],
    ['dfir', 'DFIR Analyst'],
    ['reverse', 'Malware Reverse Engineer'],
    ['cloud', 'Cloud Security Engineer'],
    ['ot', 'OT Security Engineer'],
    ['ai', 'AI Security Architect'],
    ['security-rnd', 'Security Researcher'],
  ]

  for (const [domainId, roleTitle] of roles) {
    await selectRole(page, domainId, roleTitle)
    const document = page.locator('.research-role-document')
    await expect(document.getByRole('heading', { name: '실제 채용공고 표본' })).toBeVisible()
    await expect(document.getByRole('heading', { name: '여러 공고에서 반복된 주요 업무' })).toBeVisible()
    await expect(document.getByRole('heading', { name: '필수 역량' })).toBeVisible()
    await expect(document.getByRole('heading', { name: '우대 역량' })).toBeVisible()
    await expect(document.getByRole('heading', { name: '기술 및 도구' })).toBeVisible()
    await expect(document.getByRole('heading', { name: '채용공고 조사 근거와 한계' })).toBeVisible()
    await expect(document.locator('.role-posting-result-count')).toContainText('공고')
  }
})

test('Week 0 role posting filters and verified external link contract work', async ({ page }) => {
  await openRoleExplorer(page)
  await selectRole(page, 'governance', 'GRC Analyst·Engineer')

  const research = page.locator('.role-posting-research')
  await expect(research.locator('select')).toHaveCount(8)

  await research.locator('select').nth(0).selectOption('international')
  await expect(research.locator('.role-posting-result-count')).toContainText('필터 조건에 맞는 공고')
  await research.getByRole('button', { name: '필터 초기화' }).click()

  const link = research.getByRole('link', { name: '공고 원문 열기' }).first()
  await expect(link).toHaveAttribute('href', /^https:\/\//)
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', 'noreferrer')
  await expect(research).not.toContainText('접근 실패\n공고 원문 열기')
})

test('Week 0 role research remains usable at 360px and from the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await openRoleExplorer(page)
  await selectRole(page, 'appsec', 'Application Security Engineer')

  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByLabel('전문 분야 선택').focus()
  await expect(page.getByLabel('전문 분야 선택')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('직무군 선택')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('대표 역할 검색')).toBeFocused()
  await expect(page.locator('.role-posting-filters select').first()).toHaveCSS('min-height', '44px')
})
