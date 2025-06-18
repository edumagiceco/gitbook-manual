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

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  contentDir: string;
  uploadsDir: string;
  imagesDir: string;
  searchIndexName: string;
  recentSearchesKey: string;
  maxRecentSearches: number;
  apiTimeout: number;
  searchDebounceMs: number;
  features: {
    search: boolean;
    imageUpload: boolean;
    editor: boolean;
  };
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
  type?: 'page' | 'heading' | 'text';
  score?: number;
  highlight?: string;
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
    size?: number;
    lastModified?: string;
    created?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageData {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  lastModified?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface ImageUploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime?: number;
  environment?: string;
  version?: string;
  site?: {
    name: string;
    url: string;
  };
  features?: {
    search: boolean;
    imageUpload: boolean;
    editor: boolean;
  };
  memory?: {
    used: number;
    total: number;
  };
  error?: string;
}
