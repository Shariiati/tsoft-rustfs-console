import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"

const source = fs.readFileSync("lib/oidc.ts", "utf8")

test("OIDC API URLs use the configured Admin API base URL", () => {
  assert.match(source, /normalizeApiBaseUrl\(apiBaseUrl: string\)/)
  assert.match(source, /apiBaseUrl\.replace\(\/\\\/\+\$\/, ""\)/)
  assert.match(source, /fetchOidcProviders\(apiBaseUrl: string\)/)
  assert.match(source, /normalizeApiBaseUrl\(apiBaseUrl\).*\/oidc\/providers/)
})

test("OIDC login URL uses the configured API base URL", () => {
  assert.match(source, /buildOidcLoginUrl\([\s\S]*?apiBaseUrl: string,[\s\S]*?providerId: string/)
  assert.match(source, /\/oidc\/authorize\/\$\{encodeURIComponent\(providerId\)\}/)
  assert.match(source, /redirect_after=\$\{encodeURIComponent\(redirectAfter\)\}/)
})

test("OIDC logout URL uses the configured API base URL", () => {
  assert.match(source, /buildOidcLogoutUrl\([\s\S]*?apiBaseUrl: string/)
  assert.match(source, /\/oidc\/logout\?logout_token=\$\{encodeURIComponent\(logoutToken\)\}/)
})

test("initiateOidcLogin normalizes the destination before assigning location.href", () => {
  assert.match(source, /buildOidcLoginUrl\(apiBaseUrl, providerId, redirectAfter\)/)
  assert.match(source, /window\.location\.href = new URL\(url, window\.location\.origin\)\.href/)
})
