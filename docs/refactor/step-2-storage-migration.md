# STEP 2 저장·마이그레이션

## 새 envelope

활성 키: `sectrack-orchestrator-v3`

```json
{
  "schemaVersion": 3,
  "generatedAt": "ISO-8601",
  "appVersion": "0.1.0",
  "data": {}
}
```

`data`에는 기존 v2 필드와 함께 `moduleNotes`, `settings.fontScale`, `settings.sidebarMode`, `settings.displayName`, `lastActivityAt`을 저장한다. 알려지지 않은 기존 필드도 merge 과정에서 버리지 않는다.

## v2 보존 절차

1. `sectrack-orchestrator-v2` 원문을 읽는다.
2. JSON, 깊이, 필드 수, 배열 수, key/string 길이를 검증한다.
3. 원문과 byte 단위로 같은 값을 `sectrack-orchestrator-v2-backup`에 저장하고 다시 읽어 확인한다.
4. 검증된 merge 결과로 v3 envelope를 만든다.
5. 그 후에만 `sectrack-orchestrator-v3`를 저장한다.
6. v2와 v2 backup은 삭제하거나 변경하지 않는다.

손상된 v2/v3, backup 충돌, storage read/write 실패가 발생하면 `canPersist=false`로 자동 저장을 중지한다. App은 경고와 원본 내보내기 동작을 제공하며 빈 기본값으로 원본을 덮어쓰지 않는다.

## import 제한

- 최대 입력: 2 MiB
- 최대 field/array item 합계: 10,000
- 최대 string: 100,000자
- 최대 key: 256자
- 최대 depth: 20
- 최대 array: 10,000개
- 지원 버전: v3만
- unknown envelope top-level field: 거부

## 테스트

`test/storage.test.js` 7개가 다음을 확인한다.

- valid v2 exact backup 후 v3 migration
- malformed v2 원본 보존과 save 차단
- malformed v3 원본 보존과 save 차단
- partial v3 default merge와 unknown field 보존
- export/import round trip과 metadata
- oversized input/string 거부 및 write 0회
- recursive field limit 거부
