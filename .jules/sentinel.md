## 2025-05-18 - Git Remote URL Credential Leakage in Project Metadata
**Vulnerability:** Git remote URLs containing embedded basic auth credentials (e.g. `https://user:password@github.com/...`) or tokens were being included in cleartext in `target.remoteUrl` project metadata.
**Learning:** `url.parse(origin).host` includes `auth` (`username:password@`), whereas `hostname` and `port` contain only the domain and optional port without credentials.
**Prevention:** When formatting or sanitizing URLs for metadata or logging, always reconstruct hosts using `hostname` and `port` instead of `host` to strip embedded credentials.
