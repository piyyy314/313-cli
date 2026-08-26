# Sentinel Security Journal

## 2025-05-15 - Eliminating Command Injection in Binary Presence Checking via `execFile`

**Vulnerability:** `src/lib/analytics/sources.ts` executed shell commands via `exec(`${whichCommand} ${commandToCheck}`)` to test if binaries were installed. Using `exec` allowed arbitrary shell command evaluation if `commandToCheck` contained special characters. Additionally, `runCommand` resolved rather than rejected on process error, impairing binary presence detection.
**Learning:** Checking binary availability with shell strings introduces command injection vectors. Refactoring process execution to `execFile(binary, [arg1, arg2])` completely bypasses shell parsing. Rejection on execution failure is required for `try/catch` checks like `isInstalled` to accurately report missing binaries.
**Prevention:** Always use `execFile` with discrete argument arrays rather than string interpolation with shell `exec`. Ensure sub-process execution helpers reject promises on non-zero exit codes or process errors to allow caller error handling to work correctly.

## 2025-02-13 - Mitigating OS Command Injection in Sub-process Spawning

**Vulnerability:** The helper utility `sub-process.execute` was hardcoded to run processes with `{ shell: true }` by default. Spawning child processes via a shell is a major security risk, as any unvalidated or improperly escaped input in parameters or option fields (such as dynamic `cwd` or `args` derived from project/user files) could lead to OS command injection and arbitrary code execution.
**Learning:** Legacy design patterns often prioritized shell-level features (like global variable interpolation or shell built-ins like `echo`) by default at the cost of security. By enforcing `shell: false` as the default and requiring an explicit, conscious opt-in (`{ shell: true }`), we align with modern secure-by-default software engineering standards.
**Prevention:** Avoid running processes inside shell environments unless absolutely necessary. When spawning processes, explicitly pass `{ shell: false }` or use APIs that do not invoke the shell interpreter. If shell integration is unavoidable, strictly validate and escape all inputs before passing them to the shell interpreter.
