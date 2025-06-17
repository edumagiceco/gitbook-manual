'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Replace, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: unknown; // Monaco editor instance
  className?: string;
}

interface FindOptions {
  matchCase: boolean;
  matchWholeWord: boolean;
  useRegex: boolean;
  preserveCase: boolean;
}

interface SearchMatch {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
}

export function FindReplaceModal({ isOpen, onClose, editor, className }: FindReplaceModalProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [showReplace, setShowReplace] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const [options, setOptions] = useState<FindOptions>({
    matchCase: false,
    matchWholeWord: false,
    useRegex: false,
    preserveCase: false,
  });

  const findInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const currentMatchesRef = useRef<SearchMatch[]>([]);

  // Helper functions
  const getRegexFlags = useCallback((): string => {
    let flags = 'g';
    if (!options.matchCase) flags += 'i';
    return flags;
  }, [options.matchCase]);

  const escapeRegex = useCallback((text: string): string => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }, []);

  // Save search to history
  const saveSearchToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setSearchHistory(prev => {
      const newHistory = [searchTerm, ...prev.filter(item => item !== searchTerm)].slice(0, 10);
      try {
        localStorage.setItem('find-replace-history', JSON.stringify(newHistory));
      } catch {
        // Ignore localStorage errors
      }
      return newHistory;
    });
  }, []);

  // Focus find input when modal opens
  useEffect(() => {
    if (isOpen && findInputRef.current) {
      findInputRef.current.focus();
      
      // Get selected text from editor if any
      if (editor) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const editorInstance = editor as any;
          const selection = editorInstance.getSelection();
          if (selection && !selection.isEmpty()) {
            const selectedText = editorInstance.getModel().getValueInRange(selection);
            setFindText(selectedText);
          }
        } catch {
          // Ignore errors when getting selection
        }
      }
    }
  }, [isOpen, editor]);

  // Load search history from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const history = localStorage.getItem('find-replace-history');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [isOpen]);

  // Update matches when find text or options change
  useEffect(() => {
    const updateMatches = () => {
      if (!editor || !findText) {
        setCurrentMatch(0);
        setTotalMatches(0);
        currentMatchesRef.current = [];
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const editorInstance = editor as any;
        const model = editorInstance.getModel();
        const flags = getRegexFlags();
        const regex = options.useRegex ? new RegExp(findText, flags) : new RegExp(escapeRegex(findText), flags);
        
        const matches = model.findMatches(regex, true, options.useRegex, options.matchCase, options.matchWholeWord ? '\\b' : null, false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentMatchesRef.current = matches.map((match: any) => ({
          range: match.range,
          text: model.getValueInRange(match.range)
        }));
        
        setTotalMatches(matches.length);
        
        if (matches.length > 0) {
          setCurrentMatch(1);
          // Highlight first match
          editorInstance.setSelection(matches[0].range);
          editorInstance.revealRangeInCenter(matches[0].range);
          
          // Save to search history
          saveSearchToHistory(findText);
        } else {
          setCurrentMatch(0);
        }
      } catch (error) {
        console.error('Find error:', error);
        setTotalMatches(0);
        setCurrentMatch(0);
        currentMatchesRef.current = [];
      }
    };

    const timeoutId = setTimeout(updateMatches, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [findText, options, editor, saveSearchToHistory, getRegexFlags, escapeRegex]);

  const findNext = useCallback(() => {
    if (!editor || !findText || totalMatches === 0 || currentMatchesRef.current.length === 0) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editorInstance = editor as any;
      const currentPosition = editorInstance.getPosition();
      
      // Find next match after current position
      let nextMatchIndex = currentMatchesRef.current.findIndex((match: SearchMatch) => 
        match.range.startLineNumber > currentPosition.lineNumber || 
        (match.range.startLineNumber === currentPosition.lineNumber && match.range.startColumn > currentPosition.column)
      );
      
      if (nextMatchIndex === -1) {
        // Wrap to beginning
        nextMatchIndex = 0;
        setCurrentMatch(1);
      } else {
        setCurrentMatch(nextMatchIndex + 1);
      }
      
      const nextMatch = currentMatchesRef.current[nextMatchIndex];
      editorInstance.setSelection(nextMatch.range);
      editorInstance.revealRangeInCenter(nextMatch.range);
    } catch (error) {
      console.error('Find next error:', error);
    }
  }, [editor, findText, totalMatches]);

  const findPrevious = useCallback(() => {
    if (!editor || !findText || totalMatches === 0 || currentMatchesRef.current.length === 0) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editorInstance = editor as any;
      const currentPosition = editorInstance.getPosition();
      
      // Find previous match before current position
      const reversedMatches = [...currentMatchesRef.current].reverse();
      let prevMatchIndex = reversedMatches.findIndex((match: SearchMatch) => 
        match.range.startLineNumber < currentPosition.lineNumber || 
        (match.range.startLineNumber === currentPosition.lineNumber && match.range.startColumn < currentPosition.column)
      );
      
      if (prevMatchIndex === -1) {
        // Wrap to end
        prevMatchIndex = 0;
        setCurrentMatch(totalMatches);
      } else {
        const originalIndex = currentMatchesRef.current.indexOf(reversedMatches[prevMatchIndex]);
        setCurrentMatch(originalIndex + 1);
      }
      
      const prevMatch = prevMatchIndex === -1 ? 
        currentMatchesRef.current[currentMatchesRef.current.length - 1] : 
        reversedMatches[prevMatchIndex];
      
      editorInstance.setSelection(prevMatch.range);
      editorInstance.revealRangeInCenter(prevMatch.range);
    } catch (error) {
      console.error('Find previous error:', error);
    }
  }, [editor, findText, totalMatches]);

  const replaceNext = () => {
    if (!editor || !findText || totalMatches === 0) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editorInstance = editor as any;
      const selection = editorInstance.getSelection();
      const selectedText = editorInstance.getModel().getValueInRange(selection);
      
      // Check if current selection matches find text
      const flags = getRegexFlags();
      const regex = options.useRegex ? new RegExp(findText, flags) : new RegExp(escapeRegex(findText), flags);
      
      if (regex.test(selectedText)) {
        let replacement = replaceText;
        
        if (options.preserveCase && !options.useRegex) {
          replacement = preserveCase(selectedText, replaceText);
        }
        
        editorInstance.executeEdits('replace', [{
          range: selection,
          text: replacement
        }]);
        
        // Find next occurrence
        findNext();
      } else {
        // Just find next if current selection doesn't match
        findNext();
      }
    } catch (error) {
      console.error('Replace next error:', error);
    }
  };

  const replaceAll = () => {
    if (!editor || !findText) return;

    setIsReplacing(true);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editorInstance = editor as any;
      const model = editorInstance.getModel();
      const flags = getRegexFlags();
      const regex = options.useRegex ? new RegExp(findText, flags) : new RegExp(escapeRegex(findText), flags);
      
      const matches = model.findMatches(regex, true, options.useRegex, options.matchCase, options.matchWholeWord ? '\\b' : null, false);
      
      if (matches.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const edits = matches.map((match: any) => {
          let replacement = replaceText;
          
          if (options.preserveCase && !options.useRegex) {
            const originalText = model.getValueInRange(match.range);
            replacement = preserveCase(originalText, replaceText);
          }
          
          return {
            range: match.range,
            text: replacement
          };
        });
        
        editorInstance.executeEdits('replace-all', edits);
        
        // Update match count
        setTotalMatches(0);
        setCurrentMatch(0);
      }
    } catch (error) {
      console.error('Replace all error:', error);
    } finally {
      setIsReplacing(false);
    }
  };

  const preserveCase = (original: string, replacement: string): string => {
    if (original === original.toLowerCase()) {
      return replacement.toLowerCase();
    } else if (original === original.toUpperCase()) {
      return replacement.toUpperCase();
    } else if (original[0] === original[0].toUpperCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1).toLowerCase();
    }
    return replacement;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        findPrevious();
      } else {
        findNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const toggleOption = (option: keyof FindOptions) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const OptionButton = ({ 
    active, 
    onClick, 
    title, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    title: string; 
    children: React.ReactNode; 
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 text-xs rounded border transition-colors",
        active 
          ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600"
          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600"
      )}
      title={title}
    >
      {children}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div className={cn("absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-96", className)}>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find{showReplace ? ' & Replace' : ''}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded"
              title="Toggle Replace"
            >
              <Replace className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Find Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={findInputRef}
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Find"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {totalMatches > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                  {currentMatch}/{totalMatches}
                </div>
              )}
              
              {/* Search History Dropdown */}
              {searchHistory.length > 0 && findText === '' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
                  <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                    Recent searches
                  </div>
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setFindText(item)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={findPrevious}
                disabled={totalMatches === 0}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                title="Find Previous (Shift+Enter)"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={findNext}
                disabled={totalMatches === 0}
                className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                title="Find Next (Enter)"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <OptionButton
              active={options.matchCase}
              onClick={() => toggleOption('matchCase')}
              title="Match Case"
            >
              Aa
            </OptionButton>
            <OptionButton
              active={options.matchWholeWord}
              onClick={() => toggleOption('matchWholeWord')}
              title="Match Whole Word"
            >
              Ab
            </OptionButton>
            <OptionButton
              active={options.useRegex}
              onClick={() => toggleOption('useRegex')}
              title="Use Regular Expression"
            >
              .*
            </OptionButton>
          </div>
        </div>

        {/* Replace Input */}
        {showReplace && (
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  ref={replaceInputRef}
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Replace"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={replaceNext}
                  disabled={totalMatches === 0 || isReplacing}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Replace Next"
                >
                  Replace
                </button>
                <button
                  onClick={replaceAll}
                  disabled={totalMatches === 0 || isReplacing}
                  className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Replace All"
                >
                  {isReplacing && <RotateCcw className="h-3 w-3 animate-spin" />}
                  All
                </button>
              </div>
            </div>

            {/* Replace Options */}
            <div className="flex items-center gap-2">
              <OptionButton
                active={options.preserveCase}
                onClick={() => toggleOption('preserveCase')}
                title="Preserve Case"
              >
                aA
              </OptionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
