# Creator Deal Copilot

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Data-3ecf8e)

브랜드 협업 문의를 붙여 넣으면 계약에 필요한 조건을 구조화하고, 견적 가이드를 만들고, 체크 항목을 보여주고, 답장 초안과 딜 저장까지 이어지는 크리에이터 운영 보조 SaaS입니다.

이 프로젝트는 단순한 "문의 파서"가 아니라 1인 크리에이터가 반복적으로 겪는 영업/협업 운영 부담을 줄이기 위한 워크스페이스를 목표로 합니다.

## 왜 만드는가

크리에이터 협업 운영은 창작보다 반복적이고 운영적인 비용이 큽니다.

- 문의마다 메일, DM, 카카오톡, 브리프 형식이 달라 매번 다시 정리해야 합니다.
- 사용권, 독점권, 수정 횟수, 지급 조건 같은 계약 핵심 항목이 자주 비어 있습니다.
- 견적을 감으로 제시하면 과소 청구나 협상 실패가 반복됩니다.
- 답장 문구를 매번 새로 쓰다 보면 중요한 확인 문장을 빼먹기 쉽습니다.
- 후속 액션과 결제 추적이 끊기면 실제 매출 손실로 이어집니다.

PRD v2 기준에서 이 제품은 "AI가 답장 한 번 써주는 툴"이 아니라 문의 접수부터 딜 저장, 후속 관리까지 연결되는 운영 시스템을 지향합니다.

## 타겟 고객 ICP

현재 코드와 PRD 기준 타겟 고객은 아래와 같습니다.

- 팔로워 5만~15만 규모의 크리에이터
- 월 2~5건 이상의 브랜드 협업 문의를 직접 처리하는 1인 운영자
- 매니저 없이 견적, 답장, 일정, 조건 확인을 직접 처리하는 사용자

즉, "이제 막 시작한 초보"보다 이미 협업은 하고 있지만 운영 효율이 떨어지는 사용자를 직접 고객으로 상정합니다.

## 제품이 해결하려는 문제

- 문의를 읽고 계약 조건을 수작업으로 정리하는 시간 낭비
- 빈칸 많은 계약 조건과 작업 리스크 파악 실패
- 일관성 없는 견적 제안과 협상 메시지 작성
- 저장되지 않으면 사라지는 운영 히스토리
- 후속 관리 누락으로 생기는 일정/입금 리스크

## 현재 구현 범위

현재 저장소에는 아래 기능이 실제 코드로 구현되어 있습니다.

- 브랜드 문의 텍스트를 구조화된 필드로 파싱하는 API
- 입력 텍스트 정리, SHA-256 해시 기반 dedup, 사용자 범위 캐시, 전역 parse cache
- 견적 계산 엔진, 누락 조건 체크 엔진, 답장 초안 생성기
- Free/Pro 플랜 정책과 사용량 제한
- Pro 전용 Negotiation AI API와 LLM 일일 예산 가드
- inquiry history/detail 조회 및 reply draft 수정 API
- deals 생성, 조회, 수정, 상태 전이, 상태 로그 저장
- creator profile 저장/조회 API
- creator profile 온보딩 위저드와 PRD 입력값 매핑 레이어
- Stripe Checkout, Stripe webhook, subscription 동기화 기반 Billing 흐름
- Supabase OTP 로그인, `/login` 진입, `/auth/callback` 세션 교환
- `middleware.ts` 기반 `/dashboard` 보호
- PostHog 이벤트 추적, 클라이언트 이벤트 수집 API, Sentry 연동, 구조화 로그
- Next.js App Router 기반 UI
- OpenNext + Cloudflare Workers 배포
- Vitest 기반 테스트 스위트
- `db/schema.sql` 기반 최종 스키마 스냅샷 문서

## 최근 업데이트

최근 코드 기준으로 문서에 반영해야 하는 변경점은 아래와 같습니다.

- `/dashboard/intake`에 2단 레이아웃의 Intake Workspace가 추가되어 parse 결과 확인 후 바로 deal 저장까지 이어집니다.
- `/dashboard`가 더 이상 인증 확인용 플레이스홀더가 아니라 summary cards, tab filter, Pro alert panel을 갖춘 운영 보드로 동작합니다.
- `/dashboard/deals/[id]` 상세 화면에서 상태 전이, 일정, 메모를 수정하고 상태 로그를 확인할 수 있습니다.
- deal 저장 API가 `initial_status`를 받아 `Lead`, `Replied`, `Negotiating` 중 초기 상태를 지정할 수 있습니다.
- `GET /api/deals`가 `status` query filter를 지원하고, 허용 플랜에서는 alert summary를 함께 반환합니다.
- `POST /api/deals`는 `inquiry_id` 우선 저장 경로와 `raw_text + source_type` fallback 저장 경로를 모두 지원합니다.
- creator profile API는 `POST`와 `PUT`가 동일 저장 로직을 공유하며, onboarding wizard가 PRD 입력값을 API 스키마로 변환합니다.
- 테스트 범위에 deals route, deals detail route, alerts route, creator profile route, dashboard helper 회귀 검증이 추가되었습니다.
- `/settings`가 더 이상 placeholder가 아니라 현재 플랜, 구독 상태, 다음 갱신일, Pro 업그레이드 버튼을 보여주는 billing 화면으로 동작합니다.
- `POST /api/billing/checkout`, `POST /api/billing/webhook`, `subscriptions` 저장소/서비스가 추가되어 Stripe 구독 상태와 `user_plans` 동기화 흐름이 연결되었습니다.
- `/terms`, `/privacy`, `CookieBanner`가 추가되어 결제/분석 도입에 필요한 기본 법적 고지와 쿠키 동의 UI가 포함되었습니다.
- `POST /api/analytics/event`와 `trackClientEvent`가 추가되어 랜딩 CTA, 체크아웃 시작, 답장 복사 같은 클라이언트 이벤트를 서버 경유로 수집합니다.
- 랜딩 페이지 `/`가 실제 마케팅 진입점으로 교체되어 Hero, 기능 소개, CTA, 누적 deal count, 법적 링크를 노출합니다.
- 랜딩 페이지 CTA에 `/parse`로 직접 이동하는 `직접 붙여넣기` 경로가 추가되어 가입 전 체험 진입점이 하나 더 생겼습니다.

이번 정리에서 추가로 확인된 UI 업데이트는 아래와 같습니다.

- `Dashboard` 헤더와 Pro 잠금 문구가 실제 운영 보드 맥락에 맞는 한국어 카피로 정리되었습니다.
- `Dashboard Deal Detail` 편집 폼의 저장/오류 문구와 라벨이 한국어 기준으로 다듬어져 실제 사용 흐름 설명과 일치합니다.
- 저장된 딜이 없을 때 `EmptyDealsState`가 `/parse`로 바로 이동하는 CTA를 제공해 첫 분석 진입점을 명확히 보여줍니다.

현재 노출된 주요 API 라우트는 아래와 같습니다.

- `GET /api/health`
- `GET /api/inquiries`
- `POST /api/inquiries/parse`
- `GET /api/inquiries/[id]`
- `PATCH /api/inquiries/[id]`
- `GET /api/deals`
- `POST /api/deals`
- `GET /api/deals/[id]`
- `PATCH /api/deals/[id]`
- `GET /api/deals/alerts`
- `GET /api/creator-profile`
- `POST /api/creator-profile`
- `PUT /api/creator-profile`
- `POST /api/billing/checkout`
- `POST /api/billing/webhook`
- `POST /api/analytics/event`
- `POST /api/replies/negotiation-ai`

현재 프론트엔드 라우트는 아래와 같습니다.

- `/`
- `/parse`
- `/history`
- `/deal/[id]`
- `/settings`
- `/login`
- `/dashboard`
- `/onboarding`
- `/dashboard/intake`
- `/dashboard/deals/[id]`
- `/terms`
- `/privacy`

입력 예시:

```json
{
  "raw_text": "Hi, we'd love to collaborate on an Instagram Reel. Please share your rate and availability.",
  "source_type": "email"
}
```

## PRD 기준 MVP 정의

PRD v2 기준 MVP는 단순 생성 기능 묶음이 아니라, 작업 유입부터 저장과 후속 관리까지 이어지는 운영 흐름을 가져야 합니다.

작업 흐름:

1. 사용자가 문의를 붙여 넣는다.
2. 시스템이 문의를 구조화한다.
3. 비어 있는 항목과 리스크를 보여준다.
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
- 담당자명
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
- 정리된 텍스트와 `source_type`, 프롬프트 버전으로 입력 해시를 생성합니다.
- 인증 사용자는 `(user_id, input_hash)` 기준으로 같은 문의를 재사용합니다.
- 사용자 캐시 miss 시 전역 `parse_cache`를 조회해 같은 입력의 canonical inquiry를 다시 만듭니다.
- 캐시가 모두 miss면 LLM을 호출하고 결과를 `inquiries`와 `parse_cache`에 기록합니다.
- 파싱 결과는 `inquirySchema`로 검증합니다.
- 오류 코드는 `PROVIDER_CONFIG_ERROR`, `PROVIDER_REQUEST_FAILED`, `PROVIDER_RESPONSE_INVALID`, `PARSE_SCHEMA_INVALID`, `PARSE_CACHE_ERROR`, `INQUIRY_PERSIST_FAILED`, `PARSE_FAILED`로 구분됩니다.

### 2. 체크 엔진

계약과 운영에서 중요한 항목이 비어 있거나 불명확하면 체크 항목으로 반환합니다.

예시:

- 지급 조건 확인
- 사용권 확인
- 독점권 여부 확인
- 수정 횟수 확인
- 일정 확인

플랜 정책:

- Free 플랜은 parse 응답에서 체크 목록이 비활성화됩니다.
- Pro 플랜은 전체 체크 목록을 반환합니다.

### 3. 견적 엔진

크리에이터 프로필과 문의 내용을 바탕으로 아래 값을 계산합니다.

- `floor`
- `target`
- `premium`

숫자만 반환하지 않고 설명 텍스트도 함께 제공합니다.

플랜 정책:

- Free 플랜은 요약 견적만 반환합니다.
- Pro 플랜은 전체 breakdown을 반환합니다.

### 4. 답장 초안 생성

기본 parse 응답에서 템플릿 기반 답장 초안을 생성합니다.

- `polite`
- `quick`
- `negotiation`

현재 구현 메모:

- Free 플랜은 `polite`만 반환합니다.
- Pro 플랜은 `polite`, `quick`, `negotiation`을 모두 반환합니다.
- inquiry detail 화면에서는 `PATCH /api/inquiries/[id]`로 초안 수정본을 저장합니다.

### 5. Negotiation AI 답장

`POST /api/replies/negotiation-ai`는 Pro 전용 기능입니다.

- 인증 필수
- `checkUsageLimit`로 플랜 gate와 사용량 제한 적용
- `checkLlmBudget`로 일일 LLM 호출 수 200건 초과 시 503 차단
- 생성 성공 시 `usage_events`에 사용량 기록
- `deal_id`가 있으면 생성 결과를 `reply_drafts`에 저장
- LLM 실패 시 템플릿 기반 fallback 답장을 반환

### 6. LLM 라우팅

모델/프로바이더 추상화 레이어가 있고 작업별 기본 모델 정책이 분리되어 있습니다.

- 문의 파싱: 기본 `gpt-4o-mini`, fallback `gemini-2.5-flash-lite`
- 협상 답장: 기본 `gpt-4o-mini`, fallback 정책은 `claude-sonnet-4-6`

### 7. 인증과 보호된 라우트

현재 구현된 인증 흐름은 아래와 같습니다.

- Supabase OTP 기반 magic link 로그인
- `/login`에서 이메일 제출
- `/auth/callback`에서 `exchangeCodeForSession`
- `middleware.ts`에서 세션 refresh
- `/dashboard` 및 하위 경로 보호

현재 `Dashboard`는 저장된 딜 목록을 상태 탭으로 분류해 보여주고, 요약 카드와 Pro 전용 alert panel을 함께 노출하는 운영 보드입니다.

### 8. 결제와 플랜 업그레이드

현재 구현된 Billing 흐름은 아래와 같습니다.

- `/settings`에서 현재 plan, subscription status, 갱신 예정일 확인
- Free 사용자는 `POST /api/billing/checkout` 호출로 Stripe Checkout Session 생성
- `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` webhook 처리
- `subscriptions` 테이블에 Stripe customer/subscription 상태 저장
- webhook 처리 후 `user_plans`를 `free` 또는 `pro`로 동기화
- 업그레이드/해지 이벤트를 analytics로 기록

구현 메모:

- `services/billing-service.ts`가 checkout session 생성과 webhook 이벤트별 상태 반영을 담당합니다.
- webhook 처리는 `stripe_event_id`를 사용해 idempotent 하게 동작합니다.
- `past_due` 또는 해지 이벤트가 오면 플랜을 다시 `free`로 내립니다.
- 현재 플랜 판정의 단일 source of truth는 `subscriptions`가 아니라 `user_plans`이며, webhook이 이를 동기화합니다.
- 환경 변수로 `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`가 필요합니다.

### 9. 온보딩과 프로필 설정

현재 구현된 초기 온보딩 흐름은 아래와 같습니다.

- `/onboarding`에서 6단계 creator profile setup 진행
- 기존 profile이 있으면 `/dashboard/intake`로 redirect
- 저장이 끝나면 `/api/creator-profile`에 POST 후 `/dashboard/intake`로 이동
- `lib/creator-profile-mapper.ts`에서 PRD용 band 값을 기존 backend enum으로 변환

온보딩 수집 항목:

- primary platform
- niche
- audience band
- average views band
- geo region
- floor rate

### 10. UI 워크스페이스

현재 구현된 화면은 아래와 같습니다.

- `Home`: 마케팅 랜딩 페이지와 CTA 진입점
- `Parse`: parse pipeline을 직접 테스트하는 별도 화면
- `History`: 최근 inquiry 목록 조회
- `Deal Detail`: inquiry 상세 결과, quote, checks, reply draft 편집
- `Settings`: 플랜/결제 관리 화면
- `Login`: OTP 로그인 화면
- `Dashboard`: 저장된 deals를 요약 카드, 탭 필터, alert panel과 함께 보여주는 운영 보드
- `Dashboard Deal Detail`: 상태 전이, 일정, 결제일, 메모, 상태 로그를 수정/확인하는 상세 화면
- `Onboarding`: creator profile 초기 입력 위저드
- `Dashboard Intake`: 온보딩 완료 후 바로 parse -> save deal로 이어지는 2단 워크스페이스
- `Terms` / `Privacy`: 결제 및 분석 도입에 필요한 법적 고지 페이지

`Dashboard Intake` 구현 메모:

- 좌측 입력 패널에서 문의 원문과 source type을 설정합니다.
- 우측 결과 패널이 `empty -> loading -> success/error` 상태로 전환됩니다.
- parse 성공 후 sticky action bar에서 reply tone과 initial deal status를 선택해 저장합니다.
- 샘플 문의 자동 입력 버튼이 있어 초기 흐름을 빠르게 점검할 수 있습니다.

`Dashboard` / `Dashboard Deal Detail` 구현 메모:

- `calcSummary`가 total, active, dueThisWeek, confirmed pipeline 금액을 계산합니다.
- 목록 화면은 `all`, `active`, `done`, `lost` 탭으로 딜을 필터링합니다.
- Pro 플랜에서는 활성 alert가 있을 때만 alert panel을 노출합니다.
- 상세 화면은 `PATCH /api/deals/[id]`를 호출해 상태, next action, deadline, payment due date, notes를 갱신합니다.
- 잘못된 상태 전이는 422 응답으로 막고, 성공한 전이는 `deal_status_logs`에 기록됩니다.

랜딩 / 설정 / 공통 레이아웃 구현 메모:

- `/` 랜딩 페이지는 누적 deals 수를 보여주고 `무료로 시작하기`, `샘플로 바로 체험`, `직접 붙여넣기` CTA를 제공합니다.
- `CookieBanner`가 로컬 스토리지 기반 쿠키 동의 상태를 관리합니다.
- 설정 화면에서는 checkout 시작 전 `checkout_started` 클라이언트 이벤트를 전송합니다.
- Intake 체크 항목 카드에는 "운영 참고용이며 법률 자문이 아니다"라는 고지가 함께 노출됩니다.

### 11. 딜 저장과 운영 데이터

현재 아래 서버 구성이 실제로 연결되어 있습니다.

- `POST /api/deals`를 통한 딜 생성
- `GET /api/deals`를 통한 딜 목록, status filter, alert 요약 조회
- `GET/PATCH /api/deals/[id]`를 통한 딜 상세 조회 및 수정
- `GET /api/deals/alerts`를 통한 Pro 전용 alert 조회
- `GET/POST/PUT /api/creator-profile`을 통한 프로필 관리
- `POST /api/billing/checkout`을 통한 Stripe Checkout 진입
- `POST /api/billing/webhook`을 통한 subscription 상태 반영
- `POST /api/analytics/event`를 통한 클라이언트 이벤트 수집
- `GET /api/inquiries`를 통한 inquiry history 조회
- `GET/PATCH /api/inquiries/[id]`를 통한 inquiry detail 조회 및 초안 저장
- `repositories/` 계층을 통한 DB 접근 분리
- `services/status-transition.ts`를 통한 상태 전이 검증
- `repositories/subscriptions-repo.ts`를 통한 billing 상태 저장과 `user_plans` 동기화

현재 허용된 상태 전이는 아래와 같습니다.

- `Lead -> Replied | ClosedLost`
- `Replied -> Negotiating | ClosedLost`
- `Negotiating -> Confirmed | ClosedLost`
- `Confirmed -> Delivered`
- `Delivered -> Paid`

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
- Stripe
- Vitest
- OpenNext
- Cloudflare Workers

## 프로젝트 구조

```text
app/
  api/
    analytics/
    billing/
    creator-profile/
    deals/
    health/
    inquiries/
    replies/negotiation-ai/
  auth/callback/
  dashboard/
    deals/[id]/
    intake/
  deal/[id]/
  history/
  login/
  onboarding/
  parse/
  settings/
components/
  dashboard/
  inquiry/
  onboarding/
  intake/
  landing/
  results/
  settings/
  ui/
db/
  schema.sql
lib/
  analytics.ts
  analytics-client.ts
  analytics-contract.ts
  creator-profile-mapper.ts
  inquiry/
  llm/
  logger.ts
  normalize-inquiry.ts
  parse-error.ts
  plan-policy.ts
  sentry.ts
  stripe.ts
  supabase/
repositories/
  subscriptions-repo.ts
schemas/
services/
  alert-engine.ts
  auth-service.ts
  billing-service.ts
  check-engine.ts
  deal-service.ts
  llm-budget-guard.ts
  parse-llm-service.ts
  parse-service.ts
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
utils/
middleware.ts
open-next.config.ts
vercel.json
wrangler.jsonc
```

구조 설명:

- `parse-service`: 문의 텍스트를 구조화하고 canonical inquiry를 생성
- `parse-llm-service`: 모델 선택, provider 호출, JSON 추출, 스키마 검증
- `check-engine`: 누락/리스크 항목 계산
- `quote-engine`: floor, target, premium 계산
- `reply-generator`: 플랜 정책에 맞는 초안 생성
- `reply-template-service`: Negotiation AI fallback 답장 생성
- `llm-budget-guard`: 일일 LLM 사용량 차단
- `deal-service`: deals, deal_checks, reply_drafts 저장 payload 생성
- `repositories`: Supabase 접근 계층
- `usage-guard`: 플랜별 사용량 제한과 기능 gate 처리
- `alert-engine`: 후속 관리용 alert 계산
- `billing-service`: Stripe checkout/webhook와 구독 상태 동기화 처리
- `middleware.ts`: 세션 refresh 및 `/dashboard` 보호
- `creator-profile-mapper.ts`: 온보딩 입력값을 기존 creator profile API 스키마로 변환
- `stripe.ts`: Stripe SDK와 price/webhook secret 로더
- `db/schema.sql`: migration 001~006 기준 최종 스키마 참고본

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 됩니다.

## 환경 변수

`.env.local`에는 아래 값을 설정해야 합니다.

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

Billing:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
```

관측/분석:

```env
SENTRY_DSN=
POSTHOG_API_KEY=
NEXT_PUBLIC_APP_URL=
```

보안 및 배포 메모:

- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`, `ANTHROPIC_API_KEY`, `POSTHOG_API_KEY`, `SENTRY_DSN`은 서버 전용 값으로 취급해야 합니다.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` 역시 서버 전용 값으로 관리해야 합니다.
- Cloudflare Workers 배포 시 비밀 값은 Dashboard의 `Settings > Variables and Secrets` 또는 Wrangler secret으로 관리해야 합니다.
- 현재 `wrangler.jsonc`에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 `vars`로 정의되어 있습니다.

## API

### `GET /api/health`

서버 상태 확인용 헬스체크 엔드포인트입니다.

### `GET /api/inquiries`

인증 사용자 기준 최근 inquiry 목록을 반환합니다.

응답 필드:

- `id`
- `brand`
- `platform`
- `deliverables`
- `suggested_price`
- `created_at`

### `POST /api/inquiries/parse`

문의 텍스트를 구조화 결과, 견적 가이드, 체크 항목, 답장 초안으로 변환합니다.

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

- 인증 사용자에게는 월간 parse 사용량 제한이 적용됩니다.
- 비인증 사용자는 free 정책으로 처리됩니다.
- Free 플랜은 요약 견적과 `polite` 초안 위주 응답을 받습니다.
- Pro 플랜은 전체 checks, 전체 quote breakdown, 추가 tone을 받습니다.
- 실패 시 구조화된 파싱 오류 코드가 반환됩니다.

### `GET /api/inquiries/[id]`

단일 inquiry의 상세 parse 결과를 반환합니다.

특징:

- 저장된 inquiry 기준으로 quote/checks/reply draft를 다시 구성합니다.
- 저장된 `reply_drafts_json` 수정본이 있으면 생성 초안 위에 merge합니다.

### `PATCH /api/inquiries/[id]`

reply draft 수정 결과를 inquiry에 저장합니다.

수정 가능 필드:

- `reply_drafts.polite`
- `reply_drafts.quick`
- `reply_drafts.negotiation`

### `GET /api/deals`

인증 사용자 기준 딜 목록과 alert 요약을 반환합니다.

지원 쿼리:

- `?status=Lead|Replied|Negotiating|Confirmed|Delivered|Paid|ClosedLost`

### `POST /api/deals`

문의 결과를 실제 딜로 저장합니다.

요청 예시:

```json
{
  "inquiry_id": "00000000-0000-0000-0000-000000000000",
  "selected_reply_tone": "negotiation"
}
```

또는 fallback 경로:

```json
{
  "raw_text": "유튜브 쇼츠 1건 협업 제안 문의드립니다.",
  "source_type": "dm",
  "selected_reply_tone": "polite"
}
```

특징:

- `inquiry_id` 경로가 우선이며 이 경우 재파싱이 없습니다.
- `raw_text + source_type` 경로는 fallback이며 parse quota를 사용합니다.
- `initial_status`로 `Lead`, `Replied`, `Negotiating` 중 시작 상태를 지정할 수 있습니다.
- 저장 시 `deals`, `deal_checks`, `reply_drafts`가 함께 생성됩니다.

### `GET /api/deals/[id]`

딜 상세, 체크, 초안, 상태 로그를 반환합니다.

### `PATCH /api/deals/[id]`

딜 상태, 메모, 후속 액션, 일정 필드를 수정합니다.

수정 가능 필드:

- `status`
- `notes`
- `next_action`
- `next_action_due_at`
- `followup_needed`
- `deadline`
- `payment_due_date`

### `GET /api/deals/alerts`

Pro 전용 딜 alert 엔드포인트입니다.

- 인증 필수
- Free 플랜은 402 paywall 응답
- 성공 시 `alerts.items`를 포함한 구조화 응답 반환

### `GET /api/creator-profile`

인증 사용자 기준 크리에이터 프로필을 반환합니다.

### `POST /api/creator-profile`

크리에이터 프로필을 생성 또는 수정합니다.

지원 enum:

- `followers_band`: `under_10k` | `10k_50k` | `50k_100k` | `100k_500k` | `over_500k`
- `avg_views_band`: `under_5k` | `5k_20k` | `20k_50k` | `over_50k`

참고:

- `PUT /api/creator-profile`는 동일 저장 로직을 공유하는 alias입니다.

### `POST /api/replies/negotiation-ai`

Pro 전용 협상 답장 생성 API입니다.

요청 예시:

```json
{
  "inquiry_id": "00000000-0000-0000-0000-000000000000",
  "deal_id": "00000000-0000-0000-0000-000000000000",
  "quote_target": 450000,
  "missing_fields": ["usage_rights", "payment_terms"]
}
```

### `POST /api/billing/checkout`

인증 사용자를 Stripe Checkout으로 보내기 위한 session URL을 생성합니다.

요청 예시:

```json
{
  "cancel_path": "/settings"
}
```

특징:

- 인증 필수
- 성공 시 `url`을 반환합니다.
- 성공 URL은 `${NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`로 고정됩니다.

### `POST /api/billing/webhook`

Stripe webhook 엔드포인트입니다.

처리 이벤트:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

특징:

- raw body와 `stripe-signature` 검증이 필요합니다.
- 처리 실패 시 500을 반환해 Stripe 재시도를 유도합니다.
- `subscriptions` 테이블과 `user_plans`를 함께 동기화합니다.

### `POST /api/analytics/event`

클라이언트 이벤트를 서버 경유로 PostHog에 전달하는 best-effort 엔드포인트입니다.

주요 이벤트 예시:

- `landing_cta_clicked`
- `checkout_started`
- `sample_inquiry_used`
- `reply_copied`

## 배포

이 프로젝트는 OpenNext 기반으로 Cloudflare Workers에 배포합니다.

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
- Worker 자기 참조는 `WORKER_SELF_REFERENCE` service binding을 사용합니다.
- `vercel.json`도 포함되어 있어 Next.js 빌드 환경변수 매핑용 보조 설정을 제공합니다.

## 데이터베이스

권위 있는 변경 이력은 `supabase/migrations/`이고, `db/schema.sql`은 001~006 마이그레이션을 합친 참조 스냅샷입니다.

현재 마이그레이션 파일:

- `001_create_deal_tables.sql`
- `002_add_inquiries_table.sql`
- `003_creator_profile_and_hash_uniqueness.sql`
- `004_expand_creator_profile_fields.sql`
- `005_inquiries_uniqueness_idempotent.sql`
- `006_add_reply_drafts_to_inquiries.sql`
- `007_add_subscriptions_table.sql`

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
- `subscriptions`

주요 메모:

- `inquiries`는 canonical parse record입니다.
- `parse_cache`는 전역 재사용 캐시입니다.
- authenticated dedup은 `(user_id, input_hash)` partial unique index 기반입니다.
- `reply_drafts_json` 컬럼으로 inquiry 단위 수정 초안을 저장합니다.
- `user_plans`가 현재 플랜 정책의 source of truth입니다.
- `subscriptions`는 Stripe customer/subscription 상태와 마지막 처리 이벤트 id를 저장합니다.

## 테스트

주요 테스트 범위:

- parse service / parse LLM service
- inquiry parse route
- deals / alerts / creator-profile routes
- deals/:id route / dashboard helpers
- alert engine / usage guard / status transition
- reply generator / analytics / sanitize / hash helpers
- billing checkout / webhook / subscription sync

실행 명령:

```bash
npm run test
```

최근 추가된 회귀 테스트:

- `__tests__/deals-route.test.ts`: status filter 전달과 `initial_status` 저장 검증
- `__tests__/deals-id-route.test.ts`: 소유권 검사, 상태 전이 검증, status log 생성 검증
- `__tests__/deals-alerts-route.test.ts`: alert 플랜 gate와 구조화 응답 검증
- `__tests__/creator-profile-route.test.ts`: expanded profile field 저장과 `PUT` alias 검증
- `__tests__/dashboard-helpers.test.ts`: 탭 필터, summary 계산, 날짜/통화 포맷 helper 검증
- `__tests__/billing-checkout-route.test.ts`: checkout session URL 반환과 인증/에러 처리 검증
- `__tests__/billing-webhook-route.test.ts`: Stripe 이벤트 라우팅과 재시도용 500 응답 검증
- `__tests__/billing-service.test.ts`: subscription 업그레이드/해지/idempotency 검증
- `__tests__/plan-gating-integration.test.ts`: Free/Pro 플랜 limit와 기능 gate 통합 검증
- `__tests__/analytics-contract.test.ts`: 허용된 analytics event name 목록 회귀 검증

## 개발 우선순위

현재 구현 기준으로 남아 있는 큰 작업은 아래와 같습니다.

1. Dashboard와 `/dashboard/intake`의 역할 분리를 더 선명하게 다듬기
2. Stripe Customer Portal 또는 해지/플랜 변경 self-service 기능 보강
3. E2E 테스트 강화
4. 실데이터 운영 기준의 세부 UX polish와 알림/후속 액션 흐름 보강
5. billing/analytics 운영 모니터링 고도화

## 현재 상태 요약

현재 저장소는 "문의 파싱 + inquiry 저장 + 딜 저장 API + 운영 대시보드 + 플랜 gate + Stripe Billing + 인증 흐름 + 배포 설정"까지 연결된 MVP입니다.

이미 반영된 요소:

- Supabase 스키마와 repository 계층
- canonical inquiry + parse dedup/cache
- inquiry history/detail 조회
- reply draft 수정 및 저장
- deal 저장, 상태 관리, alert 계산
- dashboard 목록/상세 조회와 상태 로그 기록
- creator profile 온보딩과 intake 진입 흐름
- Stripe checkout, webhook, subscription 동기화
- 랜딩 페이지, 약관/개인정보 페이지, 쿠키 동의 배너
- Free/Pro 사용량 제한과 기능 gate
- PostHog, 클라이언트 이벤트 수집 API, Sentry, 구조화 로그 기반 관측
- Cloudflare Workers 배포 설정
- OTP 로그인과 보호된 `/dashboard`

아직 완성되지 않은 영역:

- 더 강한 E2E 검증
- 실데이터 기반 운영 자동화 polish
- 구독 변경/해지 self-service UX

## GTM 메모

초기 GTM 포지셔닝은 범용 AI 비서보다 "크리에이터 협업 운영을 줄여주는 운영 도구"에 가깝습니다.

- 인스타그램/유튜브 기반 크리에이터 커뮤니티
- 브랜드 협업을 직접 관리하는 1인 크리에이터
- 매니저 없이 운영하는 중간 규모 계정

README의 설명도 "AI 그 자체"보다 "반복 운영 업무를 줄이는 워크플로우"라는 프레임에 맞춰 유지하는 것이 적합합니다.

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

## 라이선스

현재 비공개 프로젝트입니다.
