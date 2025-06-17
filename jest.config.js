/**
 * Jest 설정 파일
 * GitBook Manual Site 유닛 테스트 설정
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 애플리케이션 루트 디렉토리 경로
  dir: './',
})

// Jest에 전달할 커스텀 설정
const customJestConfig = {
  // 테스트 환경 설정
  testEnvironment: 'jsdom',
  
  // 테스트 파일 패턴
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}'
  ],
  
  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  
  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // 모듈 맵핑
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  
  // 테스트 셋업 파일
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  
  // 변환 제외 패턴
  transformIgnorePatterns: [
    'node_modules/(?!(monaco-editor)/)',
  ],
  
  // 모의 객체 설정
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 테스트 타임아웃
  testTimeout: 10000,
  
  // Verbose 출력
  verbose: true,
  
  // 캐시 설정
  clearMocks: true,
  restoreMocks: true,
}

// createJestConfig는 비동기이므로 내보내기
module.exports = createJestConfig(customJestConfig)
