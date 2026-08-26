# Sentinel Security Journal

## 2026-08-11 - Secure Default for Subprocess Execution

**Vulnerability:** The core subprocess execution helper `sub-process.execute` defaulted to running commands with `{ shell: true }`. This bypassed node's safe spawn arguments parsing and exposed any calls to command injection if arguments contained untrusted/unsanitized user input.
**Learning:** `shell: true` was originally used to ease running platform-specific commands and shell variables (e.g., in testing). However, making this the default behavior for all process executions violates the principle of "secure by default" and increases the vulnerability surface.
**Prevention:** Always default child process spawning to `{ shell: false }`. Require callers that explicitly need shell features to pass `{ shell: true }` in options.

## 2026-08-12 - Handling Spawning Failures Gracefully to Prevent Process Crashes

**Vulnerability:** The core subprocess execution helper `sub-process.execute` did not register an `'error'` event listener on the spawned process. When process spawning fails (such as an invalid command, missing executable, or system limit issue), Node's `child_process.spawn` emits an unhandled `'error'` event. If no listener is attached, Node.js throws an uncaught exception, crashing the entire application or causing infinite promise hangs.
**Learning:** Attaching standard stdout/stderr and close/exit listeners is insufficient. Spawning-level failures must be intercepted via the `'error'` event to reject promises gracefully and keep the main process resilient.
**Prevention:** Always register a `.on('error', (err) => reject(err))` handler on any spawned processes to capture failures and reject the execution promise cleanly.
