import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  type,
} from "@ngrx/signals";
import {
  withEntities,
  entityConfig,
  setAllEntities,
  addEntity,
  updateEntity,
  removeEntity,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { computed, inject } from "@angular/core";
import { pipe, switchMap, tap } from "rxjs";
import { PersonApi } from "./person";
import { Person } from "../../../shared/models/person.model";

export interface PersonState {
  selectedPersonId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PersonState = {
  selectedPersonId: null,
  loading: false,
  error: null,
};

const personEntityConfig = entityConfig({
  entity: type<Person>(),
  collection: "persons",
  selectId: (person: Person) => person.id,
});

export const PersonStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities(personEntityConfig),
  withComputed(({ personsEntities, personsEntityMap, selectedPersonId }) => ({
    // Selected person
    selectedPerson: computed(() => {
      const id = selectedPersonId();
      return id ? personsEntityMap()[id] : undefined;
    }),

    // Total count
    totalPersonCount: computed(() => personsEntities().length),
  })),
  withMethods((store, personService = inject(PersonApi)) => ({
    // Load all persons
    loadPersons: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          personService.getPersons().pipe(
            tapResponse({
              next: (persons) =>
                patchState(store, setAllEntities(persons, personEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load persons: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Load single person by ID
    loadPersonById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          personService.getPersonById(id).pipe(
            tapResponse({
              next: (person) => {
                if (person) {
                  patchState(store, addEntity(person, personEntityConfig), {
                    loading: false,
                    selectedPersonId: person.id,
                  });
                } else {
                  patchState(store, {
                    loading: false,
                    error: "Person not found",
                  });
                }
              },
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load person: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Create person
    createPerson: rxMethod<Omit<Person, "id" | "createdAt" | "updatedAt">>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((personData) =>
          personService.createPerson(personData).pipe(
            tapResponse({
              next: (person) =>
                patchState(store, addEntity(person, personEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to create person: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Update person
    updatePerson: rxMethod<{ id: string; updates: Partial<Person> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          personService.updatePerson(id, updates).pipe(
            tapResponse({
              next: (person) =>
                patchState(
                  store,
                  updateEntity({ id, changes: person }, personEntityConfig),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to update person: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Delete person
    deletePerson: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          personService.deletePerson(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, removeEntity(id, personEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to delete person: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    // Select person
    selectPerson(personId: string | null): void {
      patchState(store, { selectedPersonId: personId });
    },

    // Clear error
    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
