# ngrx-signals

An Anthropic Agent Skill that helps Claude generate idiomatic, type-safe `@ngrx/signals` code for Angular applications.

## What it does

Loads when the user is working with the [`@ngrx/signals`](https://ngrx.io/guide/signals/signal-store) Signal Store API. Encodes the idioms a senior Angular developer would actually use, including:

- Explicit state typing (`withState<FooState>(...)` instead of inferred)
- Store / API service split (HTTP stays out of the store)
- Optimistic updates with `getState()`-based snapshot rollback
- Standalone updater functions (`setPending()` / `setFulfilled()`) composable in `patchState(...)`
- `withEntities` predicate-form removers and function-form `updateEntity` changes
- Typed `signalStoreFeature({ state: type<EntityState<T>>() }, ...)` so misuse is a compile error
- `rxMethod` vs. `signalMethod` selection (RxJS only when actually needed)
- `withRequestStatus` and `withSelectedEntity` custom-feature scaffolds

It does **not** trigger for:

- `@ngrx/store` (classic Redux: `createReducer` / `createEffect`)
- Plain RxJS pipeline questions
- Component-local state with plain `signal()`

## Eval results

Benchmarked on 5 substantive tasks (41 assertions total) against the same model with no skill loaded:

| Eval                                                | with_skill | baseline |         Δ |
| --------------------------------------------------- | ---------: | -------: | --------: |
| Cart store with optimistic updates + rollback       |       100% |      70% | **+30pp** |
| Refactor `BehaviorSubject` service to Signal Store  |       100% |    87.5% |   +12.5pp |
| Typed `withSelectedEntity<T>()` custom feature      |       100% |    87.5% |   +12.5pp |
| `rxMethod` typeahead with debounce + cancellation   |       100% |     100% |        ±0 |
| `TodosStore` with `@ngrx/signals/entities` updaters |       100% |      75% |     +25pp |
| **Aggregate**                                       |   **100%** |  **84%** | **+16pp** |

Cost per invocation: ~+14 seconds wall time, ~+12,000 tokens (~$0.04 at Sonnet 4.6 input pricing).

Triggering accuracy on a 20-query test set (10 should-trigger, 10 should-NOT-trigger): precision **100%**, recall **~46%**. The recall gap is a known model-side under-triggering pattern, not a description flaw. See the article for the optimizer trace.

## Install

```bash
npx skills add danielsogl/skills@ngrx-signals
```

Or copy manually:

```bash
git clone https://github.com/danielsogl/skills.git
cp -r skills/skills/ngrx-signals ~/.claude/skills/
```

## Layout

```
ngrx-signals/
├── SKILL.md                          # entry point Claude loads
├── references/                       # loaded on demand
│   ├── api-reference.md              # primitive-by-primitive API
│   ├── patterns.md                   # store/service split, scoping, rollback
│   ├── entities.md                   # withEntities + all updaters
│   ├── custom-features.md            # signalStoreFeature, typed prerequisites
│   └── testing.md                    # TestBed, mocks, signalMethod tests
└── evals/
    └── evals.json                    # 5 tasks, 41 assertions
```

## Re-running the benchmark

The eval setup uses Anthropic's [`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator). After installing it, point at this skill:

```bash
# Capability benchmark (skill vs baseline)
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name ngrx-signals

# Description trigger optimizer
python -m scripts.run_loop \
  --eval-set evals/trigger-eval.json \
  --skill-path skills/ngrx-signals \
  --model claude-sonnet-4-6 \
  --max-iterations 3
```

Re-run after every Claude model release to catch the day a capability-uplift section becomes redundant.

## Background

Full methodology, raw benchmark data, and the description-optimizer trace are documented in the companion article: [Skills Without Evals Are Just Markdown and Hope](https://dev.to/danielsogl/skills-without-evals-are-just-markdown-and-hope-3a71).

## License

MIT
