---
title: Getting Started Guide
tags: [guide, tutorial, basics]
createdAt: 2025-06-17T00:00:00.000Z
updatedAt: 2025-06-17T00:00:00.000Z
---

# Getting Started Guide

This guide will help you get up and running with GitBook Manual quickly.

## Installation and Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **Docker** and **Docker Compose**
- **Git** for version control

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/gitbook-manual.git
   cd gitbook-manual
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Start the development server:
   ```bash
   docker-compose up -d
   ```

## Using the Editor

The editor is the heart of GitBook Manual. Here's how to use it effectively:

### Creating Documents

1. Navigate to the **Editor** page
2. Click the "New File" button in the sidebar
3. Enter a filename with `.md` extension
4. Start writing your content!

### File Organization

- Create folders to organize related documents
- Use descriptive filenames
- Maintain a logical hierarchy

### Markdown Syntax

GitBook Manual supports full Markdown syntax:

- **Headers**: Use `#` for headers (H1-H6)
- **Bold**: Use `**text**` or `__text__`
- **Italic**: Use `*text*` or `_text_`
- **Links**: Use `[text](url)`
- **Code**: Use backticks for `inline code` or triple backticks for code blocks

## Search Functionality

The search feature is one of GitBook Manual's most powerful tools:

### Opening Search

- Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- Click the search button in the header
- The search modal will appear

### Search Tips

- **Partial matching**: Type part of a word to find matches
- **Multiple terms**: Search for multiple words to narrow results
- **Recent searches**: Your recent searches are saved for quick access
- **Field targeting**: Search looks through titles, content, and metadata

## Best Practices

### Content Organization

1. **Use clear, descriptive titles**
2. **Add relevant tags** to your documents
3. **Create a logical folder structure**
4. **Write descriptive meta descriptions**

### Writing Tips

1. **Use headers** to break up content
2. **Add examples** and code snippets
3. **Include links** to related topics
4. **Keep paragraphs** reasonably short

### Collaboration

1. **Regular saves** - The editor auto-saves, but manual saves are good practice
2. **Consistent naming** - Use consistent file naming conventions
3. **Version control** - Consider using Git for version tracking

## Troubleshooting

### Common Issues

**Editor not loading**: Refresh the page and ensure JavaScript is enabled

**Search not working**: Check that the search index is built (API endpoint `/api/search`)

**Files not appearing**: Verify file permissions and restart the Docker container

## Next Steps

Now that you're familiar with the basics:

- Explore [Advanced Features](./advanced-features.md)
- Check out the [API Reference](./api-reference.md)
- Learn about [Customization Options](./customization.md)

Happy writing! ✍️
