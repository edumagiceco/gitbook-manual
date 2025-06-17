'use client';

import { useState, useEffect } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

interface PreviewPaneProps {
  content: string;
}

export function PreviewPane({ content }: PreviewPaneProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const result = await remark()
          .use(remarkGfm)
          .use(remarkHtml, { sanitize: false })
          .process(content);
        
        setHtml(result.toString());
      } catch (error) {
        console.error('Failed to process markdown:', error);
        setHtml('<p>Error processing markdown</p>');
      }
    };

    processMarkdown();
  }, [content]);

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-900">
      <div 
        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 sm:p-6 lg:p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}