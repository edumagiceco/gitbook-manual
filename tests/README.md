# 자동화 테스트 설정

이 폴더는 GitBook 스타일 매뉴얼 사이트의 자동화 테스트를 포함합니다.

## 테스트 구조

```
tests/
├── manual_test_cases.md      # 수동 테스트 케이스
├── e2e/                      # E2E 테스트
├── unit/                     # 유닛 테스트
├── integration/              # 통합 테스트
└── utils/                    # 테스트 유틸리티
```

## 테스트 실행 방법

### 수동 테스트
```bash
# 테스트 문서를 참고하여 수동으로 실행
open tests/manual_test_cases.md
```

### E2E 테스트 (예정)
```bash
# Playwright 기반 E2E 테스트
npm run test:e2e
```

### 유닛 테스트 (예정)
```bash
# Jest 기반 유닛 테스트
npm run test:unit
```

## 테스트 환경 요구사항

- Node.js 18+
- Docker & Docker Compose
- Chrome 브라우저 (Playwright용)
- localhost:8080에서 실행 중인 애플리케이션
