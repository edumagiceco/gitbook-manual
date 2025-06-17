/**
 * Jest 셋업 파일
 * 테스트 실행 전 초기화 코드
 */

import '@testing-library/jest-dom'

// Monaco Editor 모의 객체
Object.defineProperty(window, 'monaco', {
  value: {
    editor: {
      create: jest.fn(),
      defineTheme: jest.fn(),
      setTheme: jest.fn(),
    },
    languages: {
      register: jest.fn(),
      setMonarchTokensProvider: jest.fn(),
    },
  },
  writable: true,
});

// ResizeObserver 모의 객체
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver 모의 객체
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// matchMedia 모의 객체
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// localStorage 모의 객체
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// sessionStorage 모의 객체
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// fetch 모의 객체
global.fetch = jest.fn();

// 전역 변수 초기화
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
});

// 에러 처리
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// 테스트 환경 설정
jest.setTimeout(10000);
