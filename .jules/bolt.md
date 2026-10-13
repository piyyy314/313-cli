## 2025-05-18 - Avoid Object.keys() allocations in vulnerability predicate checks

**Learning:** Checking for object property presence using `Object.keys(obj).length > 0` forces V8 to allocate an array containing all property names. Using a `for...in` loop with `Object.prototype.hasOwnProperty.call(obj, key)` provides an O(1) early-exit check that avoids heap allocation entirely.
**Action:** Use a `hasKeys` helper function with early return for property existence checks on hot paths or large objects.
