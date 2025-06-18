'use client';

import { useState, useMemo } from 'react';
import { 
  Clock, 
  Hash, 
  Type, 
  AlignLeft,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  calculateDocumentStats, 
  analyzeLanguages,
  formatReadingTime
} from '@/lib/document-stats';

interface DocumentStatsProps {
  content: string;
  className?: string;
  mode?: 'compact' | 'detailed';
}

export function DocumentStats({ 
  content, 
  className,
  mode = 'detailed'
}: DocumentStatsProps) {
  const [showDetails, setShowDetails] = useState(false);

  // 문서 통계 계산
  const stats = useMemo(() => {
    return calculateDocumentStats(content);
  }, [content]);

  // 언어 통계 계산
  const langStats = useMemo(() => {
    return analyzeLanguages(content);
  }, [content]);

  // 간단한 뷰 (상태바용)
  if (mode === 'compact') {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        <div className="flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 opacity-60" />
          <span>{stats.wordCount.toLocaleString()}개 단어</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 opacity-60" />
          <span>{stats.totalCharacters.toLocaleString()}자</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 opacity-60" />
          <span>{formatReadingTime(stats.readingTime)}</span>
        </div>
      </div>
    );
  }

  // 상세 뷰 (패널용)
  return (
    <div className={cn("space-y-4", className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          문서 통계
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          title={showDetails ? "간단히 보기" : "자세히 보기"}
        >
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Type}
          label="단어 수"
          value={stats.wordCount.toLocaleString()}
          unit="개"
        />
        <StatCard
          icon={Hash}
          label="문자 수"
          value={stats.totalCharacters.toLocaleString()}
          unit="자"
        />
        <StatCard
          icon={Clock}
          label="읽기 시간"
          value={stats.readingTime.toString()}
          unit="분"
        />
        <StatCard
          icon={AlignLeft}
          label="단락 수"
          value={stats.paragraphCount.toString()}
          unit="개"
        />
      </div>

      {/* 상세 통계 */}
      {showDetails && (
        <div className="space-y-3 pt-3 border-t">
          {/* 문자 통계 */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">문자 통계</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">공백 포함</span>
                <span>{stats.totalCharacters.toLocaleString()}자</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">공백 제외</span>
                <span>{stats.charactersNoSpaces.toLocaleString()}자</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">줄 수</span>
                <span>{stats.lineCount.toLocaleString()}줄</span>
              </div>
            </div>
          </div>

          {/* 언어 분포 */}
          {(langStats.korean > 0 || langStats.english > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">언어 분포</h4>
              <div className="space-y-1.5 text-sm">
                {langStats.korean > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">한글</span>
                    <span>{langStats.korean.toLocaleString()}자</span>
                  </div>
                )}
                {langStats.english > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">영어</span>
                    <span>{langStats.english.toLocaleString()}자</span>
                  </div>
                )}
                {langStats.numbers > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">숫자</span>
                    <span>{langStats.numbers.toLocaleString()}자</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 시간 통계 */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">예상 시간</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">읽기</span>
                <span>{formatReadingTime(stats.readingTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">말하기</span>
                <span>{formatReadingTime(stats.speakingTime)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 읽기 진행률 바 (선택사항) */}
      <ReadingProgress 
        current={0} 
        total={stats.readingTime} 
        className="mt-4"
      />
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">
          {value}
          <span className="text-sm font-normal text-muted-foreground ml-0.5">
            {unit}
          </span>
        </p>
      </div>
    </div>
  );
}

// 읽기 진행률 표시 컴포넌트
function ReadingProgress({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          읽기 진행률
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}