export interface TOCItem {
  id: string;
  text: string;
  level: number;
  lineNumber: number;
  children?: TOCItem[];
}

export interface TOCOptions {
  maxLevel?: number;
  minLevel?: number;
  includeCodeBlocks?: boolean;
}

/**
 * Extract headings from markdown content
 */
export function extractHeadings(
  content: string, 
  options: TOCOptions = {}
): TOCItem[] {
  const { 
    maxLevel = 6, 
    minLevel = 1,
    includeCodeBlocks = false 
  } = options;
  
  const lines = content.split('\n');
  const items: TOCItem[] = [];
  let inCodeBlock = false;
  
  lines.forEach((line, index) => {
    // Check for code block boundaries
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    
    // Skip if we're inside a code block and not including them
    if (inCodeBlock && !includeCodeBlocks) {
      return;
    }
    
    // Match markdown headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      
      // Skip if level is outside the specified range
      if (level < minLevel || level > maxLevel) {
        return;
      }
      
      const text = headingMatch[2].trim();
      const id = generateHeadingId(text);
      
      items.push({
        id,
        text,
        level,
        lineNumber: index + 1,
      });
    }
  });
  
  return items;
}

/**
 * Generate a unique ID for a heading
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Build a hierarchical tree structure from flat heading items
 */
export function buildTOCTree(items: TOCItem[]): TOCItem[] {
  if (items.length === 0) return [];
  
  const tree: TOCItem[] = [];
  const stack: TOCItem[] = [];
  
  items.forEach(item => {
    const newItem = { ...item, children: [] };
    
    // Find the appropriate parent based on heading level
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      // Top-level item
      tree.push(newItem);
    } else {
      // Child item
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(newItem);
    }
    
    stack.push(newItem);
  });
  
  return tree;
}

/**
 * Find the currently active heading based on scroll position
 */
export function findActiveHeading(
  headings: TOCItem[],
  scrollTop: number,
  getHeadingElement: (id: string) => HTMLElement | null
): string | null {
  let activeId: string | null = null;
  let minDistance = Infinity;
  
  const flattenHeadings = (items: TOCItem[]): TOCItem[] => {
    return items.reduce((acc: TOCItem[], item) => {
      acc.push(item);
      if (item.children) {
        acc.push(...flattenHeadings(item.children));
      }
      return acc;
    }, []);
  };
  
  const allHeadings = flattenHeadings(headings);
  
  allHeadings.forEach(heading => {
    const element = getHeadingElement(heading.id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const distance = Math.abs(rect.top);
      
      // Consider a heading active if it's within the viewport
      // or if it's the closest one above the viewport
      if (rect.top <= 100 && distance < minDistance) {
        minDistance = distance;
        activeId = heading.id;
      }
    }
  });
  
  return activeId;
}

/**
 * Scroll to a heading smoothly
 */
export function scrollToHeading(
  headingId: string,
  getHeadingElement: (id: string) => HTMLElement | null,
  offset: number = 80
): void {
  const element = getHeadingElement(headingId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }
}

/**
 * Get the depth of the TOC tree
 */
export function getTOCDepth(items: TOCItem[]): number {
  let maxDepth = 0;
  
  const calculateDepth = (items: TOCItem[], depth: number = 0): void => {
    if (items.length > 0) {
      maxDepth = Math.max(maxDepth, depth);
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          calculateDepth(item.children, depth + 1);
        }
      });
    }
  };
  
  calculateDepth(items);
  return maxDepth;
}

/**
 * Filter TOC items by search query
 */
export function filterTOCItems(
  items: TOCItem[],
  query: string
): TOCItem[] {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase();
  
  const filterRecursive = (items: TOCItem[]): TOCItem[] => {
    return items.reduce((acc: TOCItem[], item) => {
      const matches = item.text.toLowerCase().includes(lowerQuery);
      const filteredChildren = item.children 
        ? filterRecursive(item.children)
        : [];
      
      if (matches || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren
        });
      }
      
      return acc;
    }, []);
  };
  
  return filterRecursive(items);
}