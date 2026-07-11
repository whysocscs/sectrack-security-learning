export const weekZeroQuizQuestions = Object.freeze([
  { id: 'w0q1', conceptIds: ['w0-language'], difficulty: 'foundation', remediationModuleIds: ['w0-language'], question: '자산에 피해를 줄 수 있는 공격자·사건·조건을 가리키는 말은?', options: ['위협', '통제', '재시험'], answer: 0, explanation: '위협은 자산에 손해를 줄 수 있는 잠재적 원인입니다.' },
  { id: 'w0q2', conceptIds: ['w0-language'], difficulty: 'foundation', remediationModuleIds: ['w0-language'], question: 'CWE, CVE, CVSS의 연결로 가장 알맞은 것은?', options: ['CWE는 식별자, CVE는 약점 유형, CVSS는 조직 예산', 'CWE는 약점 유형, CVE는 특정 취약점 식별자, CVSS는 기술적 특성·심각도 표현', '셋 모두 같은 취약점 번호 체계'], answer: 1, explanation: 'CWE는 약점 유형, CVE는 특정 취약점 식별자, CVSS는 기술적 특성과 상대적 심각도를 표현합니다.' },
  { id: 'w0q3', conceptIds: ['w0-language'], difficulty: 'application', remediationModuleIds: ['w0-language'], question: 'CVSS가 높을 때 조직의 최종 위험을 판단하기 위해 추가로 볼 항목은?', options: ['자산 중요도, 실제 노출, 악용 여부, 기존 통제', 'CVE 번호의 자리수', '회사의 직원 수만'], answer: 0, explanation: 'CVSS는 기술적 심각도 표현이며 조직 위험에는 자산·노출·통제와 사업 영향이 더 필요합니다.' },
  { id: 'w0q4', conceptIds: ['w0-language'], difficulty: 'foundation', remediationModuleIds: ['w0-language'], question: '취약한 조건을 실제로 발생시키는 부분과 성공 후 의도한 행동을 수행하는 부분의 조합은?', options: ['Exploit과 Payload', 'CVE와 CWE', 'Firewall과 IDS'], answer: 0, explanation: 'Exploit은 취약 조건을 이용하는 방법이고 Payload는 성공 뒤 의도한 행동을 수행하는 부분입니다.' },
  { id: 'w0q5', conceptIds: ['w0-language'], difficulty: 'application', remediationModuleIds: ['w0-language'], question: 'Fuzzing 중 크래시를 발견한 뒤 가장 적절한 다음 흐름은?', options: ['즉시 취약점으로 공지', '재현·입력 축소·원인 분석·보안 영향 판단', '대상 시스템을 계속 재부팅'], answer: 1, explanation: '크래시만으로는 보안 영향을 단정할 수 없으므로 재현과 원인·영향 분석이 필요합니다.' },
  { id: 'w0q6', conceptIds: ['w0-language'], difficulty: 'foundation', remediationModuleIds: ['w0-language'], question: '로그인 주체가 누구인지 확인하는 과정과 특정 과제에 접근해도 되는지 판단하는 과정을 순서대로 고르면?', options: ['Authorization → Authentication', 'Authentication → Authorization', 'Firewall → EDR'], answer: 1, explanation: 'Authentication은 주체 확인, Authorization은 특정 자원·행동 허용 판단입니다.' },
  { id: 'w0q7', conceptIds: ['w0-domains'], difficulty: 'application', remediationModuleIds: ['w0-domains'], question: 'SBOM, artifact signing, provenance, SCA, CI/CD 통제와 가장 가까운 정규화 직무군은?', options: ['DevSecOps·Software Supply Chain Security', 'SOC L1', 'PKI 운영'], answer: 0, explanation: '이 항목들은 공급망 보안과 DevSecOps의 대표 업무·통제입니다.' },
  { id: 'w0q8', conceptIds: ['w0-careers'], difficulty: 'application', remediationModuleIds: ['w0-careers'], question: 'RBAC, MFA, SSO, PAM, SAML, OAuth, 권한 재검토와 가장 가까운 세부 직무는?', options: ['IAM Engineer', 'Network Forensics Analyst', 'Privacy Consultant'], answer: 0, explanation: 'IAM Engineer는 인증·인가, 역할·정책, SSO·MFA·PAM과 접근 검토를 다룹니다.' },
  { id: 'w0q9', conceptIds: ['w0-careers'], difficulty: 'application', remediationModuleIds: ['w0-careers'], question: 'PIA·DPIA, Data Mapping, Data Classification이 반복되는 역할은?', options: ['Privacy Engineering·Data Privacy', 'AI Red Team', 'SOC Tier2'], answer: 0, explanation: '이 업무는 개인정보 영향 평가와 데이터 흐름·분류를 다루는 Privacy Engineering과 연결됩니다.' },
  { id: 'w0q10', conceptIds: ['w0-evidence'], difficulty: 'application', remediationModuleIds: ['w0-evidence'], question: '이벤트 확인·초동 분류·차단·보고서와 정오탐 판단·호스트·클라우드 분석·Playbook을 올바르게 짝지은 것은?', options: ['둘 다 SOC L1', '앞은 SOC L1, 뒤는 SOC Tier2', '앞은 PKI, 뒤는 GRC'], answer: 1, explanation: '표본에서 SOC L1은 초기 관제·분류, Tier2는 심화 분석과 Playbook·에스컬레이션으로 분리됩니다.' },
  { id: 'w0q11', conceptIds: ['w0-careers'], difficulty: 'application', remediationModuleIds: ['w0-careers'], question: 'Prompt Injection, Jailbreaking, RAG Data Exfiltration, AI Agent 평가와 가장 가까운 세부 직무는?', options: ['AI Red Team', 'Cloud GRC', 'Certificate Lifecycle Engineer'], answer: 0, explanation: 'AI Red Team은 AI 시스템의 공격 기법과 평가를 다루며 AI GRC와 같은 역할로 합치지 않습니다.' },
  { id: 'w0q12', conceptIds: ['w0-evidence'], difficulty: 'analysis', remediationModuleIds: ['w0-evidence'], question: '공고에 “Playbook을 개선한다”라고 직접 적혀 있을 때 대표 산출물 “Playbook”의 근거 라벨은?', options: ['공고 직접 확인', '본문 기반 추론', '현재 모집 중 확인'], answer: 1, explanation: 'Playbook 개선 업무는 직접 확인이지만, 산출물로 Playbook을 정리한 것은 업무 문장에서 추론한 표현입니다.' },
  { id: 'w0q13', conceptIds: ['w0-evidence'], difficulty: 'analysis', remediationModuleIds: ['w0-evidence'], question: '21건 표본 중 협업·문서화가 12건에서 언급되었다는 올바른 해석은?', options: ['전체 보안 채용시장의 공식 비율이다', '이번 21건 표본에서 가장 자주 반복된 요구였지만 전체 시장 통계로 단정할 수 없다', '국내 공고에서만 정확히 12건이었다'], answer: 1, explanation: '이 데이터는 공개 공고 21건의 수작업 1차 표본이며 전체 채용시장을 대표하는 공식 통계가 아닙니다.' },
])

export const weekZeroQuizRule = Object.freeze({
  id: 'w0-quiz-rule',
  poolQuestionIds: weekZeroQuizQuestions.map((question) => question.id),
  questionsPerAttempt: weekZeroQuizQuestions.length,
  selection: 'all-pool',
  minimumCorrect: 11,
  requiredQuestionIds: ['w0q2', 'w0q3', 'w0q6', 'w0q7', 'w0q8', 'w0q12'],
  passingRule: 'minimum-correct-and-all-core',
  allowRetry: true,
})
