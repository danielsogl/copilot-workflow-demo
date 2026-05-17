# @ngrx/signals — Testing

Stores are Angular providers. Test them via `TestBed.inject(Store)` and the store's public API only.

## Guiding principle

**Test the public surface, not the wiring.** Assert on signal values and on the side effects of methods. Don't reach into private slices, don't replace methods, don't introspect `signalStore` internals — those are implementation details and they will move.

## Basic store test

```typescript
import { TestBed } from "@angular/core/testing";
import {
  signalStore,
  withComputed,
  withMethods,
  withState,
  patchState,
} from "@ngrx/signals";

const CounterStore = signalStore(
  { providedIn: "root" },
  withState({ count: 0 }),
  withComputed(({ count }) => ({
    doubleCount: () => count() * 2,
  })),
  withMethods((store) => ({
    increment() {
      patchState(store, ({ count }) => ({ count: count + 1 }));
    },
  })),
);

describe("CounterStore", () => {
  it("exposes initial state and derived doubleCount", () => {
    const store = TestBed.inject(CounterStore);

    expect(store.count()).toBe(0);
    expect(store.doubleCount()).toBe(0);
  });

  it("updates count and doubleCount on increment", () => {
    const store = TestBed.inject(CounterStore);

    store.increment();
    expect(store.count()).toBe(1);
    expect(store.doubleCount()).toBe(2);
  });
});
```

## Mocking injected services

Provide the mock through `TestBed.configureTestingModule` — same as any Angular DI override.

```typescript
@Injectable({ providedIn: "root" })
class StepService {
  getStep() {
    return 1;
  }
}

const CounterStore = signalStore(
  { providedIn: "root" },
  withState({ count: 0 }),
  withMethods((store, stepService = inject(StepService)) => ({
    increment() {
      patchState(store, ({ count }) => ({
        count: count + stepService.getStep(),
      }));
    },
  })),
);

describe("CounterStore", () => {
  it("uses the injected step", () => {
    TestBed.configureTestingModule({
      providers: [{ provide: StepService, useValue: { getStep: () => 3 } }],
    });

    const store = TestBed.inject(CounterStore);
    store.increment();
    expect(store.count()).toBe(3);
  });
});
```

Passing the dependency via a default parameter (`stepService = inject(StepService)`) is what makes overrides clean. Avoid calling `inject()` inside method bodies — it works, but the dependency becomes invisible from the signature.

## Testing async methods (Promise-based)

```typescript
it("loadAll fills entities and flips status", async () => {
  const fakeBooks = [
    { id: "1", title: "A" },
    { id: "2", title: "B" },
  ];
  TestBed.configureTestingModule({
    providers: [
      {
        provide: BooksService,
        useValue: { getAll: () => Promise.resolve(fakeBooks) },
      },
    ],
  });

  const store = TestBed.inject(BooksStore);

  expect(store.requestStatus()).toBe("idle");
  await store.loadAll();
  expect(store.requestStatus()).toBe("fulfilled");
  expect(store.entities()).toEqual(fakeBooks);
});
```

## Testing `signalMethod`

`signalMethod` reacts inside an injection context. For value calls, just call. For signal-driven calls, wrap in `TestBed.runInInjectionContext` and use `expect.poll` or `TestBed.tick()`.

```typescript
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";

const CounterStore = signalStore(
  { providedIn: "root" },
  withState({ count: 0 }),
  withMethods((store) => ({
    increment: signalMethod<number>((step) => {
      patchState(store, ({ count }) => ({ count: count + step }));
    }),
  })),
);

describe("CounterStore.increment (signalMethod)", () => {
  it("increments by a static step synchronously", () => {
    const store = TestBed.inject(CounterStore);
    store.increment(1);
    expect(store.count()).toBe(1);
    store.increment(2);
    expect(store.count()).toBe(3);
  });

  it("increments by a signal step after tick", async () => {
    const store = TestBed.inject(CounterStore);
    const step = signal(2);

    TestBed.runInInjectionContext(() => store.increment(step));
    expect(store.count()).toBe(0);

    await expect.poll(() => store.count()).toBe(2);

    step.set(3);
    TestBed.tick();
    expect(store.count()).toBe(5);
  });
});
```

## Testing `rxMethod`

Same idea — `rxMethod` runs inside an injection context, you trigger it by calling, and use `expect.poll` (or marble tests) for async assertions.

```typescript
it("loadByQuery debounces and stores results", async () => {
  const api = {
    getByQuery: jest.fn().mockResolvedValue([{ id: "1", title: "A" }]),
  };
  TestBed.configureTestingModule({
    providers: [{ provide: BooksService, useValue: api }],
  });

  const store = TestBed.inject(BookSearchStore);
  store.loadByQuery("ang");

  await expect.poll(() => store.books().length).toBe(1);
  expect(api.getByQuery).toHaveBeenCalledWith("ang");
});
```

## Testing custom features

Wrap the feature in a tiny throwaway `signalStore` and assert on it. Features are best tested in isolation; once they pass here, they need no re-testing in every host store.

```typescript
import { TestBed } from "@angular/core/testing";
import {
  signalStore,
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  patchState,
} from "@ngrx/signals";

function withCounter() {
  return signalStoreFeature(
    withState({ count: 0 }),
    withComputed(({ count }) => ({ doubleCount: () => count() * 2 })),
    withMethods((store) => ({
      increment() {
        patchState(store, ({ count }) => ({ count: count + 1 }));
      },
    })),
  );
}

describe("withCounter", () => {
  it("initial state, computed, and increment all wired", () => {
    const CounterStore = signalStore({ providedIn: "root" }, withCounter());
    const store = TestBed.inject(CounterStore);

    expect(store.count()).toBe(0);
    expect(store.doubleCount()).toBe(0);

    store.increment();
    expect(store.count()).toBe(1);
    expect(store.doubleCount()).toBe(2);
  });
});
```

## Things to avoid in tests

- `(store as any)._privateSlice()` — if you need to assert private state, the API is wrong, not the test.
- Spying on internal `effect()` calls.
- Relying on call order across `withComputed` slices — order is an implementation detail of the feature, not the contract.
- Mocking `patchState`. It's a free function from `@ngrx/signals`; let it do its job.
