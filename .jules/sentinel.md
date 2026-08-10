# Sentinel Security Journal

## 2025-02-13 - Mitigating OS Command Injection in Sub-process Spawning

**Vulnerability:** The helper utility `sub-process.execute` was hardcoded to run processes with `{ shell: true }` by default. Spawning child processes via a shell is a major security risk, as any unvalidated or improperly escaped input in parameters or option fields (such as dynamic `cwd` or `args` derived from project/user files) could lead to OS command injection and arbitrary code execution.
**Learning:** Legacy design patterns often prioritized shell-level features (like global variable interpolation or shell built-ins like `echo`) by default at the cost of security. By enforcing `shell: false` as the default and requiring an explicit, conscious opt-in (`{ shell: true }`), we align with modern secure-by-default software engineering standards.
**Prevention:** Avoid running processes inside shell environments unless absolutely necessary. When spawning processes, explicitly pass `{ shell: false }` or use APIs that do not invoke the shell interpreter. If shell integration is unavoidable, strictly validate and escape all inputs before passing them to the shell interpreter.
