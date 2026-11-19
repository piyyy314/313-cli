## 2025-02-14 - Redact Embedded Credentials in Git Remote URLs

**Vulnerability:** Git remote origin URLs containing basic authentication credentials or access tokens (e.g., `https://user:pass@host/repo.git` or `https://token@github.com/org/repo.git`) retained credentials when constructing `target.remoteUrl` in project metadata because Node's `url.parse(url).host` includes `user:pass@`.

**Learning:** `url.parse(url)` populates `host` with `user:pass@hostname:port`, whereas `hostname` contains only the domain/host name and `port` contains the port number without authentication credentials.

**Prevention:** When sanitizing or constructing clean URLs from `url.parse()`, construct the clean host using `hostname` and optional `port` rather than `host` to prevent leaking embedded basic auth or token credentials in analytics, monitor payloads, or debug logs.

## 2025-05-18 - Parameterized Command Execution for Git Log Analysis

**Vulnerability:** In `src/lib/monitor/dev-count-analysis.ts`, git log command strings were constructed via string interpolation and executed via `child_process.exec()`, allowing potential command injection if parameters or paths contained shell metacharacters.

**Learning:** Invoking external commands via `exec` spawns a system shell (`/bin/sh` or `cmd.exe`) which evaluates shell metacharacters, whereas `execFile` executes binaries directly with discrete argument arrays without shell interpolation.

**Prevention:** Always use `execFile` or `spawn` with discrete argument arrays rather than concatenating command strings with `exec` when shelling out to git or other CLI utilities.
