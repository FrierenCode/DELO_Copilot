# Creator Deal Copilot

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Data-3ecf8e)

브랜드 협찬 문의를 붙여넣으면, 계약 핵심 조건을 구조화하고, 빠진 항목을 체크하고, 견적 가이드를 만들고, 답장 초안까지 생성하는 크리에이터 협찬 운영 코파일럿입니다.

이 프로젝트는 단순한 "문의 파서"가 아니라, 1인 크리에이터가 협찬 운영에서 놓치기 쉬운 손실 지점을 줄이기 위한 운영 SaaS를 목표로 합니다.

## 왜 만들고 있나

협찬 운영은 생각보다 반복적이고, 동시에 실수 비용이 큽니다.

- 문의 내용이 메일, DM, 카카오톡, 브랜드 브리프 등 제각각이라 정리부터 오래 걸립니다.
- 사용권, 독점권, 수정 횟수, 지급 조건 같은 핵심 항목이 빠진 채 대화가 진행되기 쉽습니다.
- 견적을 감으로 제시하다 보면 과소청구 또는 협상 실패가 반복됩니다.
- 답장 문구를 매번 새로 쓰면서도 중요한 조건 확인 문장을 빼먹기 쉽습니다.

PRD v2.0 기준에서 이 제품은 "만들 수 있는 제품"이 아니라 "돈 내는 운영 SaaS"가 되려면, ICP 압축, 견적 신뢰도, 운영 대시보드, Pro 전환 명분이 분명해야 한다는 전제를 깔고 설계되고 있습니다.

## 핵심 타깃 ICP

현재 PRD 기준 핵심 타깃은 아래와 같습니다.

- 팔로워 5만~15만 규모의 크리에이터
- 월 2~5건 수준의 협찬을 직접 운영하는 1인 실무자
- 에이전시 없이 본인이 견적, 답장, 일정, 조건 확인을 모두 처리하는 사용자

즉, "협찬이 아예 없는 초보"보다 "이미 협찬은 들어오지만 운영이 비효율적인 사용자"를 더 직접적인 대상으로 둡니다.

## 제품이 해결하려는 문제

- 문의를 읽고 핵심 조건을 수작업으로 정리하는 시간 낭비
- 빠진 계약 조건을 놓쳐 생기는 리스크
- 일관성 없는 견적 제안과 협상 메시지
- 저장하지 않으면 사라지는 운영 히스토리
- 놓치면 바로 매출 손실로 이어지는 후속 관리 부재

## 현재 구현 범위

지금 저장소에는 아래 기능의 기반이 이미 들어와 있습니다.

- 문의 원문을 구조화된 필드로 파싱하는 API
- 누락된 조건을 표시하는 체크 엔진
- 크리에이터 프로필 기반 견적 계산 엔진
- 정중형, 빠른형, 협상형 답장 초안 생성
- OpenAI, Google, Anthropic을 위한 LLM 클라이언트 추상화
- Next.js App Router 기반 API 및 UI 스캐폴드

현재 핵심 엔드포인트:

`POST /api/inquiries/parse`

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

PRD v2.0 기준 MVP는 단순 생성형 기능 묶음이 아니라, 협찬 인입부터 저장까지 이어지는 운영 흐름을 가져야 합니다.

핵심 흐름:

1. 사용자가 문의를 붙여넣는다.
2. 시스템이 문의를 구조화한다.
3. 빠진 항목과 리스크를 보여준다.
4. 견적 범위와 설명을 제시한다.
5. 바로 보낼 수 있는 답장 초안을 만든다.
6. 협찬 건으로 저장하고 이후 운영 보드로 이어진다.

PRD에서 특히 강조하는 포인트:

- 견적은 단순 숫자가 아니라 설명 가능한 구조여야 함
- 체크 결과는 "법률 문서" 톤보다 "운영 체크리스트" 톤에 가까워야 함
- 최종적으로는 Intake Workspace와 Deals Dashboard가 연결되어야 함

## 주요 기능

### 1. 문의 파싱

메일, DM 등 비정형 텍스트에서 아래와 같은 정보를 추출하는 흐름을 다룹니다.

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

### 2. 체크 엔진

계약과 운영에 중요한 항목이 비어 있거나 불명확하면 체크 항목으로 올립니다.

예시:

- 지급 조건 누락
- 사용권 누락
- 독점권 불명확
- 수정 횟수 누락
- 일정 누락

### 3. 견적 엔진

크리에이터 프로필과 문의 내용을 기반으로 아래 값을 계산합니다.

- `floor`
- `target`
- `premium`

또한 PRD 방향에 맞게, 왜 이런 가격이 나왔는지 설명 가능한 구조를 유지하는 것이 중요합니다.

### 4. 답장 초안 생성

현재는 템플릿 기반 응답과 전략 분기를 포함한 구조가 들어가 있습니다.

- 정중한 답장
- 빠른 회신용 답장
- 협상용 답장

향후에는 실제 LLM 협상 답장 생성과 연결되는 구조를 전제로 설계되어 있습니다.

### 5. LLM 라우팅 계층

향후 프롬프트 안정화와 비용/성능 조절을 위해 멀티 프로바이더 구조를 채택하고 있습니다.

- 문의 파싱: Gemini 우선, GPT 보조
- 협상 답장: GPT 우선, Claude 보조

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

## 프로젝트 구조

```text
app/
  api/
    health/
    inquiries/parse/
components/
lib/
  llm/
  supabase/
services/
  check-engine.ts
  parse-service.ts
  quote-engine.ts
  reply-generator.ts
  reply-routing-service.ts
  reply-template-service.ts
types/
```

구조 역할:

- `parse-service`: 문의 원문을 구조화된 필드로 변환
- `check-engine`: 누락/리스크 항목 계산
- `quote-engine`: 견적 하한, 목표, 프리미엄 계산
- `reply-generator`: 답장 전략 선택 및 초안 생성
- `lib/llm`: 모델/프로바이더 추상화 계층

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다.

## 환경 변수

`.env.example`을 참고해 `.env.local`을 생성하세요.

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

보안 원칙:

- 실제 키는 절대 `README.md`나 `.env.example`에 넣지 않습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용으로 관리해야 합니다.
- 배포 환경에서는 플랫폼의 Secret 저장소를 사용해야 합니다.

## API

### `GET /api/health`

서버 헬스 체크용 엔드포인트입니다.

### `POST /api/inquiries/parse`

문의 원문을 넣으면 구조화 결과, 견적 가이드, 체크 항목, 답장 초안을 반환합니다.

요청 바디:

```json
{
  "raw_text": "안녕하세요. 1건의 릴스와 3건의 스토리 협업을 제안드립니다.",
  "source_type": "email"
}
```

`source_type` 지원값:

- `email`
- `dm`
- `other`

## PRD 기반 개발 우선순위

PRD v2.0 문서 기준 개발 착수 순서는 아래 흐름을 따릅니다.

1. Next.js 15 + TypeScript + Tailwind + shadcn/ui 기반 정비
2. Supabase Auth + PostgreSQL 스키마 확장
3. 6단계 온보딩과 `creator_profile` 저장
4. Inquiry Paste 화면과 Parse API 연결
5. LLM 기반 JSON 추출 안정화
6. 견적 엔진과 체크 엔진 고도화
7. Reply Draft Generator와 Intake Workspace 연결
8. Deal 저장과 운영 알림 로직 추가
9. Deals Dashboard 구현
10. Billing, Analytics, Sentry, QA, 배포 정리

## 현재 상태와 다음 단계

현재 상태는 "개발 가능한 기반"을 넘어, PRD에서 말하는 핵심 운영 흐름의 일부를 이미 코드로 옮긴 단계입니다. 다만 아직 아래 영역은 더 필요합니다.

- 실제 사용자 인증과 크리에이터 프로필 저장
- 협찬 건 저장과 이력 관리
- Deals Dashboard UI
- 알림 및 후속 운영 로직
- Billing과 Pro 플랜 정의
- 프롬프트 안정화 및 품질 검증

## GTM 관점 메모

PRD 기준 초기 GTM은 넓게 퍼뜨리는 방식보다 좁고 진하게 들어가는 전략을 전제합니다.

- 한국 크리에이터 커뮤니티
- Reddit 등 해외 크리에이터 실무 커뮤니티

즉, 이 README 역시 "누구에게나 필요한 AI" 톤보다 "협찬 운영을 혼자 처리하는 크리에이터의 반복 업무를 줄이는 도구"라는 포지셔닝을 유지하는 것이 맞습니다.

## 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 문서 기준

이 README는 `creator_deal_copilot_prd_v2.docx`의 방향을 반영해 작성되었습니다.

특히 아래 원칙을 중심으로 정리했습니다.

- ICP를 넓게 잡지 않기
- 단순 AI 도구가 아니라 운영 SaaS로 설명하기
- 견적 신뢰도와 운영 대시보드를 핵심 가치로 보기
- 2주 MVP 범위와 이후 확장 범위를 구분하기

## 라이선스

현재 비공개 프로젝트입니다.
