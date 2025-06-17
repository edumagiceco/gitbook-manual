import { DocsConfig } from "@/types";

export const docsConfig: DocsConfig = {
  mainNav: [
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
  ],
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
