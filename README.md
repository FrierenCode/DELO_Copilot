# Creator Deal Copilot

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Data-3ecf8e)

브랜드 협업 문의를 붙여 넣으면 계약 전달 조건을 구조화하고, 빠진 항목을 체크하고, 견적 가이드를 만들고, 답장 초안까지 생성하는 크리에이터 협업 운영 코파일럿입니다.

이 프로젝트는 단순한 "문의 파서"가 아니라 1인 크리에이터가 협업 운영에서 반복적으로 겪는 실무 부담을 줄이기 위한 운영 SaaS를 목표로 합니다.

## 왜 만들고 있나

크리에이터 협업 운영은 생각보다 반복적이고 동시에 실수 비용이 큽니다.

- 문의 내용은 이메일, DM, 카카오톡, 브랜드 브리프 등 제각각이라 매번 정리부터 오래 걸립니다.
- 사용권, 독점권, 수정 횟수, 지급 조건 같은 전달 핵심 항목은 빠지기 쉽습니다.
- 견적을 감으로 제시하다 보면 과소청구 또는 협상 실패가 반복됩니다.
- 답장 문구를 매번 새로 쓰더라도 중요한 조건 확인 문장은 비슷해집니다.

PRD v2.0 기준에서 이 제품은 "만들 수 있는 제품"이 아니라 "써야 하는 운영 SaaS"가 되려면 ICP 적합성, 견적 흐름, 운영 대시보드, Pro 전환 명분이 분명해야 한다는 전제를 깔고 있습니다.

## 타겟 고객 ICP

현재 PRD 기준 타겟 고객은 아래와 같습니다.

- 팔로워 5만~15만 규모의 크리에이터
- 월 2~5건 이상 협업 문의를 직접 운영하는 1인 실무자
- 매니저 없이 본인이 견적, 답장, 일정, 조건 확인을 모두 처리하는 사용자

즉 "협업이 아예 없는 초보"보다 "이미 협업은 들어오지만 운영이 비효율적인 사용자"를 직접적인 타겟으로 둡니다.

## 제품이 해결하려는 문제

- 문의를 읽고 전달 조건을 수작업으로 정리하는 시간 낭비
- 빈칸 있는 계약 조건과 협업 리스크
- 일관성 없는 견적 제안과 협상 메시지
- 저장하지 않으면 사라지는 운영 히스토리
- 놓치면 바로 매출 손실로 이어지는 후속 관리 누락

## 현재 구현 범위

지금 저장소에는 아래 기능이 기준선으로 구현되어 있습니다.

- 문의 원문을 구조화된 필드로 파싱하는 API
- 누락된 계약 조건을 표시하는 체크 엔진
- 크리에이터 기본 프로필 기반 견적 계산 엔진
- 톤별 답장 초안 생성
- OpenAI, Google, Anthropic을 위한 LLM 클라이언트 추상화
- Supabase 기반 딜, 체크, 답장 초안, 상태 로그, 사용량 이벤트 저장
- Free/Pro 사용량 제한과 알림 기능 게이트
- PostHog 이벤트 추적과 Sentry 오류 보고
- Next.js App Router 기반 API와 기본 랜딩 페이지
- OpenNext + Cloudflare Workers 배포 설정

현재 노출된 주요 엔드포인트:

- `GET /api/health`
- `POST /api/inquiries/parse`
- `GET /api/deals`
- `POST /api/deals`

입력 예시:

```json
{
  "raw_text": "안녕하세요. Example Brand에서 인스타그램 릴스 1건 협업 제안드립니다.",
  "source_type": "email"
}
```

응답에는 아래 항목이 포함됩니다.

- `parsed_json`
- `quote_breakdown`
- `checks`
- `missing_fields`
- `reply_drafts`

## PRD 기준 MVP 정의

PRD v2.0 기준 MVP는 단순 생성형 기능 묶음이 아니라 협업 인입부터 저장까지 이어지는 운영 흐름을 가져야 합니다.

협업 흐름:

1. 사용자가 문의를 붙여 넣는다.
2. 시스템이 문의를 구조화한다.
3. 빈칸 항목과 리스크를 보여준다.
4. 견적 범위와 설명 근거를 제시한다.
5. 바로 보낼 수 있는 답장 초안을 만든다.
6. 저장 건으로 전환하고 이후 운영 보드로 이어진다.

PRD에서 특히 강조하는 포인트:

- 견적은 단순 숫자가 아니라 설명 가능한 구조여야 함
- 체크 결과는 "법률 문서"보다 "운영 체크리스트"에 가까워야 함
- 최종적으로는 Intake Workspace와 Deals Dashboard가 연결되어야 함

## 주요 기능

### 1. 문의 파싱

이메일, DM 등 비정형 텍스트에서 아래와 같은 정보를 추출하는 흐름을 다룹니다.

- 브랜드명
- 연락 담당자
- 플랫폼
- 납품물
- 일정
- 보상 방식
- 예산 언급
- 사용권
- 독점권
- 수정 횟수
- 지급 조건

현재 구현 메모:

- 파싱은 LLM 기반으로 동작하며 provider fallback 구조를 가집니다.
- 응답이 비어 있거나 JSON 코드 펜스로 감싸졌거나 스키마 검증에 실패하는 경우를 별도로 처리합니다.
- 파싱 결과는 Zod 스키마 검증을 거칩니다.

### 2. 체크 엔진

계약과 운영의 중요한 항목이 비어 있거나 불명확하면 체크 항목으로 알립니다.

예시:

- 지급 조건 누락
- 사용권 누락
- 독점권 불명확
- 수정 횟수 누락
- 일정 누락

### 3. 견적 엔진

크리에이터 기본 프로필과 문의 내용을 기반으로 아래 값을 계산합니다.

- `floor`
- `target`
- `premium`

또한 PRD 방향에 맞게, 왜 이런 가격이 나오는지 설명 가능한 구조를 유지하는 것이 중요합니다.

### 4. 답장 초안 생성

현재는 템플릿 기반 응답과 LLM 기반 초안 생성을 함께 사용합니다.

- 정중한 답장
- 빠른 회신용 답장
- 협상용 답장

추가 구현 메모:

- 협상용 답장은 LLM을 우선 사용합니다.
- LLM 응답이 비어 있거나 실패하면 템플릿 기반 협상 답장으로 fallback 합니다.

### 5. LLM 라우팅 설계

향후 프로젝트 안정성과 비용/성능 조절을 위해 멀티 프로바이더 구조를 채택하고 있습니다.

- 문의 파싱: Gemini 우선, GPT 보조
- 협상 답장: GPT 우선, Claude 보조

### 6. 저장소 및 운영 설계

현재 단계에서 아래 서버 구성이 추가되어 있습니다.

- `POST /api/deals`를 통한 딜 저장
- `GET /api/deals`를 통한 내 딜 목록 및 알림 집계 조회
- `repositories/` 계층을 통한 DB 접근 분리
- `services/deal-service.ts`를 통한 서버 측 payload 조합
- `services/usage-guard.ts`를 통한 Free/Pro 제한 적용
- `services/alert-engine.ts`를 통한 후속 관리 알림 집계

## 기술 스택

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod
- Supabase
- OpenAI SDK
- Google Generative AI SDK
- Anthropic SDK
- Sentry
- PostHog
- OpenNext
- Cloudflare Workers

## 프로젝트 구조

```text
app/
  api/
    deals/
    health/
    inquiries/parse/
components/
lib/
  analytics.ts
  llm/
  logger.ts
  sentry.ts
  supabase/
repositories/
services/
  alert-engine.ts
  auth-service.ts
  check-engine.ts
  deal-service.ts
  parse-service.ts
  parse-llm-service.ts
  quote-engine.ts
  reply-generator.ts
  reply-routing-service.ts
  reply-template-service.ts
  status-transition.ts
  usage-guard.ts
supabase/
  migrations/
tests/
  parse-dataset/
types/
```

구조 역할:

- `parse-service`: 문의 원문을 구조화된 필드로 변환
- `check-engine`: 누락/리스크 항목 계산
- `quote-engine`: 견적 하한, 목표, 프리미엄 계산
- `reply-generator`: 답장 전략 선택 및 초안 생성
- `deal-service`: 파싱 결과를 저장용 payload로 조합
- `repositories`: 딜, 체크, 답장 초안, 상태 로그 저장 계층
- `usage-guard`: 플랜별 사용량 제한 처리
- `alert-engine`: 후속 관리 알림 수치 계산
- `lib/llm`: 모델/프로바이더 추상화 계층

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 환경 변수

`.env.example`를 참고해 `.env.local`을 생성하세요.

현재 필수:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

실제 LLM 연동 시 선택:

```env
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ANTHROPIC_API_KEY=
```

관측 도구 연동 시 선택:

```env
SENTRY_DSN=
POSTHOG_API_KEY=
```

보안 주의:

- 실제 키는 `README.md`와 `.env.example`에 넣지 않습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용으로 관리해야 합니다.
- 배포 환경에서는 플랫폼의 Secret 저장소를 사용해야 합니다.

## API

### `GET /api/health`

서버 상태를 확인하는 헬스체크 엔드포인트입니다.

### `POST /api/inquiries/parse`

문의 원문을 넣으면 구조화 결과, 견적 가이드, 체크 항목, 답장 초안을 반환합니다.

요청 바디:

```json
{
  "raw_text": "안녕하세요. 릴스 1건과 스토리 3건 협업 가능 여부를 문의드립니다.",
  "source_type": "email"
}
```

`source_type` 지원값:

- `email`
- `dm`
- `other`

### `GET /api/deals`

인증된 사용자의 저장된 딜과 알림 요약을 반환합니다. Free 플랜에서는 알림 집계가 비활성화될 수 있습니다.

알림 필드:

- `overdue_followups`
- `payment_overdue`
- `deadline_soon`
- `unresolved_checks`

### `POST /api/deals`

인증된 사용자의 문의를 저장 가능한 딜 단위로 변환하고 관련 체크/답장 초안까지 함께 저장합니다.

요청 바디:

```json
{
  "raw_text": "안녕하세요. 숏폼 영상 1건 제작 가능 여부를 문의드립니다.",
  "source_type": "dm",
  "selected_reply_tone": "negotiation"
}
```

선택 필드:

- `parsed_json`
- `selected_reply_tone`

`parsed_json`은 프론트엔드가 보내더라도 서버에서 다시 검증합니다.

## 배포

Cloudflare Workers 배포를 위한 OpenNext 설정이 포함되어 있습니다.

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

관련 파일:

- `open-next.config.ts`
- `wrangler.toml`
- `.cloudflareignore`

## 데이터베이스

`supabase/migrations/001_create_deal_tables.sql`에는 아래 테이블과 정책이 정의되어 있습니다.

- `deals`
- `deal_checks`
- `deal_status_logs`
- `reply_drafts`
- `user_plans`
- `usage_events`

또한 기본 인덱스, `updated_at` 트리거, Row Level Security 정책이 포함되어 있습니다.

## PRD 기반 개발 우선순위

PRD v2.0 문서 기준 개발 우선순위는 아래 흐름을 따릅니다.

1. Next.js 15 + TypeScript + Tailwind + shadcn/ui 기반 정비
2. Supabase Auth + PostgreSQL 스키마 확장
3. 사용량 제한과 `user_plans` 기반 Free/Pro 기초
4. Inquiry Paste 화면과 Parse API 연결
5. LLM 기반 JSON 추출 안정화
6. 견적 엔진과 체크 엔진 고도화
7. Reply Draft Generator와 Intake Workspace 연결
8. Deal 저장과 운영 알림 로직 추가
9. Deals Dashboard UI 구현
10. Billing, Analytics, Sentry, QA, 배포 정리

## 현재 상태와 다음 단계

현재 상태는 "문의 파싱 + 저장 API 기반"까지 이어진 백엔드 중심 MVP입니다. 이번 업데이트 기준으로 아래 항목은 이미 반영되어 있습니다.

- Supabase 마이그레이션과 저장소 계층
- 딜 저장, 체크 저장, 답장 초안 저장
- 플랜별 사용량 제한과 알림 게이트
- Sentry, PostHog, 구조화 로그 기반 운영 관측
- Cloudflare Workers 배포 설정

아직 필요한 영역:

- 실제 사용자 인증 흐름과 크리에이터 프로필 연결
- Deals Dashboard UI
- 알림 이후 후속 운영 자동화
- Billing과 Pro 플랜 정책 구체화
- 테스트 자동화와 운영 검증 강화

## GTM 관련 메모

PRD 기준 초기 GTM은 광범위한 퍼널보다 문제 강도가 높은 커뮤니티 중심 접근이 더 적합합니다.

- 소형 크리에이터 커뮤니티
- Reddit 등 해외 크리에이터 실무 커뮤니티

즉 이 README 역시 "AI 도구"보다 "크리에이터 협업 운영의 반복 업무를 줄이는 운영 도구"라는 포지셔닝을 우선합니다.

## 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

## 문서 기준

이 README는 `creator_deal_copilot_prd_v2.docx` 방향과 현재 코드베이스 구현 상태를 함께 반영해 정리했습니다.

특히 아래 원칙을 중심으로 정리했습니다.

- ICP를 명확히 좁혀 두기
- 단순 AI 도구가 아니라 운영 SaaS로 설명하기
- 견적 흐름과 운영 대시보드를 핵심 가치로 보기
- 현재 구현 범위와 이후 확장 범위를 분리하기

## 라이선스

현재 비공개 프로젝트입니다.
