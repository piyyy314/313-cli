# Bolt Performance Journal

## 2026-08-11 - O(1) Set caching over recursive directory traversals with WeakMap

**Learning:** During recursive file and directory traversal operations (such as `find` in `find-files.ts`), lookup checks (like `isExcludedPath`) are called for every single traversed node with the exact same list of exclusion paths. Standard array searching (`Array.includes` or `Array.some`) takes $O(N)$ per call, yielding $O(M \times N)$ time overall for $M$ files and $N$ exclusions. On Windows, this is worsened by string lowercasing inside the loop. By mapping the array reference to a pre-computed case-normalized `Set` using a `WeakMap`, lookups are optimized to $O(1)$ without changing public API signatures or risking memory leaks.

**Action:** Whenever a recursive search, walk, or loop performs repeated checks against a shared configuration array, convert that array into a `Set` (and cache it via `WeakMap` if the array is passed by reference) to avoid quadratic overhead.

## 2026-08-11 - Pre-indexing file pattern lists by basename for O(1) path checks

**Learning:** When checking whether file paths correspond to target manifest or configuration files (like `isPathToPackageFile` checking against `DETECTABLE_FILES`), iterating linearly through a list of file path patterns with `.endsWith()` results in $O(N)$ comparisons per checked path ($O(M \times N)$ total for $M$ paths). By pre-indexing the pattern list into a `Map` keyed by `path.basename()`, candidates can be retrieved in $O(1)$ time, reducing the check to only matching candidates. Grouping candidate patterns into arrays per basename preserves support for multiple patterns sharing the same basename (e.g., `obj/project.assets.json` vs `project.assets.json`).

**Action:** When validating file paths against a fixed list of path patterns during tree traversals or file scans, index the pattern list by basename in a `Map<string, string[]>` to avoid linear scanning over non-matching file names.
