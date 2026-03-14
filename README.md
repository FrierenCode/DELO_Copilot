# Creator Deal Copilot

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Data-3ecf8e)

브랜드 협업 문의를 붙여 넣으면 계약 판단에 필요한 조건을 구조화하고, 누락 항목을 체크하고, 견적 가이드를 만들고, 답장 초안까지 생성하는 크리에이터 운영 보조 SaaS입니다.

이 프로젝트는 단순한 "문의 파서"가 아니라 1인 크리에이터가 반복적으로 겪는 운영 부담을 줄이기 위한 운영 워크스페이스를 목표로 합니다.

## 왜 만드는가

크리에이터 협업 운영은 창작보다 반복적이고 운영적인 비용이 큽니다.

- 문의는 이메일, DM, 카카오톡, 브랜드 브리프 등 형식이 제각각이라 매번 다시 정리해야 합니다.
- 사용권, 독점권, 수정 횟수, 지급 조건 같은 계약 핵심 항목이 자주 비어 있습니다.
- 견적을 감으로 제시하면 과소 청구나 협상 실패가 반복됩니다.
- 답장 문구를 매번 새로 쓰다 보면 중요한 조건 확인 문장을 빠뜨리기 쉽습니다.
- 후속 액션과 결제 추적이 끊기면 실제 매출 손실로 이어집니다.

PRD v2 기준에서 이 제품은 "AI가 한번 도와주는 툴"이 아니라 문의 접수부터 후속 관리까지 이어지는 운영 시스템입니다.

## 타겟 고객 ICP

현재 PRD 기준 타겟 고객은 아래와 같습니다.

- 팔로워 5만~15만 규모의 크리에이터
- 월 2~5건 이상 브랜드 협업 문의를 직접 처리하는 1인 운영자
- 매니저 없이 견적, 답장, 일정, 조건 확인을 직접 처리하는 사용자

즉 "아직 협업 경험이 거의 없는 초보"보다는 "이미 협업은 들어오지만 운영이 비효율적인 사용자"를 직접 고객으로 둡니다.

## 제품이 해결하려는 문제

- 문의를 읽고 계약 조건을 수작업으로 정리하는 시간 낭비
- 빈칸 있는 계약 조건과 작업 리스크 파악 누락
- 일관성 없는 견적 제안과 협상 메시지 작성
- 저장되지 않으면 사라지는 운영 히스토리
- 후속 관리 누락으로 생기는 일정/입금 리스크

## 현재 구현 범위

현재 저장소에는 아래 기능이 실제 코드로 구현되어 있습니다.

- 문의 텍스트를 구조화된 필드로 파싱하는 API
- 문의 텍스트 정리, 해시 생성, 중복 문의 캐시 및 사용자별 중복 제거
- 계약 조건 누락/리스크를 요약하는 체크 엔진
- 크리에이터 프로필 기반 견적 계산 엔진
- 템플릿 기반 답장 초안 생성
- Pro 플랜 전용 Negotiation AI API
- 문의, 딜, 체크, 답장 초안, 프로필을 위한 Supabase 저장소 계층
- Free/Pro 플랜 정책, 사용량 제한, paywall 이벤트 추적
- PostHog 이벤트 추적, Sentry 연동, 구조화 로그
- Next.js App Router 기반 API
- OpenNext + Cloudflare Workers 배포
- Vitest 기반 단위 테스트

현재 노출된 주요 API 라우트는 아래와 같습니다.

- `GET /api/health`
- `POST /api/inquiries/parse`
- `GET /api/deals`
- `POST /api/deals`
- `GET /api/deals/[id]`
- `PATCH /api/deals/[id]`
- `GET /api/deals/alerts`
- `GET /api/creator-profile`
- `POST /api/creator-profile`
- `PUT /api/creator-profile`
- `POST /api/replies/negotiation-ai`

입력 예시:

```json
{
  "raw_text": "Hi, we'd love to collaborate on an Instagram Reel. Please share your rate and availability.",
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

PRD v2 기준 MVP는 단순 생성 기능 묶음이 아니라 작업 유입부터 저장과 후속 관리까지 이어지는 운영 흐름을 가져야 합니다.

작업 흐름:

1. 사용자가 문의를 붙여 넣는다.
2. 시스템이 문의를 구조화한다.
3. 빈칸 항목과 리스크를 보여준다.
4. 견적 범위와 설명 근거를 제시한다.
5. 바로 보낼 수 있는 답장 초안을 만든다.
6. 필요하면 딜로 저장하고 이후 운영 보드로 이어진다.

PRD에서 특히 강조하는 사항은 아래와 같습니다.

- 견적은 단순 숫자가 아니라 설명 가능한 구조여야 함
- 체크 결과는 법률 문서가 아니라 운영 체크리스트에 가까워야 함
- 최종적으로는 Intake Workspace와 Deals Dashboard가 연결되어야 함

## 주요 기능

### 1. 문의 파싱

이메일, DM 등 비정형 텍스트에서 아래 정보를 추출합니다.

- 브랜드명
- 연락 담당자
- 연락 채널
- 요청 플랫폼
- 요청 산출물
- 일정
- 보상 방식
- 예산 언급
- 사용권
- 독점권
- 수정 횟수
- 지급 조건

현재 구현 메모:

- `sanitizeRawText`로 서명, 인용 답장, footer, bare link 라인을 제거합니다.
- 정리된 텍스트와 `source_type`, 프롬프트 버전으로 SHA-256 해시를 생성합니다.
- 동일 해시가 사용자의 `inquiries`에 있으면 LLM 호출 없이 기존 결과를 재사용합니다.
- 사용자 스코프 캐시 미스 시 전역 `parse_cache`를 조회합니다.
- 전역 `parse_cache` hit 시 현재 요청용 canonical `inquiry` 레코드를 새로 만들고, LLM은 다시 호출하지 않습니다.
- 두 캐시가 모두 미스면 LLM을 호출하고 결과를 `inquiries`와 `parse_cache`에 기록합니다.
- 파싱 결과는 `inquirySchema`로 검증합니다.
- 최근 변경으로 파싱 실패는 `PROVIDER_CONFIG_ERROR`, `PROVIDER_REQUEST_FAILED`, `PROVIDER_RESPONSE_INVALID`, `PARSE_SCHEMA_INVALID`, `PARSE_CACHE_ERROR`, `INQUIRY_PERSIST_FAILED`, `PARSE_FAILED`로 구분됩니다.

### 2. 체크 엔진

계약과 운영상 중요한 항목이 비어 있거나 불명확하면 체크 항목으로 반환합니다.

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

숫자만 반환하지 않고 설명 텍스트도 함께 제공합니다. Free 플랜은 축약 견적만, Pro 플랜은 전체 breakdown을 받습니다.

### 4. 답장 초안 생성

기본 parse 응답에서 템플릿 기반 초안을 생성합니다.

- `polite`
- `quick`
- `negotiation`

현재 구현 메모:

- Free 플랜은 `polite` 초안만 반환합니다.
- Pro 플랜은 `polite`, `quick`, `negotiation` 초안을 모두 반환합니다.
- parse 응답의 `negotiation` 초안은 템플릿 기반 fallback 초안입니다.
- 실제 LLM 기반 협상 답장은 별도 `POST /api/replies/negotiation-ai`에서 on-demand로 생성합니다.

### 5. Negotiation AI 답장

`POST /api/replies/negotiation-ai`는 Pro 플랜 전용 기능입니다.

- 인증 필수
- `checkUsageLimit`로 월간 사용량 제한 적용
- `checkLlmBudget`로 일일 예산 초과 시 503 차단
- `deal_id`가 있으면 생성 결과를 `reply_drafts`에 저장
- LLM 실패 시 템플릿 기반 협상 답장으로 fallback

### 6. LLM 라우팅

모델/프로바이더 추상화 레이어를 두고 작업별 기본 모델 정책을 분리했습니다.

- 문의 파싱: 기본 `gpt-4o-mini`, fallback `gemini-2.5-flash-lite`
- 협상 답장: 기본 `gpt-4o-mini`, fallback `claude-sonnet-4-6`

### 7. 저장소 및 운영 계층

현재 아래 서버 구성이 구현되어 있습니다.

- `POST /api/deals`를 통한 딜 생성
- `GET /api/deals`를 통한 딜 목록, status filter, alert 요약 조회
- `GET/PATCH /api/deals/[id]`를 통한 딜 상세 조회 및 상태/메모 수정
- `GET /api/deals/alerts`를 통한 운영 alert item 조회
- `GET/POST/PUT /api/creator-profile`을 통한 크리에이터 프로필 조회/저장
- `repositories/` 계층을 통한 DB 접근 분리
- `services/deal-service.ts`를 통한 딜 payload 조합
- `services/usage-guard.ts`를 통한 Free/Pro 사용량 제한
- `services/alert-engine.ts`를 통한 후속 관리 alert 계산
- 문의 원문 canonical record를 위한 `inquiries`
- 비용 최적화를 위한 `parse_cache`

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
    creator-profile/
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
  parse-error.ts
  plan-policy.ts
  sentry.ts
  supabase/
repositories/
schemas/
services/
  alert-engine.ts
  check-engine.ts
  deal-service.ts
  llm-budget-guard.ts
  parse-llm-service.ts
  parse-service.ts
  quote-engine.ts
  reply-generator.ts
  reply-template-service.ts
  status-transition.ts
  usage-guard.ts
supabase/
  migrations/
__tests__/
tests/
  parse-dataset/
types/
utils/
```

구조별 역할:

- `parse-service`: 문의 텍스트를 구조화하고 canonical inquiry를 생성
- `parse-llm-service`: 모델 선택, provider 호출, JSON 추출, 스키마 검증 담당
- `check-engine`: 누락/리스크 항목 계산
- `quote-engine`: 견적 하한, 목표, 프리미엄 계산
- `reply-generator`: 플랜 정책에 따라 답장 초안 생성
- `llm-budget-guard`: 일일 LLM 예산 차단
- `deal-service`: parse 결과를 딜 저장 payload로 조합
- `repositories`: inquiries, deals, checks, drafts, status logs, profiles 저장 계층
- `usage-guard`: 플랜별 사용량 제한 및 기능 gate 처리
- `alert-engine`: 후속 관리용 alert 계산
- `lib/llm`: 모델/프로바이더 추상화와 프롬프트 관리
- `lib/parse-error`: 파싱 실패를 안전한 코드와 진단 정보로 분류

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

현재 UI는 제품 완성본이 아니라 API와 백엔드 상태를 확인하기 위한 최소 페이지 수준입니다.

## 환경 변수

`.env.local`에 아래 값을 설정해야 합니다.

필수:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

LLM 연동:

```env
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ANTHROPIC_API_KEY=
```

관측/분석:

```env
SENTRY_DSN=
POSTHOG_API_KEY=
NEXT_PUBLIC_APP_URL=
```

보안 및 배포 메모:

- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`, `ANTHROPIC_API_KEY`, `POSTHOG_API_KEY`, `SENTRY_DSN`은 서버 전용 값으로 취급해야 합니다.
- Cloudflare Worker 런타임 값은 Dashboard의 `Settings > Variables & Secrets` 또는 Wrangler 설정으로 관리해야 합니다.
- 현재 `wrangler.jsonc`에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 `vars`에 정의되어 있습니다.
- Cloudflare UI에서 값을 수정한 뒤에는 재배포가 필요합니다.

## API

### `GET /api/health`

서버 상태를 확인하는 헬스 체크 엔드포인트입니다.

응답 예시:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### `POST /api/inquiries/parse`

문의 텍스트를 구조화된 결과, 견적 가이드, 체크 항목, 답장 초안으로 변환합니다.

요청 바디:

```json
{
  "raw_text": "Hi, we'd love to collaborate on an Instagram Reel. Please share your rate and availability.",
  "source_type": "email"
}
```

`source_type` 지원값:

- `email`
- `dm`
- `other`

응답 특징:

- 인증 사용자는 월간 parse 사용량 제한이 적용됩니다.
- 비인증 사용자는 free 정책으로 처리됩니다.
- Free 플랜은 요약 견적과 제한된 초안만 받습니다.
- Pro 플랜은 전체 checks, 전체 quote breakdown, 추가 답장 tone을 받습니다.
- 실패 시 구조화된 오류 코드가 반환됩니다.

### `GET /api/deals`

인증 사용자 기준 딜 목록과 alert 요약을 반환합니다.

지원 쿼리:

- `?status=Lead|Replied|Negotiating|Confirmed|Delivered|Paid|ClosedLost`

`alerts` 필드:

- `overdue_followups`
- `payment_overdue`
- `deadline_soon`
- `unresolved_checks`

Free 플랜은 alert 기능이 제한되며 count 0과 빈 `items`를 받습니다.

### `GET /api/deals/[id]`

딜 상세, 체크, 초안, 상태 로그를 반환합니다.

### `PATCH /api/deals/[id]`

딜 상태, 메모, 다음 액션, 일정 관련 필드를 수정합니다.

지원 필드:

- `status`
- `notes`
- `next_action`
- `next_action_due_at`
- `followup_needed`
- `deadline`
- `payment_due_date`

상태 전이는 `validateStatusTransition` 규칙을 따릅니다.

### `GET /api/deals/alerts`

Pro 플랜 전용 운영 alert 엔드포인트입니다.

- 인증 필수
- Free 플랜은 402 paywall 응답
- 성공 시 count와 구조화된 `items`를 함께 반환

### `GET /api/creator-profile`

인증 사용자 기준 크리에이터 프로필을 반환합니다.

### `POST /api/creator-profile`

크리에이터 프로필을 생성 또는 수정합니다.

지원 enum:

- `followers_band`: `under_10k` | `10k_50k` | `50k_100k` | `100k_500k` | `over_500k`
- `avg_views_band`: `under_5k` | `5k_20k` | `20k_50k` | `over_50k`

참고:

- `PUT /api/creator-profile`는 기존 클라이언트 호환용 alias입니다.

### `POST /api/deals`

문의 결과를 딜로 저장합니다.

요청 바디 예시:

```json
{
  "inquiry_id": "00000000-0000-0000-0000-000000000000",
  "selected_reply_tone": "negotiation"
}
```

또는 legacy/fallback 경로:

```json
{
  "raw_text": "안녕하세요. 유튜브 쇼츠 1건 협업 가능 여부를 문의드립니다.",
  "source_type": "dm",
  "selected_reply_tone": "polite"
}
```

특징:

- `inquiry_id` 경로가 우선이며 이 경우 재파싱 비용이 없습니다.
- `raw_text + source_type` 경로는 fallback이며 parse quota를 사용합니다.
- 저장 시 `deals`, `deal_checks`, `reply_drafts`가 함께 생성됩니다.

### `POST /api/replies/negotiation-ai`

Pro 플랜 전용 협상 답장 생성 API입니다.

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
- Pro 플랜 gate 적용
- 월간 Negotiation AI 사용량 제한 적용
- 일일 LLM 예산 초과 시 503 응답
- LLM 실패 시 템플릿 fallback 응답

## 배포

이 프로젝트는 OpenNext 기반으로 Cloudflare Workers에 배포됩니다.

```bash
npm run build
npm run preview
npm run deploy
```

관련 파일:

- `open-next.config.ts`
- `wrangler.jsonc`
- `scripts/patch-opennext-helper.mjs`

배포 메모:

- Worker 이름은 현재 `delo-copilot`입니다.
- `wrangler.jsonc`는 `.open-next/worker.js`를 진입점으로 사용합니다.
- `compatibility_flags`로 `nodejs_compat`, `global_fetch_strictly_public`를 사용합니다.
- 정적 자산은 `.open-next/assets`를 `ASSETS` binding으로 연결합니다.
- Worker 자기 참조용 `WORKER_SELF_REFERENCE` service binding을 사용합니다.

## 데이터베이스

현재 마이그레이션 파일:

- `001_create_deal_tables.sql`
- `002_add_inquiries_table.sql`
- `003_creator_profile_and_hash_uniqueness.sql`
- `004_expand_creator_profile_fields.sql`
- `005_inquiries_uniqueness_idempotent.sql`

주요 테이블:

- `deals`
- `deal_checks`
- `deal_status_logs`
- `reply_drafts`
- `user_plans`
- `usage_events`
- `inquiries`
- `parse_cache`
- `creator_profiles`

주요 메모:

- `inquiries`는 canonical parse record입니다.
- `parse_cache`는 비용 최적화를 위한 전역 캐시입니다.
- 현재 dedup 정책은 "인증 사용자별 `(user_id, input_hash)` partial unique"입니다.
- anonymous parse는 동일 입력이어도 항상 새 canonical inquiry를 만들 수 있습니다.
- `user_plans`가 플랜의 canonical source of truth입니다.
- `usage_events.meta`는 LLM budget tracking에도 사용됩니다.

## 개발 우선순위

현재 구현 기준으로 남아 있는 큰 작업은 아래와 같습니다.

1. Intake Workspace UI 완성
2. Deals Dashboard UI 완성
3. Billing 및 Pro 전환 플로우
4. 후속 액션 자동화와 상태 전이 UI
5. 운영 검증용 E2E 테스트 강화

## 현재 상태 요약

현재 저장소는 "문의 파싱 + 저장 API + 플랜 gate + 운영 저장소"까지 연결된 백엔드 중심 MVP입니다.

이미 반영된 요소:

- Supabase 스키마 및 저장소 계층
- canonical inquiry + parse dedup/cache
- 딜 저장, 체크 저장, 답장 초안 저장
- 플랜별 사용량 제한과 기능 gate
- PostHog, Sentry, 구조화 로그 기반 관측
- Cloudflare Workers 배포 설정
- 파싱 실패 진단 코드와 테스트

아직 제품 완성으로 보기는 어려운 영역:

- 사용자용 Intake Workspace 프론트엔드
- 완성형 Deals Dashboard 프론트엔드
- 결제/Billing
- 보다 강한 운영용 E2E 검증

## GTM 메모

초기 GTM은 범용 AI 툴보다 "크리에이터 협업 운영을 줄여주는 도구"라는 메시지에 가깝습니다.

- 인스타그램/유튜브 기반 크리에이터 커뮤니티
- 브랜드 협업을 직접 관리하는 1인 크리에이터
- 매니저 없이 운영하는 중간 규모 계정

즉 README와 제품 설명 모두 "AI 그 자체"보다 "반복 운영 업무를 줄이는 운영 소프트웨어"라는 프레이밍이 더 적합합니다.

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

이 README는 현재 저장소의 구현 상태를 기준으로 유지합니다.

특히 아래 사항을 문서 기준으로 반영합니다.

- 실제 라우트/스키마/플랜 정책과 일치할 것
- 실제 LLM 모델 정책과 일치할 것
- 실제 마이그레이션 파일과 일치할 것
- 실제 Cloudflare 배포 방식과 일치할 것

## 라이선스

현재 비공개 프로젝트입니다.
