import type { GitHubStatsResponse } from "../types/github-stats.types.js";

const BASE_URL = "https://npm-trends-proxy.uidotdev.workers.dev/github/repos";

/**
 * Fetches GitHub repository statistics
 * @param owner - Repository owner (e.g., "angular")
 * @param repo - Repository name (e.g., "angular-cli")
 * @returns GitHub stats including stars, forks, and issues
 * @throws Error if the repository is not found or request fails
 */
export async function getGitHubStats(
  owner: string,
  repo: string,
): Promise<GitHubStatsResponse> {
  const url = `${BASE_URL}/${owner}/${repo}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Repository ${owner}/${repo} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as GitHubStatsResponse;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch GitHub stats");
  }
}
