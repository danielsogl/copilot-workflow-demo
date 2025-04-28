# Angular Testing Guidelines (Jasmine + ng-mocks)

These guidelines reflect Angular v19+ best practices, ng-mocks usage, and the official Angular testing guides:

- [Testing services](https://angular.dev/guide/testing/services)
- [Basics of testing components](https://angular.dev/guide/testing/components-basics)
- [Component testing scenarios](https://angular.dev/guide/testing/components-scenarios)
- [Testing attribute directives](https://angular.dev/guide/testing/attribute-directives)
- [Testing pipes](https://angular.dev/guide/testing/pipes)
- [Testing utility APIs](https://angular.dev/guide/testing/utility-apis)
- [NgMocks Testing Components](https://ng-mocks.sudo.eu/api/MockComponent)
- [NgMocks Testing Directives](https://ng-mocks.sudo.eu/api/MockDirective)
- [NgMocks Testing Pipes](https://ng-mocks.sudo.eu/api/MockPipe)
- [NgMocks Testing Services](https://ng-mocks.sudo.eu/api/MockService)
- [NgMocks Mocking Providers](https://ng-mocks.sudo.eu/api/MockProvider)

## 1. General Patterns

- Use Jasmine for all test specs (`.spec.ts`), following the AAA pattern (Arrange, Act, Assert).
- Use Angular's TestBed and ComponentFixture for setup and DOM interaction.
- **Services should be tested using TestBed, not ng-mocks.**
- Prefer standalone components, strong typing, and feature-based file structure.
- Use ng-mocks for mocking Angular dependencies (components, directives, pipes) in component/directive/pipe tests.
- Use Angular's input() and model() for signal-based inputs in tests.
- Use DebugElement and By for DOM queries.
- Use spyOn and jasmine.createSpy for spies and mocks.
- Use fakeAsync, tick, waitForAsync, and done for async code.
- Use clear, descriptive test names and group related tests with describe.
- **Use the latest ng-mocks APIs:**
  - Use `MockBuilder` for test bed setup (standalone components: `await MockBuilder(MyComponent)`)
  - Use `MockRender` to create the fixture (`fixture = MockRender(MyComponent)`)
  - Use `ngMocks.findInstance` to get the component instance with strong typing
  - Use `MockInstance.scope()` for test isolation if mocking services or component methods
  - Use `ngMocks.autoSpy('jasmine')` in your test setup to auto-spy all mocks (optional)

## 2. Service Testing Example (TestBed)

Services should be tested using Angular's TestBed, not ng-mocks. Use provideHttpClientTesting for HTTP services.

```typescript
import { TestBed } from "@angular/core/testing";
import { MyService } from "./my.service";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";

describe("MyService", () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService, provideHttpClientTesting()],
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

## 3. Component Testing Example (ng-mocks)

```typescript
import { ComponentFixture } from "@angular/core/testing";
import { MockBuilder, MockRender, ngMocks, MockInstance } from "ng-mocks";
import { MyComponent } from "./my.component";
import { MyService } from "./my.service";
import { By } from "@angular/platform-browser";

describe("MyComponent", () => {
  let fixture: ComponentFixture<MyComponent>;
  let component: MyComponent;
  let serviceMock: MyService;

  beforeEach(async () => {
    await MockBuilder(MyComponent).mock(MyService);
    fixture = MockRender(MyComponent);
    component = ngMocks.findInstance(MyComponent);
    serviceMock = ngMocks.findInstance(MyService);
  });

  afterEach(() => MockInstance(MyService, undefined));

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
    spyOn(serviceMock, "doSomething").and.returnValue("done");
    const btn = fixture.debugElement.query(By.css("button"));
    btn.triggerEventHandler("click");
    fixture.detectChanges();
    expect(serviceMock.doSomething).toHaveBeenCalled();
  });

  it("should handle async service", fakeAsync(() => {
    spyOn(serviceMock, "load").and.returnValue(Promise.resolve(["a"]));
    component.load();
    tick();
    fixture.detectChanges();
    expect(component.items()).toEqual(["a"]);
  }));
});
```

## 4. Directive Testing Example

```typescript
import { TestBed, ComponentFixture } from "@angular/core/testing";
import { MockBuilder, MockRender, ngMocks } from "ng-mocks";
import { Component } from "@angular/core";
import { MyDirective } from "./my.directive";

@Component({
  template: `
    <div [myDirective]="value">Test</div>
  `,
})
class TestHost {
  value = "test";
}

describe("MyDirective", () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await MockBuilder(TestHost).mock(MyDirective);
    fixture = MockRender(TestHost);
    host = fixture.point.componentInstance;
  });

  it("should apply directive", () => {
    fixture.detectChanges();
    const dir = ngMocks.findInstance(MyDirective);
    expect(dir).toBeTruthy();
  });
});
```

## 5. Pipe Testing Example

```typescript
import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { MyPipe } from "./my.pipe";

describe("MyPipe", () => {
  let pipe: MyPipe;
  beforeEach(async () => {
    await MockBuilder(MyPipe);
    pipe = TestBed.inject(MyPipe);
  });
  it("should transform value", () => {
    expect(pipe.transform("abc")).toBe("expected");
  });
});
```

## 6. Utility Patterns

- Use TestHelper classes for common DOM queries and actions.
- Use DebugElement and By for querying and interacting with the DOM.
- Use Angular’s async helpers (fakeAsync, tick, waitForAsync) for async code.
- Use ng-mocks for all dependency mocking.

## 7. Testing Standalone Components, Directives, Pipes, and Providers with ng-mocks

Standalone components, directives, pipes, and providers in Angular (v14+) can be tested and their dependencies mocked using ng-mocks. By default, MockBuilder will keep the class under test and mock all its dependencies. **You do not need to explicitly call `.keep()` for the class under test.**

> **Note:** Only use `.keep()` if you want to keep a dependency (e.g., a child component or pipe), not the class under test itself.

### Mocking All Imports (Shallow Test)

```typescript
import { MockBuilder, MockRender, ngMocks } from "ng-mocks";
import { MyStandaloneComponent } from "./my-standalone.component";

describe("MyStandaloneComponent", () => {
  beforeEach(async () => {
    await MockBuilder(MyStandaloneComponent); // mocks all imports by default, keeps the component under test
  });

  it("should render", () => {
    const fixture = MockRender(MyStandaloneComponent);
    const component = ngMocks.findInstance(MyStandaloneComponent);
    expect(component).toBeTruthy();
  });
});
```

### Keeping Specific Imports (Deep Test)

If you want to keep a specific import (e.g., a pipe or dependency component), use `.keep()`:

```typescript
beforeEach(async () => {
  await MockBuilder(MyStandaloneComponent).keep(MyDependencyComponent);
});
```

### Reference

- See the [ng-mocks guide for standalone components](https://ng-mocks.sudo.eu/guides/component-standalone/) for more details and advanced usage.

---

**Follow these patterns for all Angular tests. Use Jasmine, ng-mocks, and Angular’s latest APIs. Prefer strong typing, standalone components, and feature-based structure. For more, see the official Angular testing guides.**
