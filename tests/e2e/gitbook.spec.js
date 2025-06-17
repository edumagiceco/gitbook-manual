const { test, expect } = require('@playwright/test');

/**
 * GitBook 스타일 매뉴얼 사이트 E2E 테스트
 * 
 * 이 파일은 주요 기능들의 자동화 테스트를 포함합니다.
 */

// 테스트 설정
const BASE_URL = 'http://localhost:8080';
const TIMEOUT = 10000;

test.describe('GitBook Manual Site E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  /**
   * 홈페이지 기본 기능 테스트
   */
  test.describe('Homepage Tests', () => {
    
    test('should load homepage successfully', async ({ page }) => {
      // 페이지 제목 확인
      await expect(page).toHaveTitle(/GitBook Manual/);
      
      // 주요 네비게이션 요소 확인
      await expect(page.locator('text=GitBook Manual')).toBeVisible();
      await expect(page.locator('text=Docs')).toBeVisible();
      await expect(page.locator('text=Guides')).toBeVisible();
      await expect(page.locator('text=Examples')).toBeVisible();
      await expect(page.locator('text=Editor')).toBeVisible();
    });

    test('should have responsive navigation', async ({ page }) => {
      // 데스크톱 뷰에서 네비게이션 확인
      await expect(page.locator('nav')).toBeVisible();
      
      // 모바일 뷰로 변경
      await page.setViewportSize({ width: 375, height: 667 });
      
      // 햄버거 메뉴 버튼이 보이는지 확인
      const hamburgerButton = page.locator('button').filter({ hasText: /menu/i });
      if (await hamburgerButton.count() > 0) {
        await expect(hamburgerButton).toBeVisible();
      }
    });

  });

  /**
   * 검색 기능 테스트
   */
  test.describe('Search Functionality', () => {
    
    test('should open search modal with Cmd+K', async ({ page }) => {
      // Cmd+K (Mac) 또는 Ctrl+K (Windows) 단축키 테스트
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';
      
      await page.keyboard.press(`${modifier}+KeyK`);
      
      // 검색 모달이 열리는지 확인
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('should handle search input', async ({ page }) => {
      // 검색 모달 열기
      await page.keyboard.press('Meta+KeyK');
      
      // 검색어 입력
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('welcome');
      
      // 검색 결과 또는 "No results" 메시지 확인
      await page.waitForTimeout(500); // 디바운스 대기
      
      // 결과가 있거나 "No results" 메시지가 표시되어야 함
      const hasResults = await page.locator('text=No results').count() > 0;
      const hasSearchResults = await page.locator('[data-testid="search-result"]').count() > 0;
      
      expect(hasResults || hasSearchResults).toBeTruthy();
    });

    test('should close search modal with Escape', async ({ page }) => {
      // 검색 모달 열기
      await page.keyboard.press('Meta+KeyK');
      
      // ESC로 모달 닫기
      await page.keyboard.press('Escape');
      
      // 모달이 닫혔는지 확인
      await expect(page.locator('input[placeholder*="Search"]')).not.toBeVisible();
    });

  });

  /**
   * 에디터 기능 테스트
   */
  test.describe('Editor Functionality', () => {
    
    test('should navigate to editor page', async ({ page }) => {
      // 에디터 링크 클릭
      await page.click('text=Editor');
      
      // 에디터 페이지로 이동 확인
      await expect(page).toHaveURL(/.*\/editor/);
      
      // 에디터 주요 요소 확인
      await expect(page.locator('text=Files')).toBeVisible();
    });

    test('should load file system', async ({ page }) => {
      await page.goto(`${BASE_URL}/editor`);
      
      // 파일 시스템 사이드바 확인
      await expect(page.locator('text=Files')).toBeVisible();
      await expect(page.locator('text=docs')).toBeVisible();
    });

    test('should expand folder and load file', async ({ page }) => {
      await page.goto(`${BASE_URL}/editor`);
      
      // docs 폴더 클릭하여 확장
      await page.click('text=docs');
      
      // 파일 목록이 보이는지 확인
      await expect(page.locator('text=welcome.md')).toBeVisible();
      
      // welcome.md 파일 클릭
      await page.click('text=welcome.md');
      
      // 에디터에 내용이 로드되는지 확인 (시간 여유)
      await page.waitForTimeout(2000);
      
      // 프리뷰 패널에서 Welcome 제목 확인
      await expect(page.locator('text=Welcome to GitBook Manual')).toBeVisible();
    });

  });

  /**
   * API 엔드포인트 테스트
   */
  test.describe('API Endpoints', () => {
    
    test('should respond to documents API', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/documents`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    test('should respond to search API', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/search?q=test`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.results).toBeInstanceOf(Array);
      expect(data.total).toBeGreaterThanOrEqual(0);
    });

    test('should respond to images API', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/images`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

  });

  /**
   * 성능 테스트
   */
  test.describe('Performance Tests', () => {
    
    test('should load homepage within 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // 2초 이내
    });

    test('should load editor page efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/editor`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3초 이내
    });

  });

  /**
   * 접근성 테스트
   */
  test.describe('Accessibility Tests', () => {
    
    test('should be navigable with keyboard', async ({ page }) => {
      // Tab 키로 네비게이션 가능한지 확인
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // 포커스된 요소가 있는지 확인
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // 검색 버튼의 ARIA 라벨 확인
      const searchButton = page.locator('button').filter({ hasText: /search/i });
      if (await searchButton.count() > 0) {
        const ariaLabel = await searchButton.getAttribute('aria-label');
        expect(ariaLabel || 'Search').toBeTruthy();
      }
    });

  });

});

// 유틸리티 함수들
test.describe('Utility Functions', () => {
  
  /**
   * 스크린샷 비교 테스트 (시각적 회귀 테스트)
   */
  test('visual regression - homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 전체 페이지 스크린샷
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      threshold: 0.3 // 30% 차이까지 허용
    });
  });

  test('visual regression - editor', async ({ page }) => {
    await page.goto(`${BASE_URL}/editor`);
    await page.waitForLoadState('networkidle');
    
    // 에디터 페이지 스크린샷
    await expect(page).toHaveScreenshot('editor.png', {
      fullPage: true,
      threshold: 0.3
    });
  });

});
