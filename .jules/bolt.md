# Bolt's Journal

## 2026-08-10 - Optimizing Environment & Container Detection Checks

**Learning:** Checking environmental properties like CI status using `Object.keys(process.env).some(...)` causes redundant array allocations and $O(n)$ scanning of the process environment on every single lookup. Similarly, checking if running in a Docker container using synchronous file system reads (`fs.statSync` and `fs.readFileSync`) blocks the thread and incurs heavy overhead when executed repetitively. Caching these checks at the module level while bypassing the cache in test environments (`process.env.NODE_ENV === 'test'`) delivers huge speedups and keeps unit tests perfectly clean and isolated.
**Action:** Always prefer checking specific Set keys directly on `process.env` (which has $O(1)$ complexity) instead of scanning/allocating keys. Cache immutable environmental checks after the first execution using test-safe conditions.

## 2026-09-02 - Eliminating Array Allocations and lodash.flatten in Recursive Dependency Traversal

**Learning:** In recursive dependency tree operations like policy extraction (`pluckPolicies`), calling `Object.keys(pkg.dependencies).map(...).filter(...)` and wrapping the output in `lodash.flatten` causes massive GC pressure and performance degradation due to creating hundreds or thousands of temporary arrays. Using an inner recursive function with a single accumulator array and `for...in` loops eliminates $O(N \cdot depth)$ temporary allocations and array copying completely.
**Action:** Replace `Object.keys().map()` + `lodash.flatten` in recursive dependency graph traversals with `for...in` loops and a single accumulator array.
