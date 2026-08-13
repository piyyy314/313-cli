# Bolt Performance Journal

## 2026-08-11 - O(1) Set caching over recursive directory traversals with WeakMap

**Learning:** During recursive file and directory traversal operations (such as `find` in `find-files.ts`), lookup checks (like `isExcludedPath`) are called for every single traversed node with the exact same list of exclusion paths. Standard array searching (`Array.includes` or `Array.some`) takes $O(N)$ per call, yielding $O(M \times N)$ time overall for $M$ files and $N$ exclusions. On Windows, this is worsened by string lowercasing inside the loop. By mapping the array reference to a pre-computed case-normalized `Set` using a `WeakMap`, lookups are optimized to $O(1)$ without changing public API signatures or risking memory leaks.

**Action:** Whenever a recursive search, walk, or loop performs repeated checks against a shared configuration array, convert that array into a `Set` (and cache it via `WeakMap` if the array is passed by reference) to avoid quadratic overhead.
