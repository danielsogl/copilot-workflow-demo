// SOLUTION FILE - Complete implementation for reference
// This shows the completed 'get-npm-package-info' tool

import { z } from "zod";
import { getNpmPackageInfo } from "./api/npm-api.js";

// Complete implementation of NPM Package Info Tool
export const npmPackageInfoTool = {
  name: "get-npm-package-info",
  config: {
    title: "Get NPM Package Info",
    description:
      "Fetch NPM package information including version, description, and repository",
    inputSchema: {
      packageName: z
        .string()
        .describe('NPM package name (e.g., "express", "@angular/cli")'),
    },
    outputSchema: {
      name: z.string(),
      description: z.string(),
      latestVersion: z.string(),
      created: z.string(),
      modified: z.string(),
      repositoryUrl: z.string().optional(),
      homepage: z.string().optional(),
    },
  },
  handler: async ({ packageName }: { packageName: string }) => {
    try {
      const packageInfo = await getNpmPackageInfo(packageName);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(packageInfo, null, 2),
          },
        ],
        structuredContent: packageInfo,
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
};

// To use this in server.ts, replace the TODO version with:
// server.registerTool(
//   npmPackageInfoTool.name,
//   npmPackageInfoTool.config,
//   npmPackageInfoTool.handler
// );
