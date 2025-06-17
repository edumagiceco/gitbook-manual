# Docker 사용 가이드

## 필요 사항
- Docker Desktop 설치 (macOS: https://www.docker.com/products/docker-desktop/)
- Docker Compose (Docker Desktop에 포함)

## 빠른 시작

### 1. Docker Desktop 실행 확인
```bash
docker --version
docker-compose --version
```

### 2. 프로덕션 환경 실행
```bash
# Docker Compose 사용 (권장)
make up

# 또는 직접 명령어 사용
docker-compose up -d gitbook-app
```

### 3. 개발 환경 실행 (Hot Reload 지원)
```bash
# Docker Compose 사용
make up-dev

# 또는 직접 명령어 사용
docker-compose --profile dev up -d gitbook-dev
```

### 4. 접속
브라우저에서 `http://localhost:8080` 접속

## 주요 명령어

### Makefile 사용 (권장)
```bash
make build          # 프로덕션 이미지 빌드
make build-dev      # 개발 이미지 빌드
make run            # 프로덕션 컨테이너 실행
make run-dev        # 개발 컨테이너 실행
make up             # docker-compose로 프로덕션 실행
make up-dev         # docker-compose로 개발 환경 실행
make down           # 모든 서비스 중지
make logs           # 로그 확인
make shell          # 컨테이너 쉘 접속
make clean          # 컨테이너/이미지 정리
```

### Docker 직접 사용
```bash
# 프로덕션 빌드 및 실행
docker build -t gitbook-manual:latest .
docker run -d -p 8080:8080 --name gitbook-manual gitbook-manual:latest

# 개발 환경 빌드 및 실행
docker build -t gitbook-manual:dev -f Dockerfile.dev .
docker run -d -p 8080:8080 -v $(pwd):/app -v /app/node_modules -v /app/.next --name gitbook-dev gitbook-manual:dev
```

## 문제 해결

### Docker Desktop이 실행되지 않을 때
1. Docker Desktop 앱 실행
2. 상태바에서 Docker 아이콘 확인
3. "Docker Desktop is running" 메시지 확인

### 포트 충돌 (8080 already in use)
```bash
# 기존 프로세스 확인 및 종료
lsof -i :8080
kill -9 [PID]

# 또는 Docker 컨테이너 확인
docker ps
docker stop [CONTAINER_ID]
```

### 빌드 에러
```bash
# 캐시 없이 재빌드
docker build --no-cache -t gitbook-manual:latest .

# 시스템 정리
docker system prune -a
```

### 권한 문제 (macOS)
```bash
# Docker.sock 권한 확인
ls -la /var/run/docker.sock

# 필요시 Docker Desktop 재시작
```

## 개발 팁

### 1. 개발 환경 추천 설정
```bash
# docker-compose.yml의 gitbook-dev 서비스 사용
# 파일 변경시 자동 리로드 지원
make up-dev
```

### 2. 로그 실시간 확인
```bash
make logs
# 또는
docker-compose logs -f gitbook-dev
```

### 3. 컨테이너 내부 접속
```bash
make shell
# 또는
docker exec -it gitbook-manual sh
```

### 4. 환경 변수 설정
`.env` 파일 생성:
```env
NODE_ENV=development
PORT=8080
```

## 배포 준비

### 프로덕션 이미지 최적화
- Multi-stage 빌드로 이미지 크기 최소화
- Node.js Alpine 이미지 사용
- Next.js standalone 모드 활용

### 이미지 크기 확인
```bash
docker images | grep gitbook-manual
```

### 헬스체크 확인
```bash
curl http://localhost:8080
```