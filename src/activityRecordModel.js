import { findSensitiveData } from './platformLogic.js'
import { findDuplicateMeaningfulFields, validateLearningText } from './validation.js'

export const recordFields = Object.freeze({
  practice: [
    { id: 'procedure', label: '수행 순서', required: true, placeholder: '실행한 명령이나 선택을 순서대로 적으세요.' },
    { id: 'observation', label: '관찰한 결과', required: true, placeholder: '화면이나 출력에서 직접 확인한 사실을 적으세요.' },
    { id: 'explanation', label: '왜 그런 결과가 나왔는지', required: true, placeholder: '경로, 권한, 입력과 처리 흐름을 연결해 설명하세요.' },
    { id: 'blocked', label: '막힌 지점', required: true, placeholder: '없었다면 없었음과 그 이유를 적으세요.', rows: 3 },
    { id: 'hintReflection', label: '사용한 힌트 뒤 바뀐 판단', placeholder: '힌트를 열었다면 무엇을 새로 확인했는지 적으세요.', rows: 3 },
    { id: 'nextCheck', label: '다시 할 때 확인할 것', required: true, placeholder: '재시도할 때 먼저 볼 조건을 적으세요.', rows: 3 },
  ],
  investigation: [
    { id: 'hypothesis', label: '처음 가설', required: true, placeholder: '어떤 입력이 어디까지 도달할 것으로 예상했는지 적으세요.' },
    { id: 'procedure', label: '수행 절차', required: true, placeholder: '기준선, 변경한 값 하나, 재시험 순서로 적으세요.' },
    { id: 'observation', label: '관찰 결과', required: true, placeholder: '응답, DOM, 저장 상태 또는 코드에서 직접 본 사실을 적으세요.' },
    { id: 'conclusion', label: '결론', required: true, placeholder: '관찰로 확인할 수 있는 범위만 결론으로 적으세요.' },
    { id: 'comparison', label: '가설과 결과의 차이', required: true, placeholder: '예상과 달랐던 점 또는 일치한 근거를 적으세요.', rows: 3 },
    { id: 'blocked', label: '막힌 지점과 힌트 사용', required: true, placeholder: '막힌 단계와 다음에 확인한 위치를 적으세요.', rows: 3 },
    { id: 'nextCheck', label: '다시 할 때 확인할 것', required: true, placeholder: '같은 조건의 재시험에서 확인할 항목을 적으세요.', rows: 3 },
  ],
  simulation: [
    { id: 'prediction', label: '예상한 변화', required: true, placeholder: '상태를 바꾸기 전에 예상한 결과를 적으세요.' },
    { id: 'changes', label: '바꾼 상태', required: true, placeholder: '기준선에서 변경한 값을 적으세요.' },
    { id: 'actual', label: '실제 변화', required: true, placeholder: '화면과 출력에서 관찰한 변화를 적으세요.' },
    { id: 'comparison', label: '예상과 실제 비교', required: true, placeholder: '일치 여부와 그 이유를 적으세요.' },
    { id: 'nextCheck', label: '다음 실험에서 확인할 것', required: true, placeholder: '한 번에 바꿀 변수와 확인할 출력을 적으세요.', rows: 3 },
  ],
  external: [
    { id: 'goal', label: '수행 목표', required: true, placeholder: '공식 플랫폼에서 해결한 범위를 적으세요.' },
    { id: 'tools', label: '사용한 도구·명령', required: true, placeholder: '자격 증명과 정답은 마스킹하고 도구만 적으세요.' },
    { id: 'principle', label: '핵심 원리', required: true, placeholder: '문제를 해결하는 데 사용한 개념을 설명하세요.' },
    { id: 'blocked', label: '막힌 지점', required: true, placeholder: '없었다면 없었음이라고 적으세요.' },
    { id: 'result', label: '결과와 다음 단계', required: true, placeholder: '완료 여부와 이어서 할 항목을 적으세요.' },
  ],
})

export function evaluateActivityRecord(lab = {}, record = {}) {
  if (lab.activityType === 'assessment' || lab.activityType === 'exploration') return { valid: true, fieldErrors: {} }
  const required = (recordFields[lab.activityType] || recordFields.practice).filter((field) => field.required)
  const fieldErrors = {}
  for (const field of required) {
    const minLength = field.minLength || (field.id === 'blocked' ? 3 : 12)
    const error = validateLearningText(record[field.id], { minLength, label: field.label })
    if (error) fieldErrors[field.id] = error
  }
  for (const ids of findDuplicateMeaningfulFields(required.map((field) => ({ id: field.id, value: record[field.id] })))) {
    for (const id of ids) fieldErrors[id] = '다른 필수 필드와 같은 문장을 반복하지 말고 이 항목의 고유한 근거를 작성하세요.'
  }
  const criteria = Array.isArray(lab.successCriteria) ? lab.successCriteria : []
  const rubric = Array.isArray(lab.rubric) ? lab.rubric : []
  if (criteria.length && new Set(record.criteriaConfirmed || []).size !== criteria.length) fieldErrors.criteriaConfirmed = `성공 조건 ${criteria.length}개를 작업 결과와 대조해 모두 확인하세요.`
  if (rubric.length && new Set(record.rubricConfirmed || []).size !== rubric.length) fieldErrors.rubricConfirmed = `Rubric ${rubric.length}개를 기록과 대조해 모두 확인하세요.`
  if (!record.masked || (lab.activityType === 'external' && !record.scopeConfirmed) || (lab.activityType === 'simulation' && !record.resetConfirmed)) fieldErrors.confirmations = '활동 유형에 필요한 범위·초기화·민감정보 확인을 모두 완료하세요.'
  const recordText = required.map((field) => record[field.id] || '').join('\n')
  if (findSensitiveData(recordText).length > 0) fieldErrors.sensitive = '자격 증명·토큰·개인정보로 보이는 값을 `[REDACTED]`로 바꾼 뒤 다시 확인하세요.'
  return { valid: Object.keys(fieldErrors).length === 0, fieldErrors }
}
