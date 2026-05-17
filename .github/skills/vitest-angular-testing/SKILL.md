---
name: vitest-angular-testing
description: Vitest + Angular TestBed patterns for v21+ projects using the @angular/build:unit-test builder. Use when writing or modifying any *.spec.ts file (components, services, directives, pipes, HTTP), or when configuring TestBed providers for zoneless change detection and HTTP testing.
---

# Vitest + Angular TestBed (v21+)

Tests run via **Vitest 4** through the official `@angular/build:unit-test` builder. Run with `npm test`.

Vitest globals (`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`) are pre-configured in `tsconfig.spec.json` — **do not** import them.

## Universal setup rules

- Always include `provideZonelessChangeDetection()` in TestBed providers.
- For HTTP, add `provideHttpClientTesting()` and verify with `httpMock.verify()` in `afterEach`.
- AAA layout (Arrange / Act / Assert).
- Strong typing on mocks — `vi.fn<(arg: T) => R>()`.
- Tests live next to the file: `task-card.ts` ↔ `task-card.spec.ts`.

## Service test

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { TaskApi } from './task-api';

describe('TaskApi', () => {
  let api: TaskApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskApi, provideZonelessChangeDetection(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TaskApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists tasks', () => {
    api.list().subscribe();
    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
```

## Component test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';

import { TaskCard } from './task-card';
import { TaskApi } from '../../data/infrastructure/task-api';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;

  beforeEach(async () => {
    const apiMock = { update: vi.fn(), remove: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskCard],
      providers: [
        { provide: TaskApi, useValue: apiMock },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
  });

  it('renders the task title from a signal input', () => {
    fixture.componentRef.setInput('task', { id: '1', title: 'first', status: 'todo' });
    fixture.detectChanges();
    const title = fixture.debugElement.query(By.css('.task-title')).nativeElement.textContent;
    expect(title).toContain('first');
  });
});
```

## Directive test (host component)

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Highlight } from './highlight';

@Component({
  imports: [Highlight],
  template: `<div [appHighlight]="value">Test</div>`,
})
class TestHost {
  value = 'test';
}

describe('Highlight', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
  });

  it('attaches the directive', () => {
    fixture.detectChanges();
    const matched = fixture.debugElement.query((el) => el.injector.get(Highlight, null) !== null);
    expect(matched).toBeTruthy();
  });
});
```

## Pipe test

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DateFormat } from './date-format';

describe('DateFormat', () => {
  let pipe: DateFormat;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateFormat, provideZonelessChangeDetection()],
    });
    pipe = TestBed.inject(DateFormat);
  });

  it('formats a date', () => {
    expect(pipe.transform('2026-01-01')).toBe('Jan 1, 2026');
  });
});
```

## Mocking

```typescript
// useValue mock object
const taskApiMock = { list: vi.fn(), get: vi.fn(), update: vi.fn() };

// spyOn an injected instance
const api = TestBed.inject(TaskApi);
const spy = vi.spyOn(api, 'list').mockReturnValue(of([]));

// hoisted module mock
vi.mock('./helpers', () => ({
  format: vi.fn(() => 'mocked'),
}));
```

## Async

- Promises: `await`.
- Observables: subscribe directly, or use `tapResponse` and `firstValueFrom`.
- Timers: `vi.useFakeTimers()` + `vi.advanceTimersByTime(ms)` + `vi.useRealTimers()`.
- Angular async work inside `rxMethod` / `signalMethod`: `fakeAsync` + `tick()`; use `TestBed.tick()` to flush signal-driven `rxMethod` synchronously.

## Signal inputs and outputs

Set signal inputs through the fixture:

```typescript
fixture.componentRef.setInput('task', { id: '1', title: 'first' });
```

Listen to outputs as plain functions on the instance:

```typescript
const sub = component.save.subscribe((task) => { /* assert */ });
```

For `*-store.spec.ts`, use the `ngrx-signals` skill.
