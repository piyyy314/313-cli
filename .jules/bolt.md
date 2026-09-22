# Bolt Performance Journal

## 2026-08-11 - O(1) Set caching over recursive directory traversals with WeakMap

**Learning:** During recursive file and directory traversal operations (such as `find` in `find-files.ts`), lookup checks (like `isExcludedPath`) are called for every single traversed node with the exact same list of exclusion paths. Standard array searching (`Array.includes` or `Array.some`) takes $O(N)$ per call, yielding $O(M \times N)$ time overall for $M$ files and $N$ exclusions. On Windows, this is worsened by string lowercasing inside the loop. By mapping the array reference to a pre-computed case-normalized `Set` using a `WeakMap`, lookups are optimized to $O(1)$ without changing public API signatures or risking memory leaks.

**Action:** Whenever a recursive search, walk, or loop performs repeated checks against a shared configuration array, convert that array into a `Set` (and cache it via `WeakMap` if the array is passed by reference) to avoid quadratic overhead.

## 2026-08-12 - Caching Synchronous Environment Queries for isDocker()

**Learning:** Utility functions that check environmental factors (like containerized environments with `isDocker()`) often rely on synchronous filesystem operations (`fs.statSync` and `fs.readFileSync`). Since a process's containerized state remains constant during a single CLI execution, making these redundant disk I/O calls on every call degrades execution time. Memoizing the result inside a module-level variable avoids unnecessary disk overhead. To preserve unit test isolation and avoid cross-test contamination, a cache-reset helper (`resetIsDockerCache()`) must be exported and called in `beforeEach` hooks.

**Action:** Cache the results of environmental, system, and config checks that remain invariant during a single process lifetime, and provide a reset helper for unit tests to prevent state leakage.
