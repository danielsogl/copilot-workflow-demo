---
name: vitest-testing
description: Project-specific testing patterns using Vitest with Angular TestBed. Activates when writing tests, discussing test setup, creating spec files, mocking dependencies, or running tests.
---

# Vitest Testing Patterns (Project-Specific)

This project uses **Vitest** as the test runner with Angular TestBed. Vitest globals are pre-configured — never import `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`.

## Run Tests

```bash
npm test              # Run all unit tests
npm test -- --watch   # Watch mode
```

## Mandatory Setup

Every test file MUST include `provideZonelessChangeDetection()`:

```typescript
import { provideZonelessChangeDetection } from '@angular/core';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
});
```

## Component Test Template

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, ComponentRef } from '@angular/core';

describe('MyComponent', () => {
  let fixture: ComponentFixture<MyComponent>;
  let component: MyComponent;
  let componentRef: ComponentRef<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        provideZonelessChangeDetection(),
        // Mock injected dependencies:
        {
          provide: SomeStore,
          useValue: {
            items: vi.fn(() => []),
            loading: vi.fn(() => false),
            loadItems: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Setting signal inputs:
  it('should render with input', () => {
    componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('h2');
    expect(el.textContent).toContain('Test Title');
  });
});
```

## Service Test Template

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('TaskApi', () => {
  let service: TaskApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskApi,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TaskApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch items', () => {
    const mockData = [{ id: '1', name: 'Test' }];
    service.getAll().subscribe(data => {
      expect(data).toEqual(mockData);
    });
    httpMock.expectOne('/api/items').flush(mockData);
  });
});
```

## Store Test Template

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('FeatureStore', () => {
  let store: InstanceType<typeof FeatureStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FeatureStore,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    store = TestBed.inject(FeatureStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialize with default state', () => {
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
```

## Key Patterns

| Pattern | Usage |
|---------|-------|
| `vi.fn()` | Create mock functions |
| `vi.spyOn(obj, 'method')` | Spy on existing methods |
| `componentRef.setInput('name', value)` | Set signal inputs in tests |
| `fixture.detectChanges()` | Trigger change detection |
| `fixture.nativeElement.querySelector()` | Query DOM elements |
| `By.css()` with `fixture.debugElement` | Query with DebugElement |
| `provideHttpClientTesting()` | Mock HTTP in tests |
| `httpMock.expectOne(url)` | Assert HTTP calls |
| `fakeAsync` / `tick` | Test async timing |

## Rules

- **No `any`** in tests — properly type all mocks
- **AAA pattern** — Arrange, Act, Assert
- **One assertion per concept** — multiple expects OK if testing same concept
- **Mock at boundaries** — mock stores in components, mock HTTP in services
- **Never import Vitest globals** — they're pre-configured
