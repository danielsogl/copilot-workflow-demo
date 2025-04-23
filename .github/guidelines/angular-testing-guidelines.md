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
- Prefer standalone components, strong typing, and feature-based file structure.
- Use ng-mocks for mocking Angular dependencies (services, components, directives, pipes).
- Use Angular's input() and model() for signal-based inputs in tests.
- Use DebugElement and By for DOM queries.
- Use spyOn and jasmine.createSpy for spies and mocks.
- Use fakeAsync, tick, waitForAsync, and done for async code.
- Use clear, descriptive test names and group related tests with describe.

## 2. Service Testing Example

```typescript
import { TestBed } from "@angular/core/testing";
import { MockService, MockInstance } from "ng-mocks";
import { MyService } from "./my.service";
import { DepService } from "./dep.service";

describe("MyService", () => {
  let service: MyService;
  let depMock: DepService;

  beforeEach(() => {
    depMock = MockService(DepService);
    TestBed.configureTestingModule({
      providers: [MyService, { provide: DepService, useValue: depMock }],
    });
    service = TestBed.inject(MyService);
  });

  afterEach(() => MockInstance(DepService, undefined));

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should call dependency and return data", (done) => {
    spyOn(depMock, "getData").and.returnValue(Promise.resolve("data"));
    service.fetch().then((result) => {
      expect(result).toBe("data");
      expect(depMock.getData).toHaveBeenCalled();
      done();
    });
  });
});
```

## 3. Component Testing Example

```typescript
import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick,
} from "@angular/core/testing";
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
    component = fixture.point.componentInstance;
    serviceMock = TestBed.inject(MyService);
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

---

Follow these patterns for all Angular tests. Use Jasmine, ng-mocks, and Angular’s latest APIs. Prefer strong typing, standalone components, and feature-based structure. For more, see the official Angular testing guides.
