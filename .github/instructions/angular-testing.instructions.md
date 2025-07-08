---
applyTo: '**/*.spec.ts'
---

# Angular Testing Guidelines (Vitest + Angular TestBed)

These guidelines reflect Angular v19+ best practices, using Vitest as the test runner with Angular TestBed for testing components, services, and other Angular constructs:

## 1. General Patterns

- Use Vitest for all test specs (`.spec.ts`), following the AAA pattern (Arrange, Act, Assert).
- Use Angular's TestBed and ComponentFixture for setup and DOM interaction.
- Use Angular Testing Library for user-centric testing when appropriate.
- Prefer standalone components, strong typing, and feature-based file structure.
- Use Vitest's built-in mocking capabilities (`vi.mock`, `vi.spyOn`) for mocking dependencies.
- Use Angular's input() and model() for signal-based inputs in tests.
- Use DebugElement and By for DOM queries, or Angular Testing Library's queries.
- Use Vitest's `vi.spyOn` and `vi.fn()` for spies and mocks.
- Use Vitest's `fakeTimers` for time-based testing.
- Use clear, descriptive test names and group related tests with `describe`.
- **Always use `provideZonelessChangeDetection()`** in test providers to run tests without zone.js for better performance and compatibility with modern Angular patterns.

## 2. Service Testing Example (TestBed)

Services should be tested using Angular's TestBed with Vitest. Use provideHttpClientTesting for HTTP services.

```typescript
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { MyService } from "./my.service";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("MyService", () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MyService,
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should call the API", () => {
    service.someApiCall().subscribe();
    const req = httpMock.expectOne("/api/endpoint");
    expect(req.request.method).toBe("GET");
    req.flush({});
  });
});
```

## 3. Component Testing Example (TestBed)

Use Angular's TestBed with Vitest for component testing. Mock dependencies using Vitest's mocking capabilities.

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { MyComponent } from "./my.component";
import { MyService } from "./my.service";
import { By } from "@angular/platform-browser";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("MyComponent", () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let serviceMock: MyService;

  beforeEach(async () => {
    const mockService = {
      doSomething: vi.fn(),
      load: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        { provide: MyService, useValue: mockService },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    serviceMock = TestBed.inject(MyService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render input value", () => {
    component.value.set("test");
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css(".value"));
    expect(el.nativeElement.textContent).toContain("test");
  });

  it("should call service on button click", () => {
    vi.mocked(serviceMock.doSomething).mockReturnValue("done");
    const btn = fixture.debugElement.query(By.css("button"));
    btn.triggerEventHandler("click", null);
    fixture.detectChanges();
    expect(serviceMock.doSomething).toHaveBeenCalled();
  });

  it("should handle async service", async () => {
    vi.mocked(serviceMock.load).mockResolvedValue(["a"]);
    await component.load();
    fixture.detectChanges();
    expect(component.items()).toEqual(["a"]);
  });
});
```

## 4. Component Testing with Angular Testing Library

Angular Testing Library provides a more user-centric approach to testing components.

```typescript
import { render, screen, fireEvent } from "@testing-library/angular";
import { provideZonelessChangeDetection } from "@angular/core";
import { MyComponent } from "./my.component";
import { MyService } from "./my.service";
import { describe, it, expect, vi } from "vitest";

describe("MyComponent", () => {
  it("should render counter", async () => {
    await render(MyComponent, {
      inputs: {
        counter: 5,
        greeting: "Hello World!",
      },
      providers: [provideZonelessChangeDetection()],
    });

    expect(screen.getByText("Current Count: 5")).toBeVisible();
    expect(screen.getByText("Hello World!")).toBeVisible();
  });

  it("should increment the counter on click", async () => {
    await render(MyComponent, {
      inputs: { counter: 5 },
      providers: [provideZonelessChangeDetection()],
    });

    const incrementButton = screen.getByRole("button", { name: "+" });
    fireEvent.click(incrementButton);

    expect(screen.getByText("Current Count: 6")).toBeVisible();
  });

  it("should call service method", async () => {
    const mockService = {
      doSomething: vi.fn().mockReturnValue("done"),
    };

    await render(MyComponent, {
      providers: [
        { provide: MyService, useValue: mockService },
        provideZonelessChangeDetection(),
      ],
    });

    const button = screen.getByRole("button", { name: "Do Something" });
    fireEvent.click(button);

    expect(mockService.doSomething).toHaveBeenCalled();
  });
});
```

## 5. Directive Testing Example

```typescript
import { TestBed, ComponentFixture } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { Component } from "@angular/core";
import { MyDirective } from "./my.directive";
import { describe, it, expect, beforeEach } from "vitest";

@Component({
  template: `
    <div [myDirective]="value">Test</div>
  `,
})
class TestHostComponent {
  value = "test";
}

describe("MyDirective", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDirective],
      declarations: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  it("should apply directive", () => {
    fixture.detectChanges();
    const directive = fixture.debugElement.query(
      (el) => el.injector.get(MyDirective, null) !== null
    );
    expect(directive).toBeTruthy();
  });
});
```

## 6. Pipe Testing Example

```typescript
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { MyPipe } from "./my.pipe";
import { describe, it, expect, beforeEach } from "vitest";

describe("MyPipe", () => {
  let pipe: MyPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyPipe, provideZonelessChangeDetection()],
    });
    pipe = TestBed.inject(MyPipe);
  });

  it("should transform value", () => {
    expect(pipe.transform("abc")).toBe("expected");
  });
});
```

## 7. Mocking and Spying Patterns

### Service Mocking
```typescript
import { vi } from "vitest";

// Mock entire service
const mockService = {
  method1: vi.fn(),
  method2: vi.fn(),
};

// Use in TestBed
await TestBed.configureTestingModule({
  providers: [
    { provide: MyService, useValue: mockService },
    provideZonelessChangeDetection(),
  ],
}).compileComponents();
```

### Spy on Service Methods
```typescript
import { vi } from "vitest";

// Spy on existing service method
const service = TestBed.inject(MyService);
const spy = vi.spyOn(service, "method").mockReturnValue("mocked");

// Use the spy
expect(spy).toHaveBeenCalledWith("expectedArg");
```

### Mock External Modules
```typescript
import { vi } from "vitest";

// Mock external module
vi.mock("external-library", () => ({
  someFunction: vi.fn(() => "mocked result"),
}));
```

## 8. Async Testing Patterns

### Promises
```typescript
import { vi } from "vitest";

it("should handle async operations", async () => {
  const mockService = {
    asyncMethod: vi.fn().mockResolvedValue("result"),
  };

  // Test async operation
  const result = await mockService.asyncMethod();
  expect(result).toBe("result");
});
```

### Observables
```typescript
import { of } from "rxjs";

it("should handle observables", () => {
  const mockService = {
    getData: vi.fn().mockReturnValue(of("data")),
  };

  mockService.getData().subscribe((data) => {
    expect(data).toBe("data");
  });
});
```

## 9. Time-based Testing

```typescript
import { vi } from "vitest";

it("should handle timers", () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## 10. Testing Standalone Components

```typescript
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { MyStandaloneComponent } from "./my-standalone.component";
import { describe, it, expect, beforeEach } from "vitest";

describe("MyStandaloneComponent", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyStandaloneComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it("should render", () => {
    const fixture = TestBed.createComponent(MyStandaloneComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

## 11. Utility Patterns

- Use TestHelper classes for common DOM queries and actions.
- Use DebugElement and By for querying and interacting with the DOM.
- Use Vitest's async utilities for handling asynchronous code.
- Use Angular Testing Library for user-centric testing approaches.
- Use Vitest's `vi.mock` for comprehensive mocking needs.

## 12. Configuration

Ensure your `vitest.config.ts` is properly configured for Angular:

```typescript
import { defineConfig } from "vitest/config";
import angular from "@analogjs/vite-plugin-angular";

export default defineConfig({
  plugins: [angular()],
  test: {
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    globals: true,
    include: ["**/*.spec.ts"],
  },
});
```

---

**Follow these patterns for all Angular tests. Use Vitest, Angular TestBed, and Angular Testing Library when appropriate. Prefer strong typing, standalone components, and feature-based structure. For more, see the official Angular testing guides and Vitest documentation.**
