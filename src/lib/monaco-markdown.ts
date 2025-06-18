'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Markdown completion provider for Monaco Editor
export const createMarkdownCompletionProvider = (monaco: any) => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provideCompletionItems: (model: any, position: any) => {
      // Get text until current position for context
      // const textUntilPosition = model.getValueInRange({
      //   startLineNumber: 1,
      //   startColumn: 1,
      //   endLineNumber: position.lineNumber,
      //   endColumn: position.column,
      // });

      const suggestions: Array<{
        label: string;
        kind: any;
        documentation: string;
        insertText: string;
        insertTextRules?: any;
        range: any;
        sortText?: string;
      }> = [];
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: position.column,
      };

      // Check if we're inside a code block starting line
      const currentLine = model.getLineContent(position.lineNumber);
      const isCodeBlockStart = currentLine.trim().startsWith('```');
      
      if (isCodeBlockStart) {
        // Provide language suggestions for code blocks
        const commonLanguages = [
          { lang: 'javascript', desc: 'JavaScript' },
          { lang: 'typescript', desc: 'TypeScript' },
          { lang: 'python', desc: 'Python' },
          { lang: 'java', desc: 'Java' },
          { lang: 'csharp', desc: 'C#' },
          { lang: 'cpp', desc: 'C++' },
          { lang: 'c', desc: 'C' },
          { lang: 'go', desc: 'Go' },
          { lang: 'rust', desc: 'Rust' },
          { lang: 'php', desc: 'PHP' },
          { lang: 'ruby', desc: 'Ruby' },
          { lang: 'swift', desc: 'Swift' },
          { lang: 'kotlin', desc: 'Kotlin' },
          { lang: 'scala', desc: 'Scala' },
          { lang: 'html', desc: 'HTML' },
          { lang: 'css', desc: 'CSS' },
          { lang: 'scss', desc: 'SCSS' },
          { lang: 'less', desc: 'Less' },
          { lang: 'sql', desc: 'SQL' },
          { lang: 'json', desc: 'JSON' },
          { lang: 'yaml', desc: 'YAML' },
          { lang: 'xml', desc: 'XML' },
          { lang: 'bash', desc: 'Bash' },
          { lang: 'shell', desc: 'Shell' },
          { lang: 'powershell', desc: 'PowerShell' },
          { lang: 'dockerfile', desc: 'Dockerfile' },
          { lang: 'makefile', desc: 'Makefile' },
          { lang: 'markdown', desc: 'Markdown' },
          { lang: 'diff', desc: 'Diff' },
          { lang: 'plaintext', desc: 'Plain Text' },
        ];

        commonLanguages.forEach(({ lang, desc }) => {
          suggestions.push({
            label: lang,
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: `${desc} code block`,
            insertText: lang,
            range,
            sortText: `00_${lang}`, // High priority
          });
        });

        return { suggestions };
      }

      // Auto-detect code language based on context (for future use)
      // const detectLanguageFromContext = (content: string): string[] => {
      //   const detectedLangs = [];
      //   
      //   if (content.includes('import ') || content.includes('export ') || content.includes('function ')) {
      //     detectedLangs.push('javascript', 'typescript');
      //   }
      //   if (content.includes('def ') || content.includes('import ') || content.includes('from ')) {
      //     detectedLangs.push('python');
      //   }
      //   if (content.includes('public class ') || content.includes('private ') || content.includes('static ')) {
      //     detectedLangs.push('java', 'csharp');
      //   }
      //   if (content.includes('#include') || content.includes('cout') || content.includes('printf')) {
      //     detectedLangs.push('cpp', 'c');
      //   }
      //   if (content.includes('<div>') || content.includes('<html>') || content.includes('<!DOCTYPE')) {
      //     detectedLangs.push('html');
      //   }
      //   if (content.includes('SELECT ') || content.includes('FROM ') || content.includes('WHERE ')) {
      //     detectedLangs.push('sql');
      //   }
      //   
      //   return detectedLangs;
      // };

      // Headers
      for (let i = 1; i <= 6; i++) {
        suggestions.push({
          label: `h${i}`,
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: `Heading level ${i}`,
          insertText: `${'#'.repeat(i)} \${1:Heading}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        });
      }

      // Basic formatting
      const basicFormatting = [
        {
          label: 'bold',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Bold text',
          insertText: '**${1:bold text}**',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'italic',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Italic text',
          insertText: '*${1:italic text}*',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'code',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Inline code',
          insertText: '`${1:code}`',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'codeblock',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Code block',
          insertText: '```${1:language}\n${2:code}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'link',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Link',
          insertText: '[${1:link text}](${2:url})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'image',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Image',
          insertText: '![${1:alt text}](${2:image url})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ];

      suggestions.push(...basicFormatting);

      // Lists
      const lists = [
        {
          label: 'ul',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Unordered list',
          insertText: '- ${1:item 1}\n- ${2:item 2}\n- ${3:item 3}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'ol',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Ordered list',
          insertText: '1. ${1:item 1}\n2. ${2:item 2}\n3. ${3:item 3}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'todo',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Todo list',
          insertText: '- [ ] ${1:task 1}\n- [ ] ${2:task 2}\n- [x] ${3:completed task}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ];

      suggestions.push(...lists);

      // Tables
      const tables = [
        {
          label: 'table',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Table',
          insertText: '| ${1:Header 1} | ${2:Header 2} | ${3:Header 3} |\n| -------- | -------- | -------- |\n| ${4:Cell 1} | ${5:Cell 2} | ${6:Cell 3} |\n| ${7:Cell 4} | ${8:Cell 5} | ${9:Cell 6} |',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'table2',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Simple 2-column table',
          insertText: '| ${1:Header 1} | ${2:Header 2} |\n| -------- | -------- |\n| ${3:Cell 1} | ${4:Cell 2} |',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ];

      suggestions.push(...tables);

      // Quotes and callouts
      const quotes = [
        {
          label: 'quote',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Blockquote',
          insertText: '> ${1:Quote text}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'note',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Note callout',
          insertText: '> **Note:** ${1:Important information}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'warning',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Warning callout',
          insertText: '> **⚠️ Warning:** ${1:Warning message}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'tip',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Tip callout',
          insertText: '> **💡 Tip:** ${1:Helpful tip}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ];

      suggestions.push(...quotes);

      // Advanced structures
      const advanced = [
        {
          label: 'frontmatter',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'YAML frontmatter',
          insertText: '---\ntitle: "${1:Document Title}"\ndate: ${2:2025-06-18}\ntags: [${3:tag1}, ${4:tag2}]\n---\n\n${5:Content}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'details',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Collapsible details',
          insertText: '<details>\n<summary>${1:Click to expand}</summary>\n\n${2:Hidden content}\n\n</details>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'hr',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Horizontal rule',
          insertText: '---',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ];

      suggestions.push(...advanced);

      // Math and LaTeX
      const mathSnippets = [
        {
          label: 'math',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Inline math formula',
          insertText: '${1:x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}}$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'mathblock',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Block math formula',
          insertText: '$\n${1:x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}}\n$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'fraction',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Fraction',
          insertText: '$\\frac{${1:numerator}}{${2:denominator}}$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'sqrt',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Square root',
          insertText: '$\\sqrt{${1:expression}}$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'sum',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Sum notation',
          insertText: '$\\sum_{${1:i=1}}^{${2:n}} ${3:expression}$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'integral',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Integral',
          insertText: '$\\int_{${1:a}}^{${2:b}} ${3:f(x)} \\, dx$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'matrix',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Matrix',
          insertText: '$\\begin{pmatrix}\n${1:a} & ${2:b} \\\\\n${3:c} & ${4:d}\n\\end{pmatrix}$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'align',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Aligned equations',
          insertText: '$\\begin{align}\n${1:equation1} &= ${2:result1} \\\\\n${3:equation2} &= ${4:result2}\n\\end{align}$',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ];

      suggestions.push(...mathSnippets);

      // Mermaid diagrams
      const mermaidSnippets = [
        {
          label: 'mermaid',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid diagram',
          insertText: '```mermaid\n${1:graph TD\n    A[Start] --> B[Process]\n    B --> C[End]}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'flowchart',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid flowchart',
          insertText: '```mermaid\nflowchart TD\n    A[${1:Start}] --> B{${2:Decision}}\n    B -->|${3:Yes}| C[${4:Process 1}]\n    B -->|${5:No}| D[${6:Process 2}]\n    C --> E[${7:End}]\n    D --> E\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'sequence',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid sequence diagram',
          insertText: '```mermaid\nsequenceDiagram\n    participant ${1:A} as ${2:User}\n    participant ${3:B} as ${4:System}\n    ${1:A}->>+${3:B}: ${5:Request}\n    ${3:B}-->>-${1:A}: ${6:Response}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'gantt',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid Gantt chart',
          insertText: '```mermaid\ngantt\n    title ${1:Project Timeline}\n    dateFormat  YYYY-MM-DD\n    section ${2:Phase 1}\n    ${3:Task 1}    :${4:task1}, ${5:2025-01-01}, ${6:30d}\n    ${7:Task 2}    :${8:task2}, after task1, ${9:20d}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'pie',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid pie chart',
          insertText: '```mermaid\npie title ${1:Chart Title}\n    "${2:Category 1}" : ${3:35}\n    "${4:Category 2}" : ${5:25}\n    "${6:Category 3}" : ${7:40}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'mindmap',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid mindmap',
          insertText: '```mermaid\nmindmap\n  root((${1:Central Idea}))\n    ${2:Branch 1}\n      ${3:Sub-branch 1}\n      ${4:Sub-branch 2}\n    ${5:Branch 2}\n      ${6:Sub-branch 3}\n      ${7:Sub-branch 4}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'classDiagram',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid class diagram',
          insertText: '```mermaid\nclassDiagram\n    class ${1:Animal}{\n        +${2:String name}\n        +${3:int age}\n        +${4:getName()}\n        +${5:getAge()}\n    }\n    class ${6:Dog}{\n        +${7:bark()}\n    }\n    ${1:Animal} <|-- ${6:Dog}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: 'erDiagram',
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: 'Mermaid ER diagram',
          insertText: '```mermaid\nerDiagram\n    ${1:USER} {\n        ${2:string name}\n        ${3:string email}\n        ${4:int id}\n    }\n    ${5:ORDER} {\n        ${6:int id}\n        ${7:date created_at}\n        ${8:int user_id}\n    }\n    ${1:USER} ||--o{ ${5:ORDER} : places\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ];

      suggestions.push(...mermaidSnippets);

      // Code language shortcuts
      const codeLanguages = [
        'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
        'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala',
        'html', 'css', 'scss', 'less', 'sql', 'json', 'yaml', 'xml',
        'bash', 'shell', 'powershell', 'dockerfile', 'makefile'
      ];

      codeLanguages.forEach(lang => {
        suggestions.push({
          label: `code-${lang}`,
          kind: monaco.languages.CompletionItemKind.Snippet,
          documentation: `${lang} code block`,
          insertText: `\`\`\`${lang}\n\${1:code}\n\`\`\``,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        });
      });

      return { suggestions };
    },
  };
};

// Create hover provider for markdown
export const createMarkdownHoverProvider = (monaco: any) => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provideHover: (model: any, position: any) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const hoverContent = getMarkdownHoverContent(word.word);
      if (!hoverContent) return null;

      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [
          { value: hoverContent }
        ]
      };
    }
  };
};

// Get hover content for markdown syntax
function getMarkdownHoverContent(word: string): string | null {
  const hoverMap: Record<string, string> = {
    'bold': '**bold text** - Makes text bold',
    'italic': '*italic text* - Makes text italic',
    'code': '`code` - Inline code formatting',
    'link': '[text](url) - Creates a hyperlink',
    'image': '![alt](url) - Embeds an image',
    'h1': '# Heading 1 - Largest heading',
    'h2': '## Heading 2 - Second level heading',
    'h3': '### Heading 3 - Third level heading',
    'table': '| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |',
    'quote': '> Quote text - Creates a blockquote',
    'list': '- Item 1\n- Item 2 - Creates a bulleted list',
  };

  return hoverMap[word.toLowerCase()] || null;
}

// Setup markdown language configuration
export const setupMarkdownLanguage = (monaco: any) => {
  // Register completion provider
  monaco.languages.registerCompletionItemProvider('markdown', createMarkdownCompletionProvider(monaco));
  
  // Register hover provider
  monaco.languages.registerHoverProvider('markdown', createMarkdownHoverProvider(monaco));

  // Configure markdown language features
  monaco.languages.setLanguageConfiguration('markdown', {
    comments: {
      blockComment: ['<!--', '-->']
    },
    brackets: [
      ['[', ']'],
      ['(', ')'],
      ['{', '}'],
      ['<', '>']
    ],
    autoClosingPairs: [
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '<', close: '>' },
      { open: '`', close: '`' },
      { open: '*', close: '*' },
      { open: '_', close: '_' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    surroundingPairs: [
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '<', close: '>' },
      { open: '`', close: '`' },
      { open: '*', close: '*' },
      { open: '_', close: '_' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    folding: {
      markers: {
        start: /^<!--\s*#region\b.*-->/,
        end: /^<!--\s*#endregion\b.*-->/
      }
    }
  });
};