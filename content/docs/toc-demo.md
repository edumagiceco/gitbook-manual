# GitBook Manual Site - TOC Demo

This document demonstrates the automatic Table of Contents (TOC) generation feature.

## Introduction

The TOC feature automatically extracts headings from your markdown content and creates an interactive navigation panel.

### Key Features

The TOC provides several powerful features:

#### Automatic Extraction
All headings (H1-H6) are automatically detected and organized into a hierarchical structure.

#### Scroll Spy
As you scroll through the document, the TOC automatically highlights the current section you're viewing.

#### Click Navigation
Click any heading in the TOC to instantly jump to that section in the document.

## How to Use

### Enabling the TOC

1. Click the **#** button in the editor toolbar
2. The TOC panel will appear on the right side
3. The TOC updates in real-time as you edit

### Searching Within TOC

The TOC includes a search feature:

1. Click the 🔍 icon in the TOC header
2. Type to filter headings
3. Only matching headings will be displayed

### Expanding/Collapsing Sections

- Click the arrow icons to expand or collapse sections
- All sections are expanded by default
- The TOC remembers your preferences

## Advanced Features

### Heading Level Configuration

The TOC can be configured to show specific heading levels:

```javascript
<TableOfContents 
  content={content}
  maxLevel={4}    // Show up to H4
  minLevel={1}    // Start from H1
/>
```

### Scroll Synchronization

The TOC integrates with the preview pane's scroll position:

- Scrolling in the preview updates the TOC highlight
- Clicking in the TOC scrolls the preview to that section
- Bidirectional synchronization ensures smooth navigation

### Performance Optimization

The TOC uses several optimization techniques:

1. **Memoization**: Heading extraction is memoized to prevent unnecessary recalculation
2. **Debouncing**: Scroll events are debounced for smooth performance
3. **Virtual Scrolling**: Large documents are handled efficiently

## Technical Implementation

### Heading ID Generation

Each heading gets a unique ID based on its text:

```markdown
# Hello World → id="hello-world"
## Getting Started → id="getting-started"
### Installation Guide → id="installation-guide"
```

### Tree Structure

The TOC builds a hierarchical tree from flat headings:

```
H1: Document Title
├── H2: Section 1
│   ├── H3: Subsection 1.1
│   └── H3: Subsection 1.2
└── H2: Section 2
    └── H3: Subsection 2.1
```

## Best Practices

### Writing for TOC

1. **Use Clear Headings**: Make headings descriptive and concise
2. **Maintain Hierarchy**: Don't skip heading levels (e.g., H1 → H3)
3. **Avoid Duplication**: Each heading should be unique within its level
4. **Keep It Organized**: Group related content under appropriate headings

### Accessibility

The TOC is fully accessible:

- Keyboard navigation supported
- Screen reader compatible
- ARIA labels for all interactive elements
- Focus management for modal interactions

## Troubleshooting

### Common Issues

#### TOC Not Updating

If the TOC doesn't update when you edit:
1. Check that the TOC panel is enabled
2. Ensure your markdown syntax is correct
3. Try toggling the TOC button off and on

#### Scroll Spy Not Working

If sections aren't highlighting as you scroll:
1. Make sure scroll sync is enabled
2. Check that headings have proper IDs
3. Verify the preview pane is active

#### Search Not Finding Headings

If search doesn't find your headings:
1. Check for typos in your search query
2. Ensure headings aren't inside code blocks
3. Try clearing the search and typing again

## Conclusion

The Table of Contents feature enhances document navigation and improves the overall user experience. It's particularly useful for:

- Long technical documentation
- Tutorial series with multiple sections
- API reference guides
- User manuals and guides

Try it out by clicking the **#** button in the editor toolbar!