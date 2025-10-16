/**
 * Response from npm-trends-proxy NPM registry endpoint
 * Endpoint: https://npm-trends-proxy.uidotdev.workers.dev/npm/registry/{packageName}
 */
export interface NpmPackageResponse {
  name: string;
  description: string;
  time: {
    created: string;
    modified: string;
    [version: string]: string;
  };
  "dist-tags": {
    latest: string;
    [tag: string]: string;
  };
  repository?: {
    url: string;
  };
  readme?: string;
  homepage?: string;
}

/**
 * Simplified NPM package info for tool output
 */
export interface NpmPackageInfo {
  [x: string]: unknown;
  name: string;
  description: string;
  latestVersion: string;
  created: string;
  modified: string;
  repositoryUrl?: string;
  homepage?: string;
}
