# Bolt's Journal

## 2026-08-10 - Optimizing Environment & Container Detection Checks
**Learning:** Checking environmental properties like CI status using `Object.keys(process.env).some(...)` causes redundant array allocations and $O(n)$ scanning of the process environment on every single lookup. Similarly, checking if running in a Docker container using synchronous file system reads (`fs.statSync` and `fs.readFileSync`) blocks the thread and incurs heavy overhead when executed repetitively. Caching these checks at the module level while bypassing the cache in test environments (`process.env.NODE_ENV === 'test'`) delivers huge speedups and keeps unit tests perfectly clean and isolated.
**Action:** Always prefer checking specific Set keys directly on `process.env` (which has $O(1)$ complexity) instead of scanning/allocating keys. Cache immutable environmental checks after the first execution using test-safe conditions.
