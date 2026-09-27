## 2025-05-18 - Avoid Object.keys() for non-emptiness checks

**Learning:** Calling `Object.keys(obj).length > 0` constructs an entire `string[]` array containing every own property key of `obj`. On large objects evaluated frequently during scan/remediation checks, this allocates memory on the heap and runs in O(N) time when checking if an object is non-empty.
**Action:** Use a lightweight `hasKeys(obj)` helper function (`for...in` loop with `hasOwnProperty` and early `return true`) to perform property existence checks in O(1) time without allocating key arrays.
