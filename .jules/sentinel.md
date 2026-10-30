## 2025-02-14 - Redact Embedded Credentials in Git Remote URLs

**Vulnerability:** Git remote origin URLs containing basic authentication credentials or access tokens (e.g., `https://user:pass@host/repo.git` or `https://token@github.com/org/repo.git`) retained credentials when constructing `target.remoteUrl` in project metadata because Node's `url.parse(url).host` includes `user:pass@`.

**Learning:** `url.parse(url)` populates `host` with `user:pass@hostname:port`, whereas `hostname` contains only the domain/host name and `port` contains the port number without authentication credentials.

**Prevention:** When sanitizing or constructing clean URLs from `url.parse()`, construct the clean host using `hostname` and optional `port` rather than `host` to prevent leaking embedded basic auth or token credentials in analytics, monitor payloads, or debug logs.

## 2025-05-18 - Prevent Command Injection in Git Log Analysis

**Vulnerability:** `execShell` in `src/lib/monitor/dev-count-analysis.ts` used `child_process.exec` to execute `git log` string commands, spawning an OS shell environment susceptible to command injection if paths or parameters were modified.

**Learning:** Calling `exec` spawns a system shell (`/bin/sh` or `cmd.exe`) which interprets shell metacharacters in command strings.

**Prevention:** Use `child_process.execFile` with discrete argument arrays rather than shell execution string commands via `exec` to execute binaries securely without shell subshell spawning.
