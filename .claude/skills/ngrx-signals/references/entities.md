# @ngrx/signals — Entity Management

Use `@ngrx/signals/entities` whenever the data is a collection of items with a stable `id`. It gives you normalized storage (`entityMap` + `ids`) and a complete set of immutable updaters.

## Setup

```typescript
import { signalStore } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';

type Todo = { id: number; text: string; completed: boolean };

export const TodosStore = signalStore(withEntities<Todo>());
```

Default contract: each entity needs an `id: string | number` (a `EntityId`). For domain types whose identifier has another name, use the `idKey` config.

What you get on the store:

| Signal       | Type                         | Notes                                  |
| ------------ | ---------------------------- | -------------------------------------- |
| `ids`        | `Signal<EntityId[]>`         | Insertion order is preserved.          |
| `entityMap`  | `Signal<EntityMap<Todo>>`    | Keyed map.                             |
| `entities`   | `Signal<Todo[]>`             | Computed, derived from `ids` + `map`.  |

`ids` and `entityMap` are state slices (mutable via `patchState`). `entities` is a computed.

## Standalone updaters

Always combine with `patchState`. All updaters are immutable.

### Add

```typescript
patchState(store, addEntity(todo));
patchState(store, addEntities([todo1, todo2]));
patchState(store, prependEntity(todo));     // pushes to start
patchState(store, prependEntities([t1, t2]));
```

`addEntity` is a no-op if the ID already exists (no error, no override).

### Set / replace

```typescript
patchState(store, setEntity(todo));            // add or replace one
patchState(store, setEntities([t1, t2]));      // add or replace many
patchState(store, setAllEntities(newList));    // replace the whole collection
```

Use `setAllEntities` after a fresh server fetch.

### Update

```typescript
patchState(store, updateEntity({ id: 1, changes: { completed: true } }));

patchState(store, updateEntity({
  id: 1,
  changes: (todo) => ({ completed: !todo.completed }),
}));

patchState(store, updateEntities({
  ids: [1, 2],
  changes: { completed: true },
}));

patchState(store, updateEntities({
  predicate: ({ text }) => text.endsWith('✅'),
  changes: { text: '' },
}));

patchState(store, updateAllEntities({ archived: true }));
```

`updateEntity` / `updateEntities` are no-ops for missing IDs — no error.

### Upsert

Merges with existing or inserts. Properties not present in the patch are preserved.

```typescript
patchState(store, upsertEntity(todo));
patchState(store, upsertEntities([t1, t2]));
```

### Remove

```typescript
patchState(store, removeEntity(1));
patchState(store, removeEntities([1, 2]));
patchState(store, removeEntities((todo) => todo.completed));
patchState(store, removeAllEntities());
```

## Custom `id` key

If your entity uses something other than `id`:

```typescript
type User = { uuid: string; name: string };

const idKey = (u: User) => u.uuid;

export const UsersStore = signalStore(
  withEntities({ entity: type<User>(), idKey })
);

// Updaters require the same idKey when adding:
patchState(store, addEntity(user, { idKey }));
```

Stick the `idKey` in a constant in the same file so calls stay terse.

## Named collections (multiple entities in one store)

When one store holds two or more entity types, name each collection. The collection name shows up in the signal names and is required on every updater call.

```typescript
import { type, signalStore, patchState, withMethods } from '@ngrx/signals';
import { addEntity, removeEntity, withEntities } from '@ngrx/signals/entities';

type Book = { id: string; title: string };
type Author = { id: string; name: string };

export const LibraryStore = signalStore(
  withEntities({ entity: type<Book>(), collection: 'book' }),
  withEntities({ entity: type<Author>(), collection: 'author' }),
  withMethods((store) => ({
    addBook(book: Book): void {
      patchState(store, addEntity(book, { collection: 'book' }));
    },
    addAuthor(author: Author): void {
      patchState(store, addEntity(author, { collection: 'author' }));
    },
    removeBook(id: string): void {
      patchState(store, removeEntity(id, { collection: 'book' }));
    },
  }))
);

// Signals:
//   store.bookIds(), store.bookEntityMap(), store.bookEntities()
//   store.authorIds(), store.authorEntityMap(), store.authorEntities()
```

Always pass the `collection` option on every updater — forgetting it operates on the unnamed default and silently does nothing (or compiles wrong).

## Loading a list from a service

Combine entities + request status (see `custom-features.md`):

```typescript
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { setFulfilled, setPending, withRequestStatus } from './with-request-status';

export const BooksStore = signalStore(
  withEntities<Book>(),
  withRequestStatus(),
  withMethods((store, booksService = inject(BooksService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, setPending());
      const books = await booksService.getAll();
      patchState(store, setAllEntities(books), setFulfilled());
    },
  }))
);
```

Two updaters in one `patchState` call is the idiomatic shape for "set data + flip status."
