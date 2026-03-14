# Creator Deal Copilot

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Data-3ecf8e)

브랜드 협업 문의를 붙여 넣으면 계약 판단에 필요한 조건을 구조화하고, 빈칸을 체크하고, 견적 가이드를 만들고, 답장 초안까지 생성하는 크리에이터 업무 운영 도구입니다.

이 프로젝트는 단순한 "문의 파서"가 아니라 1인 크리에이터가 반복적으로 겪는 운영 부담을 줄이기 위한 운영 SaaS를 목표로 합니다.

## 왜 만드는가

크리에이터 협업 운영은 창작보다 반복적이고 운영적인 비용이 큽니다.

- 문의는 이메일, DM, 카카오톡, 브랜드 브리프 등 형식이 제각각이라 매번 다시 정리해야 합니다.
- 사용권, 독점권, 수정 횟수, 지급 조건 같은 계약 핵심 항목은 자주 비어 있습니다.
- 견적을 감으로 제시하면 과소 청구나 협상 실패가 반복됩니다.
- 답장 문구를 매번 새로 쓰다 보면 중요한 조건 확인 문장을 빠뜨리기 쉽습니다.
- 후속 액션과 결제 추적이 끊기면 실제 매출 손실로 이어집니다.

PRD v2 기준에서 이 제품은 "AI가 한번 도와주는 툴"이 아니라 "문의부터 저장, 후속 관리까지 이어지는 운영 시스템"을 지향합니다.

## 타겟 고객 ICP

현재 PRD 기준 타겟 고객은 아래와 같습니다.

- 팔로워 5만~15만 규모의 크리에이터
- 월 2~5건 이상 브랜드 협업 문의를 직접 처리하는 1인 운영자
- 매니저 없이 견적, 답장, 일정, 조건 확인을 직접 처리하는 사용자

즉, "아직 협업 경험이 거의 없는 초보"보다 "이미 협업은 들어오지만 운영이 비효율적인 사용자"를 직접 고객으로 둡니다.

## 제품이 해결하려는 문제

- 문의를 읽고 계약 조건을 수작업으로 정리하는 시간 낭비
- 빈칸 있는 계약 조건과 작업 리스크 누락
- 일관성 없는 견적 제안과 협상 메시지 작성
- 저장되지 않으면 사라지는 운영 히스토리
- 후속 관리 누락으로 생기는 일정/입금 리스크

## 현재 구현 범위

지금 저장소에는 아래 기능이 실제 코드로 구현되어 있습니다.

- 문의 원문을 구조화된 필드로 파싱하는 API
- 문의 텍스트 정리(sanitize), 해시 생성, 중복 문의 캐시/중복 제거
- 누락 조건과 리스크를 요약하는 체크 엔진
- 크리에이터 프로필 기반 견적 계산 엔진
- 템플릿 기반 답장 초안 생성
- Pro 플랜 전용 협상형 AI 답장 API
- 문의 저장, 딜 저장, 답장 초안 저장을 위한 Supabase 저장소 계층
- Free/Pro 플랜 정책, 사용량 제한, paywall 이벤트 추적
- PostHog 이벤트 추적, Sentry 연동, 구조화 로그
- Next.js App Router 기반 API와 최소 홈 화면
- OpenNext + Cloudflare Workers 배포 설정
- Vitest 기반 서비스/정책/유틸 테스트

현재 노출된 주요 API 엔드포인트는 아래와 같습니다.

- `GET /api/health`
- `POST /api/inquiries/parse`
- `GET /api/deals`
- `POST /api/deals`
- `POST /api/replies/negotiation-ai`

입력 예시:

```json
{
  "raw_text": "안녕하세요. Example Brand에서 인스타그램 릴스 1건 협업 제안을 드립니다.",
  "source_type": "email"
}
```

`POST /api/inquiries/parse` 응답에는 아래 항목이 포함됩니다.

- `inquiry_id`
- `parsed_json`
- `quote_breakdown`
- `checks`
- `missing_fields`
- `reply_drafts`
- `reply_meta`

## PRD 기준 MVP 정의

PRD v2 기준 MVP는 단순 생성 기능 묶음이 아니라, 협업 인입부터 저장과 후속 관리까지 이어지는 운영 흐름을 가져야 합니다.

작업 흐름:

1. 사용자가 문의를 붙여 넣는다.
2. 시스템이 문의를 구조화한다.
3. 빈칸 항목과 리스크를 보여준다.
4. 견적 범위와 설명 근거를 제시한다.
5. 바로 보낼 수 있는 답장 초안을 만든다.
6. 필요하면 딜로 저장하고 이후 운영 보드로 이어진다.

PRD에서 특히 강조하는 포인트는 아래와 같습니다.

- 견적은 단순 숫자가 아니라 설명 가능한 구조여야 함
- 체크 결과는 법률 문서가 아니라 운영 체크리스트에 가까워야 함
- 최종적으로는 Intake Workspace와 Deals Dashboard가 연결되어야 함

## 주요 기능

### 1. 문의 파싱

이메일, DM 등 비정형 텍스트에서 아래 정보를 추출합니다.

- 브랜드명
- 연락 담당자
- 플랫폼
- 산출물
- 일정
- 보상 방식
- 예산 언급
- 사용권
- 독점권
- 수정 횟수
- 지급 조건

현재 구현 메모:

- 파싱 전 `sanitizeRawText`로 서명, 인용 답장, footer, bare link 라인을 제거합니다.
- 정리된 텍스트와 `source_type`, 프롬프트 버전을 합쳐 SHA-256 해시를 생성합니다.
- 동일 해시가 `inquiries` 테이블에 있으면 LLM 호출 없이 기존 결과를 재사용합니다.
- 캐시 미스일 때만 LLM을 호출하고, 결과를 `inquiries`와 `parse_cache`에 저장합니다.
- 파싱 결과는 Zod 스키마와 서비스 레벨 검증을 거칩니다.

### 2. 체크 엔진

계약과 운영에 중요한 항목이 비어 있거나 불명확하면 체크 항목으로 반환합니다.

예시:

- 지급 조건 누락
- 사용권 누락
- 독점권 불명확
- 수정 횟수 누락
- 일정 누락

Free 플랜은 parse 응답에서 체크 목록이 비활성화되고, Pro 플랜은 전체 체크 목록을 제공합니다.

### 3. 견적 엔진

크리에이터 기본 프로필과 문의 내용을 바탕으로 아래 값을 계산합니다.

- `floor`
- `target`
- `premium`

또한 숫자만 반환하지 않고 설명 텍스트를 함께 제공합니다. Free 플랜은 간단한 요약값만, Pro 플랜은 전체 breakdown을 받습니다.

### 4. 답장 초안 생성

기본 parse 응답에서는 결정론적 템플릿 기반 초안을 생성합니다.

- `polite`
- `quick`
- `negotiation`

현재 구현 메모:

- Free 플랜은 `polite` 초안만 반환합니다.
- Pro 플랜은 `polite`, `quick`, `negotiation` 초안을 모두 반환합니다.
- parse 응답의 `negotiation` 초안은 템플릿 기반 fallback 초안입니다.
- 실제 LLM 기반 협상 답장은 별도 `POST /api/replies/negotiation-ai` 엔드포인트에서 on-demand로 생성합니다.

### 5. 협상형 AI 답장 엔드포인트

`POST /api/replies/negotiation-ai`는 Pro 플랜 사용자를 위한 별도 기능입니다.

- 인증된 사용자만 호출할 수 있습니다.
- `checkUsageLimit`로 월간 협상 AI 사용량을 제한합니다.
- `checkLlmBudget`로 시스템 일일 LLM 예산을 초과하면 일시적으로 차단합니다.
- `deal_id`가 함께 오면 생성된 답장을 `reply_drafts`에 저장합니다.
- LLM 실패 시 템플릿 기반 협상 답장으로 fallback 합니다.

### 6. LLM 라우팅 설계

여러 모델을 추상화한 클라이언트 팩토리를 두고, 작업별 기본 모델 정책을 분리해 두었습니다.

- 문의 파싱: 기본 `Google Gemini`, fallback 가능
- 협상 답장: 기본 `OpenAI`, 대체 provider 확장 가능

### 7. 저장소 및 운영 설계

현재 단계에서 아래 서버 구성이 포함되어 있습니다.

- `POST /api/deals`를 통한 딜 저장
- `GET /api/deals`를 통한 딜 목록 및 alert 집계 조회
- `repositories/` 계층을 통한 DB 접근 분리
- `services/deal-service.ts`를 통한 딜 payload 조합
- `services/usage-guard.ts`를 통한 Free/Pro 사용량 제한
- `services/alert-engine.ts`를 통한 후속 관리 alert 계산
- 문의 원본의 canonical record를 위한 `inquiries` 테이블
- 비용 최적화를 위한 `parse_cache` 보조 테이블

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
- Vitest
- OpenNext
- Cloudflare Workers

## 프로젝트 구조

```text
app/
  api/
    deals/
    health/
    inquiries/parse/
    replies/negotiation-ai/
components/
lib/
  analytics.ts
  api-response.ts
  inquiry/
  llm/
  logger.ts
  plan-policy.ts
  sentry.ts
  supabase/
repositories/
services/
  alert-engine.ts
  auth-service.ts
  check-engine.ts
  deal-service.ts
  llm-budget-guard.ts
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
__tests__/
tests/
  parse-dataset/
types/
```

구조별 역할:

- `parse-service`: 문의 원문을 구조화된 필드로 변환하고 canonical inquiry를 저장
- `check-engine`: 누락/리스크 항목 계산
- `quote-engine`: 견적 하한, 목표, 프리미엄 계산
- `reply-generator`: 플랜 정책에 따라 템플릿 답장 초안 생성
- `llm-budget-guard`: 일일 LLM 호출량 기반 budget guard
- `deal-service`: 파싱 결과를 딜 저장 payload로 조합
- `repositories`: 문의, 딜, 체크, 답장 초안, 상태 로그 접근 계층
- `usage-guard`: 플랜별 기능 게이트와 사용량 제한 처리
- `alert-engine`: 후속 관리 알림 수치 계산
- `lib/llm`: 모델/프로바이더 추상화와 프롬프트 관리

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

현재 홈 화면은 제품 UI 완성본이 아니라 API 및 인프라 스캐폴드 상태를 보여주는 최소 페이지입니다.

## 환경 변수

`.env.local` 파일에 아래 값을 설정해야 합니다.

필수:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

선택 LLM 연동:

```env
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ANTHROPIC_API_KEY=
```

선택 관측 도구:

```env
SENTRY_DSN=
POSTHOG_API_KEY=
```

보안 주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 비밀값으로 관리해야 합니다.
- 실제 배포 환경에서는 Cloudflare 또는 호스팅 플랫폼의 Secret 저장소를 사용해야 합니다.
- `POSTHOG_API_KEY`와 각 LLM API 키도 클라이언트로 노출되면 안 됩니다.

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

응답 특징:

- 인증 사용자는 월간 parse 제한이 적용됩니다.
- 비인증 사용자는 free 정책으로 처리됩니다.
- Free 플랜은 간략 견적과 제한된 답장만 받습니다.
- Pro 플랜은 전체 체크 목록, 전체 견적 breakdown, 추가 답장 tone을 받습니다.

### `GET /api/deals`

인증된 사용자의 저장된 딜 목록과 알림 요약을 반환합니다.

알림 필드:

- `overdue_followups`
- `payment_overdue`
- `deadline_soon`
- `unresolved_checks`

Free 플랜은 alert 기능이 차단되고, 응답에는 0값 요약이 반환됩니다.

### `POST /api/deals`

문의 또는 기존 `inquiry_id`를 기반으로 딜을 저장합니다.

요청 바디 예시:

```json
{
  "inquiry_id": "00000000-0000-0000-0000-000000000000",
  "selected_reply_tone": "negotiation"
}
```

또는 legacy 경로:

```json
{
  "raw_text": "안녕하세요. 유튜브 쇼츠 1건 협업 가능 여부를 문의드립니다.",
  "source_type": "dm",
  "selected_reply_tone": "polite"
}
```

특징:

- `inquiry_id` 경로가 우선이며, 이 경우 재파싱 비용이 없습니다.
- `raw_text + source_type` 경로는 fallback 경로이며 parse quota를 사용합니다.
- 저장 시 deal, deal_checks, reply_drafts가 함께 생성됩니다.

### `POST /api/replies/negotiation-ai`

Pro 플랜 전용 협상 답장 생성 엔드포인트입니다.

요청 바디 예시:

```json
{
  "inquiry_id": "00000000-0000-0000-0000-000000000000",
  "deal_id": "00000000-0000-0000-0000-000000000000",
  "quote_target": 450000,
  "missing_fields": ["usage_rights", "payment_terms"]
}
```

특징:

- 인증 필수
- Pro 플랜 기능 게이트 적용
- 월간 협상 AI 호출량 제한 적용
- 시스템 일일 LLM 예산 초과 시 503 차단
- 실패 시 템플릿 답장 fallback

## 배포

Cloudflare Workers 배포를 위한 OpenNext 설정이 포함되어 있습니다.

```bash
npm run build
npm run preview
npm run deploy
```

관련 파일:

- `open-next.config.ts`
- `wrangler.toml`
- `wrangler.jsonc`
- `scripts/patch-opennext-helper.mjs`

## 데이터베이스

`supabase/migrations/001_create_deal_tables.sql`과 `supabase/migrations/002_add_inquiries_table.sql`에는 아래 구조가 정의되어 있습니다.

- `deals`
- `deal_checks`
- `deal_status_logs`
- `reply_drafts`
- `user_plans`
- `usage_events`
- `inquiries`
- `parse_cache`

주요 특징:

- `deals`, `reply_drafts`, `deal_checks` 등은 RLS 정책이 포함됩니다.
- `inquiries`는 canonical parse record 역할을 합니다.
- `parse_cache`는 비용 최적화를 위한 보조 캐시로, source of truth는 아닙니다.
- `usage_events.meta` 컬럼은 LLM budget tracking에도 사용됩니다.

## PRD 기반 개발 우선순위

PRD v2 문서 기준 개발 우선순위는 아래 흐름과 맞물려 있습니다.

1. Next.js 15 + TypeScript + Tailwind + shadcn/ui 기반 정비
2. Supabase Auth + PostgreSQL 스키마 확장
3. `user_plans` 기반 Free/Pro 플랜 정책
4. Inquiry Paste 화면과 Parse API 연결
5. LLM 기반 JSON 추출 안정화
6. 견적 엔진과 체크 엔진 고도화
7. Reply Draft Generator와 Intake Workspace 연결
8. Deal 저장과 운영 알림 로직 추가
9. Deals Dashboard UI 구현
10. Billing, Analytics, Sentry, QA, 배포 정리

## 현재 상태와 다음 단계

현재 상태는 "문의 파싱 + 저장 API + 플랜 게이트 + 운영 저장소"까지 연결된 백엔드 중심 MVP입니다.

이미 반영된 내용:

- Supabase 마이그레이션과 저장소 계층
- 문의 canonical 저장과 parse dedup/cache
- 딜 저장, 체크 저장, 답장 초안 저장
- 플랜별 사용량 제한과 기능 게이트
- PostHog, Sentry, 구조화 로그 기반 관측
- Cloudflare Workers 배포 설정
- 핵심 서비스 단위 테스트

아직 필요한 영역:

- 실제 사용자용 Intake Workspace UI
- Deals Dashboard UI 완성
- 결제/Billing 및 Pro 전환 플로우
- 후속 액션 자동화와 상태 전이 UI
- E2E 테스트와 운영 검증 강화

## GTM 관련 메모

초기 GTM은 범용 AI 도구 포지셔닝보다 "크리에이터 협업 운영을 줄여주는 도구"라는 메시지에 더 가깝습니다.

- 인스타그램/유튜브 기반 크리에이터 커뮤니티
- 브랜드 협업을 직접 관리하는 1인 크리에이터
- 에이전시 없이 운영하는 중간 규모 계정

즉 README와 제품 설명 모두 "AI 툴"보다 "반복 운영 업무를 줄이는 운영 소프트웨어"라는 프레이밍이 적합합니다.

## 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run preview
npm run deploy
```

## 문서 기준

이 README는 현재 소스코드 구현 상태와 PRD 방향을 함께 반영해 정리했습니다.

특히 아래 관점을 기준으로 문서를 갱신했습니다.

- 문의 파서가 아니라 운영 SaaS라는 제품 정의
- parse cache, inquiries, deal 저장 흐름을 반영한 백엔드 구조
- Free/Pro 플랜 정책과 협상 AI 분리 엔드포인트 반영
- 현재 구현 범위와 이후 확장 범위 분리

## 라이선스

현재 비공개 프로젝트입니다.
