# NgRx Signals Testing Guidelines

These guidelines outline best practices for testing NgRx Signals Stores in Angular applications.

## 1. General Testing Patterns

- **Public API Testing:** Tests interact with stores through their public API
- **TestBed Usage:** Angular's `TestBed` instantiates and injects Signal Stores
- **Dependency Mocking:** Tests mock store dependencies
- **Store Mocking:** Component tests mock stores
- **State and Computed Testing:** Tests assert on signal and computed property values
- **Method Testing:** Tests trigger methods and assert on resulting state
- **Protected State Access:** The `unprotected` utility from `@ngrx/signals/testing` accesses protected state
- **Integration Testing:** Tests cover stores and components together
- **Custom Extension Testing:** Tests verify custom store features

## 2. Example: Store Testing

```typescript
import { TestBed } from "@angular/core/testing";
import { unprotected } from "@ngrx/signals/testing";

describe("CounterStore", () => {
  it("recomputes doubleCount on count changes", () => {
    const counterStore = TestBed.inject(CounterStore);
    patchState(unprotected(counterStore), { count: 10 });
    expect(counterStore.doubleCount()).toBe(20);
  });
});
```

---

Follow these patterns for all NgRx Signals Store tests. Use Jasmine, Angular’s latest APIs, and strong typing. For more, see the official NgRx Signals documentation.
