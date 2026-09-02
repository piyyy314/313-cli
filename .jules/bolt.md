# Bolt's Journal

## 2026-08-11 - Pre-computing Command Alias Maps & Validation Sets for Hot CLI Paths

**Learning:** Re-computing command alias maps (`abbrev(...)`) and array checks (`Object.keys(...).includes(...)`) or `SEVERITIES.map(...).indexOf(...)` during every CLI argument parsing and validation execution creates unnecessary heap allocations and $O(N)$ linear scans on hot paths. Pre-computing static mappings (`modeAliases`, `ARG_TRANSFORM_MAP`) and `Set` lookups (`VALID_SEVERITY_THRESHOLDS`, `VALID_FAIL_ON_VALUES`) at module initialization converts runtime parsing/validation from $O(N)$ to $O(1)$ constant time with zero dynamic array/object allocations.
**Action:** Statically pre-compute `abbrev` maps, enum validation `Set`s, and string transform lookup tables at module load time for CLI option parsers.

## 2026-08-10 - Optimizing Environment & Container Detection Checks

**Learning:** Checking environmental properties like CI status using `Object.keys(process.env).some(...)` causes redundant array allocations and $O(n)$ scanning of the process environment on every single lookup. Similarly, checking if running in a Docker container using synchronous file system reads (`fs.statSync` and `fs.readFileSync`) blocks the thread and incurs heavy overhead when executed repetitively. Caching these checks at the module level while bypassing the cache in test environments (`process.env.NODE_ENV === 'test'`) delivers huge speedups and keeps unit tests perfectly clean and isolated.
**Action:** Always prefer checking specific Set keys directly on `process.env` (which has $O(1)$ complexity) instead of scanning/allocating keys. Cache immutable environmental checks after the first execution using test-safe conditions.
