# Testing NgRx Signal Stores: Vitest + Angular TestBed

Source: https://ngrx.io/guide/signals/signal-store/testing

Stack: **Vitest 4+**, **Angular TestBed**, **ng-mocks**, `provideZonelessChangeDetection`, `provideHttpClientTesting`

## Setup

Always include `provideZonelessChangeDetection()` in every `TestBed.configureTestingModule` call:

```typescript
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [MyStore, provideZonelessChangeDetection()],
  });
});
```

For globally provided stores (`{ providedIn: 'root' }`), use `TestBed.inject` directly without configuring the module.

## Testing State Signals

```typescript
it("has correct initial state", () => {
  const store = TestBed.inject(TaskStore);

  expect(store.loading()).toBe(false);
  expect(store.error()).toBeNull();
  expect(store.taskEntities()).toHaveLength(0);
});
```

## Testing Computed Signals

```typescript
it("computes task count", () => {
  const store = TestBed.inject(TaskStore);

  expect(store.taskCount()).toBe(0);
});
```

## Accessing Protected State (unprotected)

Use `unprotected` from `@ngrx/signals/testing` to bypass `protectedState: true` and call `patchState` in tests:

```typescript
import { unprotected } from "@ngrx/signals/testing";
import { patchState } from "@ngrx/signals";

it("doubleCount recomputes when count changes", () => {
  const store = TestBed.inject(CounterStore);

  patchState(unprotected(store), { count: 5 });

  expect(store.doubleCount()).toBe(10);
});
```

## Mocking Services in withMethods

Use Vitest spies (`vi.fn()`) or full service mocks in `providers`:

```typescript
const mockTaskApi = {
  getAll: vi.fn().mockReturnValue(of([{ id: "1", title: "Test task" }])),
  create: vi.fn(),
  remove: vi.fn(),
};

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      TaskStore,
      provideZonelessChangeDetection(),
      { provide: TaskApi, useValue: mockTaskApi },
    ],
  });
});
```

## Testing Synchronous Methods

```typescript
it("selects a task", () => {
  const store = TestBed.inject(TaskStore);
  patchState(unprotected(store), { tasks: [{ id: "1", title: "A" }] });

  store.select("1");

  expect(store.selectedId()).toBe("1");
});
```

## Testing Async Methods (Promise-based)

```typescript
import { fakeAsync, tick } from "@angular/core/testing";

it("loads tasks", fakeAsync(() => {
  mockTaskApi.getAll.mockReturnValue(
    Promise.resolve([{ id: "1", title: "A" }]),
  );
  const store = TestBed.inject(TaskStore);

  store.loadTasks();
  expect(store.loading()).toBe(true);

  tick();

  expect(store.taskEntities()).toHaveLength(1);
  expect(store.loading()).toBe(false);
}));
```

## Testing rxMethod with Observables

Pass a synchronous Observable to trigger the pipeline immediately:

```typescript
import { of, scheduled, asyncScheduler } from "rxjs";

it("loads tasks via rxMethod with sync Observable", () => {
  mockTaskApi.getAll.mockReturnValue(of([{ id: "1", title: "A" }]));
  const store = TestBed.inject(TaskStore);

  store.loadTasks(of(undefined));

  expect(store.taskEntities()).toHaveLength(1);
  expect(store.loading()).toBe(false);
});

it("loads tasks via rxMethod with async Observable", async () => {
  mockTaskApi.getAll.mockReturnValue(
    scheduled([{ id: "1", title: "A" }], asyncScheduler),
  );
  const store = TestBed.inject(TaskStore);

  store.loadTasks(scheduled([undefined], asyncScheduler));

  await expect.poll(() => store.taskEntities()).toHaveLength(1);
});
```

## Testing Store with HTTP (provideHttpClientTesting)

```typescript
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      TaskStore,
      TaskApi,
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
});

it("calls correct API endpoint", () => {
  const store = TestBed.inject(TaskStore);
  const http = TestBed.inject(HttpTestingController);

  store.loadTasks();

  const req = http.expectOne("/api/tasks");
  req.flush([{ id: "1", title: "A" }]);

  expect(store.taskEntities()).toHaveLength(1);
  http.verify();
});
```

## Testing Custom signalStoreFeature

Test features in isolation by wrapping them in a minimal store:

```typescript
import { signalStore, withState } from "@ngrx/signals";
import { withRequestStatus } from "./with-request-status";

const TestStore = signalStore(
  withState({ items: [] as string[] }),
  withRequestStatus(),
);

it("has initial loading false", () => {
  TestBed.configureTestingModule({
    providers: [TestStore, provideZonelessChangeDetection()],
  });
  const store = TestBed.inject(TestStore);

  expect(store.loading()).toBe(false);
  expect(store.error()).toBeNull();
});
```

## Checklist

- [ ] `provideZonelessChangeDetection()` in every `configureTestingModule`
- [ ] `unprotected()` when calling `patchState` in tests for protected stores
- [ ] Services mocked via `providers` array — never call real HTTP in unit tests
- [ ] `vi.fn()` for service spy methods
- [ ] Test initial state, state after method calls, and computed signals
- [ ] Always verify `loading` and `error` transitions for async methods
