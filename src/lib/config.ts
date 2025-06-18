import { DocsConfig } from "@/types";

// Environment variables with fallbacks
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "GitBook Manual Site",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Professional Documentation Management System",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8080",
  // Content configuration
  contentDir: process.env.CONTENT_DIR || "content",
  uploadsDir: process.env.UPLOADS_DIR || "public/uploads",
  imagesDir: process.env.IMAGES_DIR || "public/uploads/images",
  // Search configuration  
  searchIndexName: process.env.SEARCH_INDEX_NAME || "gitbook-search",
  recentSearchesKey: process.env.RECENT_SEARCHES_KEY || "gitbook-recent-searches",
  maxRecentSearches: parseInt(process.env.MAX_RECENT_SEARCHES || "5"),
  // API configuration
  apiTimeout: parseInt(process.env.API_TIMEOUT || "5000"),
  searchDebounceMs: parseInt(process.env.SEARCH_DEBOUNCE_MS || "300"),
  // Feature flags
  features: {
    search: process.env.ENABLE_SEARCH === "true",
    imageUpload: process.env.ENABLE_IMAGE_UPLOAD === "true",
    editor: process.env.ENABLE_EDITOR === "true",
  },
};

// Dynamic navigation config - can be loaded from API/database later
export const getDocsConfig = (): DocsConfig => {
  const baseNav = [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Guides", 
      href: "/guides",
    },
    {
      title: "Examples",
      href: "/examples",
    },
  ];

  // Conditionally add Editor if feature is enabled
  if (siteConfig.features.editor) {
    baseNav.push({
      title: "Editor",
      href: "/editor",
    });
  }

  return {
    mainNav: baseNav,
    sidebarNav: [
      {
        title: "Getting Started",
        href: "/docs",
        items: [
          {
            title: "Introduction",
            href: "/docs/introduction",
          },
          {
            title: "Installation",
            href: "/docs/installation",
          },
          {
            title: "Quick Start",
            href: "/docs/quick-start",
          },
        ],
      },
      {
        title: "Components",
        href: "/docs/components",
        items: [
          {
            title: "Layout",
            href: "/docs/components/layout",
          },
          {
            title: "Navigation",
            href: "/docs/components/navigation",
          },
          {
            title: "Content",
            href: "/docs/components/content",
          },
        ],
      },
      {
        title: "Configuration",
        href: "/docs/configuration",
        items: [
          {
            title: "Basic Setup",
            href: "/docs/configuration/basic",
          },
          {
            title: "Advanced",
            href: "/docs/configuration/advanced",
          },
        ],
      },
      {
        title: "Examples",
        href: "/examples",
        items: [
          {
            title: "Basic Example",
            href: "/examples/basic",
          },
          {
            title: "Advanced Example",
            href: "/examples/advanced",
          },
        ],
      },
    ],
  };
};

// For backward compatibility
export const docsConfig = getDocsConfig();
