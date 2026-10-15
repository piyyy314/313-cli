## 2025-02-14 - Redact Embedded Credentials in Git Remote URLs

**Vulnerability:** Git remote origin URLs containing basic authentication credentials or access tokens (e.g., `https://user:pass@host/repo.git` or `https://token@github.com/org/repo.git`) retained credentials when constructing `target.remoteUrl` in project metadata because Node's `url.parse(url).host` includes `user:pass@`.

**Learning:** `url.parse(url)` populates `host` with `user:pass@hostname:port`, whereas `hostname` contains only the domain/host name and `port` contains the port number without authentication credentials.

**Prevention:** When sanitizing or constructing clean URLs from `url.parse()`, construct the clean host using `hostname` and optional `port` rather than `host` to prevent leaking embedded basic auth or token credentials in analytics, monitor payloads, or debug logs.

## 2025-02-14 - Redact Request Body and Query Parameters in Request Debug Logs

**Vulnerability:** In `src/lib/request/request.ts`, `setupRequest()` logged `debug(json)` where `json` was the unredacted stringified request body generated for `zlib.gzipSync()`, exposing sensitive fields (passwords, tokens, API keys, credentials) in `snyk:req` debug logs. Additionally, `sanitizePayloadForLog()` did not sanitize `qs` or `body` payload properties.

**Learning:** Reusing the same stringified JSON variable created for upstream transport compression (`zlib.gzipSync(json)`) directly in debug logging skips payload sanitization routines.

**Prevention:** Always create a sanitized representation of payload objects (`sanitizeObjectForLog`) before stringifying and logging request bodies or query objects, ensuring the unredacted payload remains intact for upstream transport.
