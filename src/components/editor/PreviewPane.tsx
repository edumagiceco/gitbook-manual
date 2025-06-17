'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkHtml from 'remark-html';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

interface PreviewPaneProps {
  content: string;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

export interface PreviewPaneRef {
  scrollToPosition: (ratio: number) => void;
}

export const PreviewPane = forwardRef<PreviewPaneRef, PreviewPaneProps>(({ content, onScroll }, ref) => {
  const [html, setHtml] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mermaidInitialized, setMermaidInitialized] = useState(false);

  // Initialize Mermaid
  useEffect(() => {
    if (typeof window !== 'undefined' && !mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'monospace',
        fontSize: 14,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'linear',
        },
        sequence: {
          useMaxWidth: true,
          wrap: true,
        },
        gantt: {
          useMaxWidth: true,
        },
      });
      setMermaidInitialized(true);
    }
  }, [mermaidInitialized]);

  // Render Mermaid diagrams after HTML is set
  useEffect(() => {
    if (html && mermaidInitialized && scrollContainerRef.current) {
      const renderMermaidDiagrams = async () => {
        const mermaidElements = scrollContainerRef.current?.querySelectorAll('.mermaid');
        if (mermaidElements && mermaidElements.length > 0) {
          try {
            for (let i = 0; i < mermaidElements.length; i++) {
              const element = mermaidElements[i] as HTMLElement;
              const graphDefinition = element.textContent || '';
              
              if (graphDefinition.trim()) {
                const { svg } = await mermaid.render(`mermaid-${Date.now()}-${i}`, graphDefinition);
                element.innerHTML = svg;
              }
            }
          } catch (error) {
            console.error('Failed to render Mermaid diagrams:', error);
          }
        }
      };

      // Small delay to ensure DOM is ready
      setTimeout(renderMermaidDiagrams, 100);
    }
  }, [html, mermaidInitialized]);

  useImperativeHandle(ref, () => ({
    scrollToPosition: (ratio: number) => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        const targetScrollTop = maxScrollTop * ratio;
        scrollContainerRef.current.scrollTop = targetScrollTop;
      }
    }
  }), []);

  const handleScroll = () => {
    if (scrollContainerRef.current && onScroll) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      onScroll(scrollTop, scrollHeight, clientHeight);
    }
  };

  // Custom markdown processing to handle Mermaid code blocks
  const processMermaidCodeBlocks = (markdown: string): string => {
    // Replace ```mermaid code blocks with <div class="mermaid">
    return markdown.replace(/```mermaid\n([\s\S]*?)\n```/g, (match, code) => {
      return `<div class="mermaid">${code.trim()}</div>`;
    });
  };

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        // Pre-process content to handle Mermaid diagrams
        const processedContent = processMermaidCodeBlocks(content);
        
        const result = await remark()
          .use(remarkGfm)
          .use(remarkMath) // Support for math syntax
          .use(remarkHtml, { sanitize: false })
          .use(rehypeKatex) // Render math with KaTeX
          .process(processedContent);
        
        setHtml(result.toString());
      } catch (error) {
        console.error('Failed to process markdown:', error);
        setHtml('<p>Error processing markdown</p>');
      }
    };

    processMarkdown();
  }, [content]);

  return (
    <div 
      ref={scrollContainerRef}
      className="h-full overflow-auto bg-white dark:bg-gray-900"
      onScroll={handleScroll}
    >
      <div 
        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 sm:p-6 lg:p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
});

PreviewPane.displayName = 'PreviewPane';