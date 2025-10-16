# MCP Server Workshop Guide

Welcome to the MCP Server workshop! In this hands-on session, you'll learn how to build custom tools for the Model Context Protocol.

## 📋 Workshop Structure

### Part 1: Live Demo (15-20 minutes)

Watch as we build the `get-github-stats` tool from scratch, which fetches GitHub repository statistics.

### Part 2: Your Turn (20-30 minutes)

Implement the `get-npm-package-info` tool by following the same patterns demonstrated in the live coding session.

---

## 🏗️ Project Structure

```
mcp-demo/
├── server.ts                    # Main MCP server (you'll work here)
├── types/                       # TypeScript type definitions
│   ├── github-stats.types.ts   # Types for GitHub API response
│   └── npm-package.types.ts    # Types for NPM API response
├── api/                         # API utility functions
│   ├── github-api.ts           # getGitHubStats() function
│   └── npm-api.ts              # getNpmPackageInfo() function
└── server.solution.ts          # Complete solution for reference
```

---

## 🎯 Your Task: Implement `get-npm-package-info`

### Step 1: Complete the Input Schema

In `server.ts` around line 88, you'll find:

```typescript
inputSchema: {
  packageName: z.string(); // FIXME: Add .describe() with helpful description
}
```

**TODO:** Add a descriptive label using `.describe()`:

```typescript
packageName: z.string().describe(
  'NPM package name (e.g., "express", "@angular/cli")',
);
```

### Step 2: Complete the Output Schema

Around line 95, complete the output schema by adding all fields from the `NpmPackageInfo` interface:

**Hint:** Check `types/npm-package.types.ts` to see the complete interface.

You need to define:

- `name` (string) ✅ Already done
- `description` (string)
- `latestVersion` (string)
- `created` (string)
- `modified` (string)
- `repositoryUrl` (optional string)
- `homepage` (optional string)

**Example:**

```typescript
outputSchema: {
  name: z.string(),
  description: z.string(),
  latestVersion: z.string(),
  created: z.string(),
  modified: z.string(),
  repositoryUrl: z.string().optional(),
  homepage: z.string().optional()
}
```

### Step 3: Implement the Handler Function

Around line 98, implement the async handler function. Follow the pattern from `get-github-stats` (lines 50-74):

1. **Wrap in try-catch block**
2. **Call the API function:** Use `getNpmPackageInfo(packageName)` (already imported!)
3. **Return success response:**
   ```typescript
   return {
     content: [{ type: "text", text: JSON.stringify(packageInfo, null, 2) }],
     structuredContent: packageInfo,
   };
   ```
4. **Handle errors:**
   ```typescript
   catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     return {
       content: [{ type: 'text', text: `Error: ${errorMessage}` }],
       isError: true
     };
   }
   ```

---

## 🧪 Testing Your Implementation

### 1. Start the MCP Server

```bash
npm start
```

You should see: `Demo MCP Server running on http://localhost:4444/mcp`

### 2. Use MCP Inspector

In a new terminal:

```bash
npm run inspect
```

This opens the MCP Inspector where you can test your tools.

### 3. Test Cases

Try these package names:

- `express` - Popular Node.js framework
- `@angular/cli` - Scoped package (tests URL encoding)
- `nonexistent-package-xyz123` - Should return a proper error

### 4. Expected Output

For `express`, you should see:

```json
{
  "name": "express",
  "description": "Fast, unopinionated, minimalist web framework",
  "latestVersion": "4.x.x",
  "created": "2010-12-29T...",
  "modified": "2024-xx-xx...",
  "repositoryUrl": "git+https://github.com/expressjs/express.git",
  "homepage": "http://expressjs.com/"
}
```

---

## 💡 Key Learning Points

### 1. **Tool Registration**

```typescript
server.registerTool(name, config, handler);
```

### 2. **Zod Schemas**

- `inputSchema`: Validates and documents input parameters
- `outputSchema`: Defines the structure of successful responses
- Use `.describe()` for better documentation

### 3. **API Utilities**

- Keep API calls in separate files (`api/` folder)
- Use TypeScript interfaces for type safety (`types/` folder)
- Handle errors gracefully

### 4. **Response Format**

Every tool must return:

```typescript
{
  content: [{ type: 'text', text: '...' }],  // For display
  structuredContent: { ... },                 // Typed data
  isError?: boolean                           // Error flag
}
```

---

## 🆘 Need Help?

1. **Check the live demo:** Look at `get-github-stats` tool (lines 32-75 in `server.ts`)
2. **Review types:** Check `types/npm-package.types.ts` for the interface
3. **See the solution:** Open `server.solution.ts` for the complete implementation
4. **Test the API directly:** Try `https://npm-trends-proxy.uidotdev.workers.dev/npm/registry/express` in your browser

---

## 🎉 Bonus Challenges

If you finish early, try these:

1. **Add more fields** to the output (e.g., `keywords`, `license`)
2. **Create a new tool** that compares two packages
3. **Add caching** to avoid repeated API calls
4. **Validate package names** before making API calls

---

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Zod Documentation](https://zod.dev)
- [npm-trends-proxy API](https://npm-trends-proxy.uidotdev.workers.dev)

---

Good luck! 🚀
