export interface DocumentStats {
  /** 총 문자 수 (공백 포함) */
  totalCharacters: number;
  /** 총 문자 수 (공백 제외) */
  charactersNoSpaces: number;
  /** 총 단어 수 */
  wordCount: number;
  /** 총 줄 수 */
  lineCount: number;
  /** 총 단락 수 */
  paragraphCount: number;
  /** 예상 읽기 시간 (분) */
  readingTime: number;
  /** 예상 말하기 시간 (분) */
  speakingTime: number;
}

export interface LanguageStats {
  korean: number;
  english: number;
  numbers: number;
  other: number;
}

// 평균 읽기 속도 (단어/분)
const READING_SPEED = {
  KOREAN: 500,      // 한국어 평균 읽기 속도 (음절/분)
  ENGLISH: 200,     // 영어 평균 읽기 속도 (단어/분)
  MIXED: 300,       // 혼합 콘텐츠 평균 읽기 속도
};

// 평균 말하기 속도 (단어/분)
const SPEAKING_SPEED = {
  KOREAN: 350,      // 한국어 평균 말하기 속도 (음절/분)
  ENGLISH: 150,     // 영어 평균 말하기 속도 (단어/분)
  MIXED: 200,       // 혼합 콘텐츠 평균 말하기 속도
};

/**
 * 문자열이 한글인지 확인
 */
function isKorean(char: string): boolean {
  const code = char.charCodeAt(0);
  // 한글 음절 (가-힣) 및 한글 자모 (ㄱ-ㅣ)
  return (code >= 0xAC00 && code <= 0xD7AF) || 
         (code >= 0x1100 && code <= 0x11FF) ||
         (code >= 0x3130 && code <= 0x318F);
}

/**
 * 문자열이 영어인지 확인
 */
function isEnglish(char: string): boolean {
  return /[a-zA-Z]/.test(char);
}

/**
 * 문자열이 숫자인지 확인
 */
function isNumber(char: string): boolean {
  return /[0-9]/.test(char);
}

/**
 * 언어별 문자 수 계산
 */
export function analyzeLanguages(text: string): LanguageStats {
  const stats: LanguageStats = {
    korean: 0,
    english: 0,
    numbers: 0,
    other: 0,
  };

  for (const char of text) {
    if (isKorean(char)) {
      stats.korean++;
    } else if (isEnglish(char)) {
      stats.english++;
    } else if (isNumber(char)) {
      stats.numbers++;
    } else if (!/\s/.test(char)) {
      stats.other++;
    }
  }

  return stats;
}

/**
 * 한국어 단어 수 계산
 * 한국어는 조사를 제외한 어절 단위로 계산
 */
function countKoreanWords(text: string): number {
  // 공백으로 분리된 어절 수 계산
  const words = text.split(/\s+/).filter(word => {
    // 한글이 포함된 어절만 계산
    return /[가-힣]/.test(word);
  });
  return words.length;
}

/**
 * 영어 단어 수 계산
 */
function countEnglishWords(text: string): number {
  // 영어 단어 패턴 매칭
  const words = text.match(/[a-zA-Z]+/g) || [];
  return words.length;
}

/**
 * 문서 통계 계산
 */
export function calculateDocumentStats(content: string): DocumentStats {
  // 기본 통계
  const totalCharacters = content.length;
  const charactersNoSpaces = content.replace(/\s/g, '').length;
  const lines = content.split('\n');
  const lineCount = lines.length;
  
  // 빈 줄을 제외한 단락 수 계산
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  // 언어별 분석
  const langStats = analyzeLanguages(content);
  
  // 단어 수 계산 (한국어와 영어 구분)
  const koreanWords = countKoreanWords(content);
  const englishWords = countEnglishWords(content);
  const totalWords = koreanWords + englishWords;

  // 읽기 시간 계산 (언어 비율에 따라 가중 평균)
  const totalChars = langStats.korean + langStats.english;
  let readingTime = 0;
  let speakingTime = 0;

  if (totalChars > 0) {
    // 한국어는 음절 수로, 영어는 단어 수로 계산
    const koreanReadingTime = langStats.korean / READING_SPEED.KOREAN;
    const englishReadingTime = englishWords / READING_SPEED.ENGLISH;
    readingTime = Math.ceil(koreanReadingTime + englishReadingTime);

    const koreanSpeakingTime = langStats.korean / SPEAKING_SPEED.KOREAN;
    const englishSpeakingTime = englishWords / SPEAKING_SPEED.ENGLISH;
    speakingTime = Math.ceil(koreanSpeakingTime + englishSpeakingTime);
  }

  // 최소 1분으로 설정
  readingTime = Math.max(1, readingTime);
  speakingTime = Math.max(1, speakingTime);

  return {
    totalCharacters,
    charactersNoSpaces,
    wordCount: totalWords,
    lineCount,
    paragraphCount,
    readingTime,
    speakingTime,
  };
}

/**
 * 통계를 사람이 읽기 쉬운 형식으로 포맷
 */
export function formatStats(stats: DocumentStats): string {
  const parts: string[] = [];
  
  // 단어 수
  parts.push(`${stats.wordCount.toLocaleString()}개 단어`);
  
  // 문자 수
  parts.push(`${stats.totalCharacters.toLocaleString()}자`);
  
  // 읽기 시간
  if (stats.readingTime === 1) {
    parts.push('읽기 시간 약 1분');
  } else {
    parts.push(`읽기 시간 약 ${stats.readingTime}분`);
  }
  
  return parts.join(' · ');
}

/**
 * 상세 통계를 사람이 읽기 쉬운 형식으로 포맷
 */
export function formatDetailedStats(stats: DocumentStats, langStats?: LanguageStats): string[] {
  const lines: string[] = [];
  
  // 기본 통계
  lines.push(`총 문자 수: ${stats.totalCharacters.toLocaleString()}자 (공백 포함)`);
  lines.push(`총 문자 수: ${stats.charactersNoSpaces.toLocaleString()}자 (공백 제외)`);
  lines.push(`총 단어 수: ${stats.wordCount.toLocaleString()}개`);
  lines.push(`총 줄 수: ${stats.lineCount.toLocaleString()}줄`);
  lines.push(`총 단락 수: ${stats.paragraphCount.toLocaleString()}개`);
  
  // 시간 통계
  lines.push('');
  lines.push(`예상 읽기 시간: ${stats.readingTime}분`);
  lines.push(`예상 말하기 시간: ${stats.speakingTime}분`);
  
  // 언어 통계
  if (langStats) {
    lines.push('');
    lines.push('언어별 분포:');
    if (langStats.korean > 0) {
      lines.push(`  한글: ${langStats.korean.toLocaleString()}자`);
    }
    if (langStats.english > 0) {
      lines.push(`  영어: ${langStats.english.toLocaleString()}자`);
    }
    if (langStats.numbers > 0) {
      lines.push(`  숫자: ${langStats.numbers.toLocaleString()}자`);
    }
    if (langStats.other > 0) {
      lines.push(`  기타: ${langStats.other.toLocaleString()}자`);
    }
  }
  
  return lines;
}

/**
 * 읽기 시간을 사람이 읽기 쉬운 형식으로 포맷
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '1분 미만';
  } else if (minutes === 1) {
    return '약 1분';
  } else if (minutes < 60) {
    return `약 ${minutes}분`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `약 ${hours}시간`;
    } else {
      return `약 ${hours}시간 ${remainingMinutes}분`;
    }
  }
}