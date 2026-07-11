# STEP 3 직무 출처 감사

확인일은 모두 2026-07-11이다. 저장한 출처 레코드는 6개이며 현재 모집 중으로 검증한 개별 채용공고는 0개다.

| 구분 | 수 | 용도 | 활성 상태 해석 |
|---|---:|---|---|
| KISA 공식 직무 가이드 | 1 | 9개 직무 분류와 업무 이해 | 채용공고 아님 |
| KISIA 행사 공지 | 1 | 2026 취업박람회 일정 근거 | 채용공고 아님 |
| KISIA 참가기업 프로필 | 3 | 기업이 제시한 직무 범위와 요구 기술 표본 | 개별 공고가 아니므로 현재 모집 여부 `unknown` |
| 암호·PKI 확인 기록 | 1 | 현재 공고 근거 확보 실패 기록 | `unavailable`, 현재 공고로 사용하지 않음 |

## 확인한 1차 출처

- KISA 아카데미 사이버보안 직무 소개: `https://academy.kisa.or.kr/cont/job/jobGuide.do`
- KISIA 2026 정보보호 취업박람회 공지: `https://www.kisia.or.kr/announcement/association/816/`
- KISIA 참가기업 프로필 SK쉴더스: `https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=2`
- KISIA 참가기업 프로필 글로벌에잇: `https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=3`
- KISIA 참가기업 프로필 넷맨: `https://jobfair.kisia.or.kr/modules/board/bd_view.html?id=exhibitor&no=4`

참가기업 세 곳의 화면 캡처는 로컬 asset으로 제공한다. 프로필의 `상시 채용계획` 문구는 게시일·마감일이 있는 개별 공고의 활성 상태로 해석하지 않는다.

## 암호·PKI

암호·PKI는 별도 직무를 임의로 늘리지 않고 하나의 세부 직무 아래 9개 업무 영역으로 정규화했다. 역할 설명에는 현대 암호, 안전한 구현, PKI·인증서 수명주기, TLS·VPN, HSM·KMS·Secrets, 검증, PQC 전환을 포함한다. 검증 가능한 현재 개별 공고를 확보하지 못했으므로 패널에 `현재 여부 미확인`과 확인 실패 사유를 그대로 표시한다.
