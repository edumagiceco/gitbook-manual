---
title: API Reference
tags: [api, reference, development]
createdAt: 2025-06-17T00:00:00.000Z
updatedAt: 2025-06-17T00:00:00.000Z
---

# API Reference

This document provides a comprehensive reference for the GitBook Manual API endpoints.

## Base URL

All API requests should be made to:
```
http://localhost:8080/api
```

## Authentication

Currently, the API does not require authentication for local development. In production, implement appropriate authentication mechanisms.

## Documents API

### List Documents

**GET** `/api/documents`

Returns a hierarchical list of all documents and folders.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "docs",
      "name": "docs",
      "path": "/docs",
      "type": "folder",
      "children": [
        {
          "id": "docs/welcome.md",
          "name": "welcome.md", 
          "path": "/docs/welcome.md",
          "type": "file"
        }
      ]
    }
  ]
}
```

### Get Document

**GET** `/api/documents/{path}`

Retrieves the content and metadata of a specific document.

**Parameters:**
- `path` (string): The document path (e.g., `/docs/welcome.md`)

**Response:**
```json
{
  "success": true,
  "data": {
    "path": "/docs/welcome.md",
    "content": "# Welcome\n\nThis is the content...",
    "metadata": {
      "title": "Welcome",
      "tags": ["getting-started"],
      "createdAt": "2025-06-17T00:00:00.000Z",
      "updatedAt": "2025-06-17T00:00:00.000Z"
    }
  }
}
```

### Create Document

**POST** `/api/documents`

Creates a new document.

**Request Body:**
```json
{
  "path": "/docs/new-document.md",
  "content": "# New Document\n\nContent here...",
  "metadata": {
    "title": "New Document",
    "tags": ["example"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document created successfully",
  "path": "/docs/new-document.md"
}
```

### Update Document

**PUT** `/api/documents/{path}`

Updates an existing document.

**Request Body:**
```json
{
  "content": "# Updated Content\n\nThis is updated...",
  "metadata": {
    "title": "Updated Title",
    "tags": ["updated", "example"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document updated successfully",
  "path": "/docs/document.md"
}
```

### Delete Document

**DELETE** `/api/documents/{path}`

Deletes a document.

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "path": "/docs/document.md"
}
```

## Folders API

### Create Folder

**POST** `/api/folders`

Creates a new folder.

**Request Body:**
```json
{
  "path": "/",
  "name": "new-folder"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "path": "/new-folder"
}
```

## Search API

### Search Documents

**GET** `/api/search?q={query}&limit={limit}&highlight={highlight}`

Searches through all documents.

**Parameters:**
- `q` (string): Search query
- `limit` (number, optional): Maximum results (default: 10)
- `highlight` (boolean, optional): Enable highlighting (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "/docs/welcome.md",
        "title": "Welcome",
        "content": "Welcome to GitBook Manual...",
        "path": "/docs/welcome.md",
        "metadata": {
          "title": "Welcome",
          "tags": ["getting-started"]
        },
        "score": 1,
        "highlight": {
          "title": "Welcome to <mark>GitBook</mark> Manual",
          "content": "Welcome to the <mark>GitBook</mark> Manual..."
        }
      }
    ],
    "total": 1,
    "query": "GitBook"
  }
}
```

### Rebuild Search Index

**POST** `/api/search`

Rebuilds the search index.

**Response:**
```json
{
  "success": true,
  "message": "Search index rebuilt successfully"
}
```

## Rename API

### Rename File or Folder

**POST** `/api/rename`

Renames a file or folder.

**Request Body:**
```json
{
  "oldPath": "/docs/old-name.md",
  "newName": "new-name.md"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Renamed successfully",
  "oldPath": "/docs/old-name.md",
  "newPath": "/docs/new-name.md"
}
```

## Error Responses

All API endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, there are no rate limits imposed. In production, consider implementing rate limiting to prevent abuse.

## SDK and Client Libraries

Currently, no official SDKs are available. The API follows REST conventions and can be easily integrated with any HTTP client library.

## Examples

### JavaScript/Fetch Example

```javascript
// Search for documents
const searchResults = await fetch('/api/search?q=welcome&highlight=true')
  .then(res => res.json());

// Create a new document  
const newDoc = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/docs/example.md',
    content: '# Example\n\nThis is an example document.',
    metadata: { title: 'Example', tags: ['test'] }
  })
}).then(res => res.json());
```

### cURL Examples

```bash
# Search documents
curl "http://localhost:8080/api/search?q=welcome&highlight=true"

# Create document
curl -X POST "http://localhost:8080/api/documents" \
  -H "Content-Type: application/json" \
  -d '{"path":"/test.md","content":"# Test","metadata":{"title":"Test"}}'

# Update document
curl -X PUT "http://localhost:8080/api/documents/test.md" \
  -H "Content-Type: application/json" \
  -d '{"content":"# Updated Test","metadata":{"title":"Updated Test"}}'
```

## Contributing

To contribute to the API:

1. Follow the existing patterns and conventions
2. Add appropriate error handling
3. Include comprehensive tests
4. Update this documentation

For more information, see the [Development Guide](./development.md).
