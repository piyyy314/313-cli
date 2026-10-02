## 2025-05-18 - Avoid Object.keys() allocations in vulnerability predicate checks

**Learning:** Checking for object property presence using `Object.keys(obj).length > 0` forces V8 to allocate an array containing all property names. Using a `for...in` loop with `Object.prototype.hasOwnProperty.call(obj, key)` provides an O(1) early-exit check that avoids heap allocation entirely.
**Action:** Use a `hasKeys` helper function with early return for property existence checks on hot paths or large objects.

## 2025-05-19 - Pre-compute severity lookup maps to avoid array traversal

**Learning:** Invoking `SEVERITIES.find()` in frequent utility calls (like `getSeverityValue`) performs array iterations and closure invocations on hot paths such as sorting vulnerabilities or formatting reports. Pre-computing a static `Record<string, number>` map at module load time turns lookups into O(1) dictionary reads without runtime allocation overhead.
**Action:** Pre-compute static map lookups for constant lookup tables used in sorting and filtering loops.
