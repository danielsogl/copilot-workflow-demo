/**
 * Response from npm-trends-proxy GitHub stats endpoint
 * Endpoint: https://npm-trends-proxy.uidotdev.workers.dev/github/repos/{owner}/{repo}
 */
export interface GitHubStatsResponse {
  [x: string]: unknown;
  name: string;
  starsCount: number;
  forksCount: number | null;
  issuesCount: number | null;
  openIssuesCount: number;
}
