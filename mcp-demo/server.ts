import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";
import { getGitHubStats } from "./api/github-api.js";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

// GitHub Stats Tool
server.registerTool(
  "get-github-stats",
  {
    title: "Get GitHub Repository Stats",
    description:
      "Fetch GitHub repository statistics including stars, forks, and issues",
    inputSchema: {
      owner: z.string().describe('Repository owner (e.g., "angular")'),
      repo: z.string().describe('Repository name (e.g., "angular-cli")'),
    },
    outputSchema: {
      name: z.string(),
      starsCount: z.number(),
      forksCount: z.number().nullable(),
      issuesCount: z.number().nullable(),
      openIssuesCount: z.number(),
    },
  },
  async ({ owner, repo }) => {
    try {
      const stats = await getGitHubStats(owner, repo);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(stats, null, 2),
          },
        ],
        structuredContent: stats,
      };
    } catch (error) {
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

// NPM Package Info Tool (for attendees to implement)
// TODO: Implement this tool following the pattern from 'get-github-stats'
server.registerTool(
  "get-npm-package-info",
  {
    title: "Get NPM Package Info",
    description:
      "Fetch NPM package information including version, description, and repository",
    inputSchema: {
      // TODO: Define the input schema using Zod
      // Hint: You need a packageName parameter (string) with .describe()
      // Example: packageName: z.string().describe('NPM package name (e.g., "express", "@angular/cli")')
      packageName: z.string(), // FIXME: Add .describe() with helpful description
    },
    outputSchema: {
      // TODO: Define the output schema using Zod
      // Hint: Look at NpmPackageInfo interface in types/npm-package.types.ts
      // You need: name, description, latestVersion, created, modified, repositoryUrl?, homepage?
      // Example: name: z.string(), latestVersion: z.string(), etc.
      name: z.string(), // FIXME: Add the rest of the fields
    },
  },
  async ({ packageName }) => {
    // TODO: Implement the handler function
    // Steps:
    // 1. Call getNpmPackageInfo(packageName) in a try-catch block
    // 2. On success: return { content: [...], structuredContent: packageInfo }
    // 3. On error: return { content: [...], isError: true }

    // Hint: Follow the same pattern as 'get-github-stats' above
    // You can use the getNpmPackageInfo function that's already imported

    console.log("TODO: Implement this tool. Package name:", packageName);

    return {
      content: [
        {
          type: "text",
          text: "Not implemented yet. Please implement this tool!",
        },
      ],
      isError: true,
    };
  },
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  // Create a new transport for each request to prevent request ID collisions
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || "4444");
app
  .listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
