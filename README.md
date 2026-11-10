# kdk-commerce

상품 조회부터 주문·결제·배송, 취소·반품·환불까지 구현하는 B2C 커머스 프로젝트.

## 시작한 배경

유통업 백엔드 개발자로 일하며 외주업체가 개발·운영하는 자사몰의 변경 요청을 다뤘다. 기능 추가와 수정이 업체의 일정과 우선순위에 따라 지연되면서 필요한 시점에 반영하기 어려웠다. 향후 자사몰 자체 개발을 준비하기 위해, 커머스의 기본 거래 흐름을 직접 설계하고 구현하는 개인 프로젝트를 시작했다.

## 기술 스택

| 구분 | 기술 | 상태 |
| --- | --- | --- |
| 언어·프레임워크 | Kotlin · Spring Boot | 확정 |
| DB·데이터 접근 | MySQL(InnoDB) · Spring Data JPA | 제안 |
| 빌드 | Gradle Kotlin DSL | 제안 |
| 테스트 | JUnit · Testcontainers | 제안 |
| 실행·배포 | Docker Compose | 제안 |

처음에는 기능별로 코드를 나눈 모듈러 모놀리스로 만든다. 부하 한계와 장애를 확인하고 개선안을 비교한 뒤, 일부 기능을 MSA로 분리한다.

## 패키지 구조 — 초안

```text
io.github.owencity.commerce
├── member       # 회원·인증
├── catalog      # 상품·가격
├── cart         # 장바구니
├── order        # 주문·취소·구매 완료
├── inventory    # 입고·재고·선점
├── payment      # 결제·결제 취소·환불
├── shipping     # 출고·배송
├── returns      # 반품·교환
└── support      # 고객 문의·CS·AI 답변 초안
```

아래는 `order` 내부 구조의 예시다. 다른 기능도 필요한 책임에 따라 나눈다.

```text
order
├── api             # 요청 수신·응답
├── application     # 주문 처리 순서·트랜잭션
├── domain          # 주문 상태·금액·취소 조건
└── infrastructure  # DB 저장·외부 API 연동
```

모듈 간 통신에는 애플리케이션 이벤트를 사용한다. 다른 기능의 DB 테이블이나 내부 구현을 직접 사용하지 않는 구조를 제안한다.

회원·장바구니·교환은 기본 기능으로 포함하는 안이다.

## 문서 목차

| 순서 | 문서 | 상태 |
| --- | --- | --- |
| 1 | [요구사항](docs/02-requirements.md) | 검토 중 |
| 2 | 업무 흐름·상태 설계 | 작성 예정 |
| 3 | DB 설계 | 작성 예정 |
| 4 | 시스템 구조·API 설계 | 작성 예정 |
| 5 | 테스트·장애·부하 시험 | 작성 예정 |
| 6 | 설계 결정 기록(ADR) | 작성 예정 |

## 거래 흐름 예시

### 주문·결제·배송

```mermaid
flowchart TD
    product[상품 조회] --> cart[장바구니 또는 바로 구매]
    cart --> order[주문 생성 · 재고 선점]
    order -->|선점 성공| payment[결제 요청]
    order -->|선점 실패| unavailable[구매 불가 안내]
    order -->|결제 전 취소| release[선점 해제]
    payment --> result{결제 결과}
    result -->|승인 확인| confirmed[주문 확정]
    confirmed --> shipping[출고 · 배송]
    shipping --> delivered[배송 완료]
    delivered --> completed[구매 완료]
    result -->|확정 거절| release
    result -->|결과 미확정| pending[재고 선점 유지 · 출고 보류]
    pending --> check[결과 조회 · CS 처리]
    check -.->|결과 확인| result
```

### 취소·환불

```mermaid
flowchart TD
    cancelRequest[결제 후 취소 요청] --> cancelCheck{취소 가능한가}
    cancelCheck -->|가능| cancel[주문 취소 · 결제 취소 요청]
    cancelCheck -->|불가| guidance[사유 · 가능한 절차 안내]
    cancel --> refund[환불 결과 확인]
```

### 반품·환불

```mermaid
flowchart TD
    returnRequest[반품 요청] --> returnCheck{반품 가능한가}
    returnCheck -->|가능| returned[상품 회수 · 검수]
    returnCheck -->|불가| guidance[사유 · 가능한 절차 안내]
    returned --> refundDecision{환불 가능한가}
    refundDecision -->|가능| refundRequest[환불 요청]
    refundDecision -->|불가| guidance
    refundRequest --> refund[환불 결과 확인]
```

### 교환 — 제안

```mermaid
flowchart TD
    exchangeRequest[교환 요청] --> exchangeCheck{교환 가능한가}
    exchangeCheck -->|가능| exchange[상품 회수 · 검수 · 교환품 확보]
    exchangeCheck -->|불가| guidance[사유 · 가능한 절차 안내]
    exchange --> exchangeDecision{교환을 진행할 수 있는가}
    exchangeDecision -->|가능| reship[교환품 출고 · 배송]
    exchangeDecision -->|불가| guidance
```

부분 취소·부분 반품도 포함한다. 취소 가능 시점, 회수·검수 순서, 할인·배송비·환불액 계산과 교환 조건은 요구사항에서 정한다.
