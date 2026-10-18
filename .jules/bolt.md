## 2025-05-18 - Avoid Object.keys() allocations in vulnerability predicate checks

**Learning:** Checking for object property presence using `Object.keys(obj).length > 0` forces V8 to allocate an array containing all property names. Using a `for...in` loop with `Object.prototype.hasOwnProperty.call(obj, key)` provides an O(1) early-exit check that avoids heap allocation entirely.
**Action:** Use a `hasKeys` helper function with early return for property existence checks on hot paths or large objects.

## 2025-05-19 - Partition object keys in a single pass instead of chained Object.keys().filter()

**Learning:** Chaining multiple `Object.keys(obj).filter(...)` calls creates multiple temporary key arrays and iterates over the same key set multiple times. Using a single `for...in` loop to partition keys into separate target arrays reduces heap allocations and loop iterations from O(N \* P) to O(N).
**Action:** Replace multiple `Object.keys().filter()` passes on the same object with a single-pass `for...in` loop.
