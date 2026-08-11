## 2025-05-15 - [Deep Clone Avoidance in Argument Obfuscation]
**Learning:** Argument parsing and sanitization occurs on startup of the CLI commands. Using `lodash.clonedeep` on generic `args` structures can be highly inefficient and consumes unnecessary memory and CPU cycles when only specific properties (`username`, `password`) are targeted for mutation/obfuscation.
**Action:** Replace `lodash.clonedeep` with targeted shallow copies and selective property modifications, ensuring exact truthy check matches to preserve functional semantics.
