import { defineConfig, devices } from '@playwright/test';

/**
 * GitBook Manual Site - Playwright 설정
 * 
 * E2E 테스트를 위한 Playwright 설정 파일입니다.
 */

export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests/e2e',
  
  // 전역 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터 설정
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // 전역 테스트 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:8080',
    
    // 브라우저 설정
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // 스크린샷 및 비디오
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 네트워크 설정
    actionTimeout: 10000,
    navigationTimeout: 15000,
    
    // 추적 설정
    trace: 'on-first-retry',
  },

  // 테스트 프로젝트 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // 태블릿 테스트
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 }
      },
    },
  ],

  // 개발 서버 설정 (필요시)
  webServer: {
    command: 'npm run dev',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  
  // 출력 디렉토리
  outputDir: 'test-results/',
  
  // 테스트 타임아웃
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  // 글로벌 설정
  globalSetup: undefined,
  globalTeardown: undefined,
});
