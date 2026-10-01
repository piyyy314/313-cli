# Sentinel Security Journal

## 2026-08-11 - Secure Default for Subprocess Execution

**Vulnerability:** The core subprocess execution helper `sub-process.execute` defaulted to running commands with `{ shell: true }`. This bypassed node's safe spawn arguments parsing and exposed any calls to command injection if arguments contained untrusted/unsanitized user input.
**Learning:** `shell: true` was originally used to ease running platform-specific commands and shell variables (e.g., in testing). However, making this the default behavior for all process executions violates the principle of "secure by default" and increases the vulnerability surface.
**Prevention:** Always default child process spawning to `{ shell: false }`. Require callers that explicitly need shell features to pass `{ shell: true }` in options.
