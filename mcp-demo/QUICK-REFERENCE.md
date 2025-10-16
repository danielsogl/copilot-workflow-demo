# MCP Tool Quick Reference

## Tool Registration Pattern

```typescript
server.registerTool(
  "tool-name",
  {
    title: "Human Readable Title",
    description: "What this tool does",
    inputSchema: {
      paramName: z.string().describe("Parameter description"),
    },
    outputSchema: {
      field: z.string(),
      optional: z.string().optional(),
    },
  },
  async ({ paramName }) => {
    try {
      // 1. Call your API/logic
      const result = await yourApiFunction(paramName);

      // 2. Return success response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    } catch (error) {
      // 3. Handle errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
);
```

## Common Zod Types

```typescript
z.string(); // String
z.number(); // Number
z.boolean(); // Boolean
z.string().optional(); // Optional string
z.number().nullable(); // Nullable number
z.enum(["a", "b"]); // Enum/Union type
z.array(z.string()); // Array of strings
```

## Response Structure

### Success Response

```typescript
{
  content: [{ type: 'text', text: 'formatted output' }],
  structuredContent: { /* typed data */ }
}
```

### Error Response

```typescript
{
  content: [{ type: 'text', text: 'Error: description' }],
  isError: true
}
```

## API Function Pattern

```typescript
export async function apiFunction(param: string): Promise<ReturnType> {
  const url = `${BASE_URL}/${param}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as ReturnType;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Request failed");
  }
}
```

## Type Definition Pattern

```typescript
export interface ApiResponse {
  [x: string]: unknown; // Required for MCP
  field1: string;
  field2: number;
  optional?: string;
}
```

## Testing Commands

```bash
# Start server
npm start

# Open MCP Inspector
npm run inspect
```

## Useful Endpoints

### GitHub Stats

```
GET https://npm-trends-proxy.uidotdev.workers.dev/github/repos/{owner}/{repo}
```

### NPM Package Info

```
GET https://npm-trends-proxy.uidotdev.workers.dev/npm/registry/{packageName}
```

Note: Use `encodeURIComponent()` for scoped packages like `@angular/cli`
