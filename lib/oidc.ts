import type { OidcProvider } from "@/types/config"
import { isSafeRedirectPath } from "@/lib/routes"

export interface OidcLogoutSession {
  logoutToken: string
}

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/+$/, "")
}

/**
 * Fetch configured OIDC providers from the server.
 */
export async function fetchOidcProviders(apiBaseUrl: string): Promise<OidcProvider[]> {
  try {
    const url = `${normalizeApiBaseUrl(apiBaseUrl)}/oidc/providers`
    const response = await fetch(url, { method: "GET" })
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

/**
 * Build the backend OIDC authorization endpoint URL.
 */
export function buildOidcLoginUrl(apiBaseUrl: string, providerId: string, redirectAfter?: string): string {
  let url = `${normalizeApiBaseUrl(apiBaseUrl)}/oidc/authorize/${encodeURIComponent(providerId)}`
  if (redirectAfter) {
    url += `?redirect_after=${encodeURIComponent(redirectAfter)}`
  }
  return url
}

/**
 * Redirect the browser to the OIDC authorization endpoint.
 */
export function initiateOidcLogin(apiBaseUrl: string, providerId: string, redirectAfter?: string): void {
  const url = buildOidcLoginUrl(apiBaseUrl, providerId, redirectAfter)
  window.location.href = new URL(url, window.location.origin).href
}

/**
 * Build the backend logout endpoint URL.
 */
export function buildOidcLogoutUrl(apiBaseUrl: string, logoutToken: string): string {
  const base = normalizeApiBaseUrl(apiBaseUrl)
  return `${base}/oidc/logout?logout_token=${encodeURIComponent(logoutToken)}`
}

/**
 * Parse STS credentials from the URL hash fragment (set by OIDC callback).
 * Expected format:
 * #accessKey=...&secretKey=...&sessionToken=...&expiration=...&redirect=/path&logoutToken=...
 */
export function parseOidcCallback(hash: string): {
  accessKey: string
  secretKey: string
  sessionToken: string
  expiration: string
  redirect: string
  logoutToken?: string
} | null {
  // Strip leading # from hash
  const cleaned = hash.replace(/^#\/?/, "")
  if (!cleaned) return null

  const params = new URLSearchParams(cleaned)
  const accessKey = params.get("accessKey")
  const secretKey = params.get("secretKey")
  const sessionToken = params.get("sessionToken")
  const logoutToken = params.get("logoutToken") ?? undefined

  if (!accessKey || !secretKey || !sessionToken) return null

  return {
    accessKey,
    secretKey,
    sessionToken,
    expiration: params.get("expiration") ?? "",
    redirect: isSafeRedirectPath(params.get("redirect") ?? "", "/"),
    logoutToken: logoutToken || undefined,
  }
}
