# GitBook 스타일 매뉴얼 사이트 개발 - 2단계 계획

## 📋 프로젝트 개요
- **단계명**: 콘텐츠 관리 시스템 (CMS)
- **기간**: 4주 (2024-12-23 ~ 2025-01-19)
- **목표**: 문서 작성, 편집, 관리를 위한 완전한 CMS 구축

## 🎯 2단계: 콘텐츠 관리 시스템 구현

### 주요 기능
- [x] 실시간 마크다운 에디터
- [x] 문서 트리 구조 관리
- [x] 이미지 업로드 시스템
- [x] 검색 기능 구현
- [ ] 버전 관리 (간단한 히스토리)
- [ ] 문서 가져오기/내보내기

### 기술 스택 추가
- **Editor**: Monaco Editor 또는 CodeMirror
- **File Management**: Next.js API Routes
- **Storage**: 로컬 파일 시스템 (추후 S3 연동)
- **Search**: Flexsearch 또는 Fuse.js
- **State Management**: Zustand 또는 Jotai

## 📅 상세 개발 일정

### Week 1: 마크다운 에디터 구현 (12/23-12/29)
**목표**: 실시간 마크다운 편집기 구축

#### Day 1-2: 에디터 컴포넌트 설계
- [ ] Monaco Editor 또는 CodeMirror 통합
- [ ] 마크다운 하이라이팅 설정
- [ ] 실시간 프리뷰 패널 구현
- [ ] 동기화된 스크롤 기능

#### Day 3-4: 편집 기능 강화
- [ ] 마크다운 툴바 구현
  - 헤딩, 볼드, 이탤릭
  - 리스트, 체크박스
  - 링크, 이미지 삽입
  - 코드 블록
- [ ] 단축키 지원 (Cmd/Ctrl + B, I, K 등)
- [ ] 자동 저장 기능

#### Day 5-7: 에디터 최적화
- [ ] 대용량 문서 처리 최적화
- [ ] 언두/리두 기능
- [ ] 찾기/바꾸기 기능
- [ ] 에디터 테마 설정

### Week 2: 문서 트리 구조 관리 (12/30-1/5)
**목표**: 파일 시스템 기반 문서 관리

#### Day 1-3: API 라우트 구축
- [ ] 파일 CRUD API 구현
  - GET /api/documents (목록)
  - GET /api/documents/[path] (읽기)
  - POST /api/documents (생성)
  - PUT /api/documents/[path] (수정)
  - DELETE /api/documents/[path] (삭제)
- [ ] 디렉토리 관리 API
- [ ] 파일 이동/복사 API

#### Day 4-5: 파일 탐색기 UI
- [ ] 트리 뷰 컴포넌트 구현
- [ ] 드래그 앤 드롭 지원
- [ ] 컨텍스트 메뉴 (우클릭)
- [ ] 파일/폴더 아이콘

#### Day 6-7: 문서 메타데이터
- [ ] Frontmatter 파싱
- [ ] 문서 속성 관리 (제목, 태그, 날짜)
- [ ] 문서 상태 표시 (수정됨, 저장됨)

### Week 3: 이미지 업로드 및 검색 (1/6-1/12)
**목표**: 미디어 관리 및 검색 기능

#### Day 1-2: 이미지 업로드 시스템
- [ ] 드래그 앤 드롭 업로드
- [ ] 클립보드 붙여넣기 지원
- [ ] 이미지 최적화 (리사이징, 압축)
- [ ] 업로드 진행률 표시

#### Day 3-4: 미디어 관리
- [ ] 이미지 갤러리 뷰
- [ ] 이미지 메타데이터 관리
- [ ] 이미지 삭제 및 정리
- [ ] 이미지 CDN 연동 준비

#### Day 5-6: 검색 기능 구현
- [ ] 전문 검색 엔진 통합
- [ ] 검색 인덱싱
- [ ] 검색 결과 하이라이팅
- [ ] 필터 및 정렬 옵션

#### Day 7: 검색 UI/UX
- [ ] 검색 모달 디자인
- [ ] 실시간 검색 제안
- [ ] 최근 검색 기록
- [ ] 고급 검색 옵션

### Week 4: 고급 기능 및 마무리 (1/13-1/19)
**목표**: 버전 관리 및 가져오기/내보내기

#### Day 1-2: 버전 관리
- [ ] 변경 사항 추적
- [ ] 간단한 히스토리 뷰
- [ ] 버전 비교 기능
- [ ] 롤백 기능

#### Day 3-4: 가져오기/내보내기
- [ ] Markdown 파일 가져오기
- [ ] 폴더 구조 유지한 일괄 가져오기
- [ ] ZIP 내보내기
- [ ] PDF 내보내기 (선택사항)

#### Day 5-6: 통합 테스트
- [ ] 에디터-파일시스템 통합
- [ ] 검색 기능 검증
- [ ] 성능 최적화
- [ ] 버그 수정

#### Day 7: 문서화
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성
- [ ] 개발자 문서 업데이트

## 🛠️ 기술적 구현 상세

### 마크다운 에디터 아키텍처
```typescript
interface EditorState {
  content: string;
  cursor: CursorPosition;
  selection: Selection;
  history: HistoryStack;
  isDirty: boolean;
}

interface Document {
  id: string;
  path: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}
```

### API 엔드포인트 설계
```
/api/documents
  GET    - 문서 목록 조회
  POST   - 새 문서 생성

/api/documents/[...path]
  GET    - 문서 내용 조회
  PUT    - 문서 수정
  DELETE - 문서 삭제

/api/search
  GET    - 문서 검색

/api/upload
  POST   - 이미지 업로드

/api/export
  POST   - 문서 내보내기
```

### 파일 구조
```
/Users/magic/data/claude/gitbook/
├── src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── PreviewPane.tsx
│   │   ├── file-explorer/
│   │   │   ├── FileTree.tsx
│   │   │   ├── FileNode.tsx
│   │   │   └── ContextMenu.tsx
│   │   └── search/
│   │       ├── SearchModal.tsx
│   │       └── SearchResults.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── documents.ts
│   │   │   ├── search.ts
│   │   │   └── upload.ts
│   │   └── utils/
│   │       ├── markdown.ts
│   │       └── file.ts
│   └── app/
│       ├── api/
│       │   ├── documents/
│       │   ├── search/
│       │   └── upload/
│       └── editor/
│           └── page.tsx
```

## 📊 완료 기준

### 기능적 요구사항
- [ ] 마크다운 에디터로 문서 작성/편집 가능
- [ ] 파일 트리에서 문서 관리 가능
- [ ] 이미지 업로드 및 관리 가능
- [ ] 전문 검색 기능 작동
- [ ] 문서 버전 히스토리 확인 가능

### 기술적 요구사항
- [ ] API 응답 시간 500ms 이내
- [ ] 에디터 입력 지연 없음
- [ ] 대용량 문서 (10MB) 처리 가능
- [ ] 동시 편집 시 데이터 무결성 보장

## 🚀 다음 단계 (3단계 준비)
2단계 완료 후 3단계 "협업 및 배포" 개발 준비:
- 사용자 인증 시스템
- 권한 관리
- 실시간 협업 편집
- 댓글 및 피드백 시스템
- 배포 자동화

---
**작성일**: 2024-12-23
**상태**: 개발 준비 완료