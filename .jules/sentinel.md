## 2025-05-18 - Avoid shell execution for CLI binary detection
**Vulnerability:** Shell command injection risk in binary existence checks using child_process.exec with string formatting.
**Learning:** `runCommand` in `src/lib/analytics/sources.ts` was using `exec` with string concatenation (`which ${commandToCheck}`), which could execute arbitrary shell commands if `commandToCheck` contained shell metacharacters.
**Prevention:** Always use `child_process.execFile` with discrete argument arrays (`[commandToCheck]`) when checking binary existence.
