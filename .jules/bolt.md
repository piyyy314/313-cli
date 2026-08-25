# Bolt Performance Journal

## 2026-08-11 - O(1) Set caching over recursive directory traversals with WeakMap

**Learning:** During recursive file and directory traversal operations (such as `find` in `find-files.ts`), lookup checks (like `isExcludedPath`) are called for every single traversed node with the exact same list of exclusion paths. Standard array searching (`Array.includes` or `Array.some`) takes $O(N)$ per call, yielding $O(M \times N)$ time overall for $M$ files and $N$ exclusions. On Windows, this is worsened by string lowercasing inside the loop. By mapping the array reference to a pre-computed case-normalized `Set` using a `WeakMap`, lookups are optimized to $O(1)$ without changing public API signatures or risking memory leaks.

**Action:** Whenever a recursive search, walk, or loop performs repeated checks against a shared configuration array, convert that array into a `Set` (and cache it via `WeakMap` if the array is passed by reference) to avoid quadratic overhead.

## 2026-08-11 - Single-pass Map grouping over repeated array searches in git log parsing

**Learning:** `GitRepoCommitStats.getRepoContributors` was performing $O(U \times N)$ array searches (where $U$ is unique authors and $N$ is commit count) by calling `getMostRecentCommitTimestamp` for each unique author. Because commits from `git log` are processed in reverse chronological order (newest first), a single $O(N)$ linear pass using a `Map` collects each unique author's latest commit date on first encounter, eliminating quadratic array traversals and redundant array allocations.

**Action:** When aggregating distinct entities from an ordered dataset, build the result in a single pass using a `Map` (inserting on first match) instead of extracting unique keys and re-querying the collection for each key.
