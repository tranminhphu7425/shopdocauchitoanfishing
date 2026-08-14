/**
 * Site Configuration & Deployment Mode Switcher
 * Supported Modes:
 *  - "gh-pages": GitHub Pages mode (subpath: /shopdocauchitoanfishing)
 *  - "custom-domain": Custom domain or root deployment mode (basePath: "")
 */

export type DeploymentMode = "gh-pages" | "custom-domain";

export const GH_PAGES_BASE_PATH = "/shopdocauchitoanfishing";
export const CUSTOM_DOMAIN_BASE_PATH = "";

export function getActiveBasePath(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH !== undefined) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  return GH_PAGES_BASE_PATH;
}

export function getDeploymentMode(): DeploymentMode {
  const basePath = getActiveBasePath();
  return basePath === "" ? "custom-domain" : "gh-pages";
}

/**
 * Format any product image URL dynamically based on active deployment mode (basePath).
 * Handles external URLs, Data URLs, Blob URLs, and relative paths cleanly.
 */
export function formatImageUrl(url?: string): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const basePath = getActiveBasePath();

  // Clean any leading old or subpath prefix (/shopdocauchitoanfishing or /commerce)
  const cleanPath = url.replace(/^\/(shopdocauchitoanfishing|commerce)/, "");

  // Ensure single leading slash
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  if (basePath && basePath !== "/") {
    return `${basePath}${normalizedPath}`;
  }

  return normalizedPath;
}
