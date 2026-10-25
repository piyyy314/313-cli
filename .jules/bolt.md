## 2025-05-18 - Avoid Object.keys() allocations in vulnerability predicate checks

**Learning:** Checking for object property presence using `Object.keys(obj).length > 0` forces V8 to allocate an array containing all property names. Using a `for...in` loop with `Object.prototype.hasOwnProperty.call(obj, key)` provides an O(1) early-exit check that avoids heap allocation entirely.
**Action:** Use a `hasKeys` helper function with early return for property existence checks on hot paths or large objects.

## 2025-05-18 - Guard debug calculations and avoid single-element array allocations in file scanning

**Learning:** Computing debug logging diffs in directory traversal without checking `debug.enabled` incurs O(N\*M) array filter overhead even when debug output is disabled. Furthermore, calling `.filter(...)[0]` with inline single-element arrays like `['package.json'].includes(...)` forces temporary array allocation and full array traversal when `.find()` with string equality short-circuits in O(1) time.
**Action:** Always guard expensive debug string formatting behind `if (debug.enabled)` and use `.find()` for first-match searches with pre-computed `Set` references or direct string comparison.
