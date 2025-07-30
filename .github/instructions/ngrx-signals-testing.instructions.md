---
applyTo: "**/*.spec.ts"
---

Follow these patterns for all NgRx Signals Store tests. Use Vitest, Angular's latest APIs, and strong typing. For more, see the official NgRx Signals documentation.

These guidelines outline best practices for testing NgRx Signals Stores in Angular applications.

## 1. General Testing Patterns

- **Public API Testing:** Tests interact with stores through their public API
- **TestBed Usage:** Angular's `TestBed` instantiates and injects Signal Stores
- **Dependency Mocking:** Tests mock store dependencies using TestBed providers
- **Store Mocking:** Component tests mock stores for unit testing
- **State and Computed Testing:** Tests assert on signal and computed property values
- **Method Testing:** Tests trigger methods and assert on resulting state
- **Protected State Access:** The `unprotected` utility from `@ngrx/signals/testing` accesses protected state
- **Integration Testing:** Tests cover stores and components together
- **Custom Extension Testing:** Tests verify custom store features in isolation

## 2. Basic Store Testing

### Globally Provided Store

```typescript
import { TestBed } from "@angular/core/testing";

describe("MoviesStore", () => {
  it("should verify that three movies are available", () => {
    const store = TestBed.inject(MoviesStore);
    expect(store.movies()).toHaveLength(3);
  });
});
```

### Locally Provided Store

```typescript
import { TestBed } from "@angular/core/testing";

describe("MoviesStore", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MoviesStore],
    });
  });

  it("should verify that three movies are available", () => {
    const store = TestBed.inject(MoviesStore);
    expect(store.movies()).toHaveLength(3);
  });
});
```

## 3. Testing with `unprotected` Utility

```typescript
import { TestBed } from "@angular/core/testing";
import { unprotected } from "@ngrx/signals/testing";
import { patchState } from "@ngrx/signals";

describe("CounterStore", () => {
  it("recomputes doubleCount on count changes", () => {
    const counterStore = TestBed.inject(CounterStore);
    patchState(unprotected(counterStore), { count: 10 });
    expect(counterStore.doubleCount()).toBe(20);
  });
});
```

## 4. Testing Computed Properties

```typescript
describe("MoviesStore", () => {
  it("should compute movies count correctly", () => {
    const store = TestBed.inject(MoviesStore);
    expect(store.moviesCount()).toBe(3);
  });
});
```

## 5. Testing withMethods and Async Operations

```typescript
import { TestBed } from "@angular/core/testing";
import { fakeAsync, tick } from "@angular/core/testing";

describe("MoviesStore", () => {
  it("should load movies of Warner Bros", fakeAsync(() => {
    const moviesService = {
      loadMovies: () =>
        Promise.resolve([
          { id: 1, name: "Harry Potter" },
          { id: 2, name: "The Dark Knight" },
        ]),
    };

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        {
          provide: MoviesService,
          useValue: moviesService,
        },
      ],
    });

    const store = TestBed.inject(MoviesStore);
    store.load("Warner Bros");
    expect(store.loading()).toBe(true);

    tick();

    expect(store.moviesCount()).toBe(2);
    expect(store.loading()).toBe(false);
  }));
});
```

## 6. Testing rxMethod with Observables

```typescript
import { Subject } from "rxjs";
import { delay } from "rxjs/operators";

describe("MoviesStore with rxMethod", () => {
  const setup = () => {
    const moviesService = {
      load: vi.fn((studio: string) =>
        of([
          studio === "Warner Bros"
            ? { id: 1, name: "Harry Potter" }
            : { id: 2, name: "Jurassic Park" },
        ]).pipe(delay(100)),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        {
          provide: MoviesService,
          useValue: moviesService,
        },
      ],
    });

    return TestBed.inject(MoviesStore);
  };

  it("should cancel running request when new one is made", fakeAsync(() => {
    const store = setup();
    const studio$ = new Subject<string>();
    store.load(studio$);

    studio$.next("Warner Bros");
    tick(50);
    studio$.next("Universal");
    tick(50);

    expect(store.movies()).toEqual([]);
    expect(store.loading()).toBe(true);

    tick(50);
    expect(store.movies()).toEqual([{ id: 2, name: "Jurassic Park" }]);
    expect(store.loading()).toBe(false);
  }));
});
```

## 7. Testing rxMethod with Signals

```typescript
import { signal } from "@angular/core";

describe("MoviesStore with Signal input", () => {
  it("should handle signal changes", fakeAsync(() => {
    const store = setup();
    const studio = signal("Warner Bros");
    store.load(studio);

    tick(100);
    expect(store.movies()).toEqual([{ id: 1, name: "Harry Potter" }]);

    studio.set("Universal");
    tick(100);
    expect(store.movies()).toEqual([{ id: 2, name: "Jurassic Park" }]);
  }));

  it("should require TestBed.tick() for synchronous operations", () => {
    const store = setup();
    const studio = signal("Warner Bros");
    store.load(studio);
    TestBed.tick(); // Required for synchronous execution
    expect(store.movies()).toEqual([{ id: 1, name: "Harry Potter" }]);
  });
});
```

## 8. Store Mocking for Component Tests

### Native Mocking

```typescript
import { signal } from "@angular/core";

it("should show movies (native mocking)", () => {
  const load = vi.fn<void, [Signal<string>]>();
  const moviesStore = {
    movies: signal(new Array<Movie>()),
    loading: signal(false),
    load,
  };

  TestBed.configureTestingModule({
    imports: [MoviesComponent],
    providers: [
      {
        provide: MoviesStore,
        useValue: moviesStore,
      },
    ],
  });

  const fixture = TestBed.createComponent(MoviesComponent);
  fixture.autoDetectChanges(true);

  moviesStore.movies.set([
    { id: 1, name: "Harry Potter" },
    { id: 2, name: "The Dark Knight" },
  ]);
  fixture.detectChanges();

  const movieNames = fixture.debugElement
    .queryAll(By.css("p"))
    .map((el) => el.nativeElement.textContent);
  expect(movieNames).toEqual(["1: Harry Potter", "2: The Dark Knight"]);
});
```

### Partial Mocking with Spies

```typescript
it("should show movies (spy approach)", () => {
  TestBed.configureTestingModule({
    imports: [MoviesComponent],
    providers: [
      MoviesStore,
      {
        provide: MoviesService,
        useValue: {},
      },
    ],
  });

  const moviesStore = TestBed.inject(MoviesStore);
  const loadSpy = vi.spyOn(moviesStore, "load");

  patchState(moviesStore, {
    movies: [
      { id: 1, name: "Harry Potter" },
      { id: 2, name: "The Dark Knight" },
    ],
  });

  const fixture = TestBed.createComponent(MoviesComponent);
  fixture.detectChanges();

  const movies = fixture.debugElement
    .queryAll(By.css("p"))
    .map((el) => el.nativeElement.textContent);
  expect(movies).toEqual(["1: Harry Potter", "2: The Dark Knight"]);
});
```

## 9. Integration Testing

```typescript
it("should show movies with MoviesStore", async () => {
  const fixture = TestBed.configureTestingModule({
    imports: [MoviesComponent],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  }).createComponent(MoviesComponent);

  const ctrl = TestBed.inject(HttpTestingController);
  fixture.autoDetectChanges(true);

  const input: HTMLInputElement = fixture.debugElement.query(
    By.css("input"),
  ).nativeElement;

  input.value = "Warner Bros";
  input.dispatchEvent(new Event("input"));

  ctrl.expectOne("https://movies.com/studios?query=Warner%20Bros").flush([
    { id: 1, name: "Harry Potter" },
    { id: 2, name: "The Dark Knight" },
  ]);

  await fixture.whenStable();

  const movies = fixture.debugElement
    .queryAll(By.css("p"))
    .map((el) => el.nativeElement.textContent);
  expect(movies).toEqual(["1: Harry Potter", "2: The Dark Knight"]);
  ctrl.verify();
});
```

## 10. Testing Custom Extensions

```typescript
describe("withPlayTracking", () => {
  const TrackedPlayStore = signalStore(
    { providedIn: "root" },
    withPlayTracking(),
  );

  it("should track movie play time", fakeAsync(() => {
    const store = TestBed.inject(TrackedPlayStore);

    store.play(1);
    tick(1000);
    store.stop();

    store.play(2);
    tick(1000);
    store.play(1);
    tick(1000);
    store.stop();

    expect(store.trackedData()).toEqual({ 1: 2000, 2: 1000 });
  }));
});
```

## Key Testing Principles

- Always test through the public API, not internal implementations
- Use `TestBed` for proper dependency injection and Angular context
- Mock dependencies, not the store itself when testing the store
- Use `unprotected` utility only when necessary for state manipulation
- Prefer integration tests for simple stores and component interactions
- Use `fakeAsync` and `tick()` for testing asynchronous operations
- Call `TestBed.tick()` when testing synchronous rxMethod operations with signals
