import type {
  NpmPackageResponse,
  NpmPackageInfo,
} from "../types/npm-package.types.js";

const BASE_URL = "https://npm-trends-proxy.uidotdev.workers.dev/npm/registry";

/**
 * Fetches NPM package information
 * @param packageName - NPM package name (e.g., "express", "@angular/cli")
 * @returns Package info including version, description, dates, and repository
 * @throws Error if the package is not found or request fails
 */
export async function getNpmPackageInfo(
  packageName: string,
): Promise<NpmPackageInfo> {
  // Encode package name to handle scoped packages like @angular/cli
  const encodedPackageName = encodeURIComponent(packageName);
  const url = `${BASE_URL}/${encodedPackageName}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Package "${packageName}" not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as NpmPackageResponse;

    // Extract and simplify the data
    return {
      name: data.name,
      description: data.description,
      latestVersion: data["dist-tags"].latest,
      created: data.time.created,
      modified: data.time.modified,
      repositoryUrl: data.repository?.url,
      homepage: data.homepage,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch NPM package info");
  }
}
