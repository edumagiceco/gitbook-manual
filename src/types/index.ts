export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  children?: NavItem[];
}

export interface SidebarNavItem extends NavItem {
  items?: SidebarNavItem[];
}

export interface DocsConfig {
  mainNav: NavItem[];
  sidebarNav: SidebarNavItem[];
}

export interface DocumentMeta {
  title: string;
  description?: string;
  slug: string;
  date?: string;
  lastModified?: string;
  tags?: string[];
}

export interface TableOfContents {
  items: TocItem[];
}

export interface TocItem {
  title: string;
  url: string;
  items?: TocItem[];
}

export interface SearchResult {
  title: string;
  description?: string;
  url: string;
  content?: string;
}

export interface FileTreeItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
  isModified?: boolean;
  content?: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface Document {
  id: string;
  path: string;
  title: string;
  content: string;
  metadata?: {
    author?: string;
    date?: Date;
    tags?: string[];
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
