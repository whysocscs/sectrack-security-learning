const guidanceByType = {
  module: '읽은 뒤 이해한 내용을 메모하고, 읽음과 숙련도를 같은 의미로 처리하지 마세요.',
  lab: '수행 순서와 실제로 관찰한 결과를 분리해 기록하세요.',
  quiz: '오답은 관련 개념으로 돌아갈 수 있는 복습 신호로 사용합니다.',
  record: '이번 주에 확인한 사실과 아직 헷갈리는 내용을 본인의 문장으로 정리하세요.',
  review: '숙련 근거가 약하거나 복습으로 표시한 개념부터 다시 확인하세요.',
}
export function getLocalLearningGuidance(task) {
  return {
    source: 'local-rule',
    title: task?.title || '다음 학습 활동',
    body: guidanceByType[task?.type] || guidanceByType.review,
  }
}
