import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { EMPTY, pipe, switchMap, tap } from "rxjs";
import { NoteApi } from "../infrastructure/note-api";
import {
  Note,
  NOTE_TITLE_MAX_LENGTH,
  NoteFormData,
} from "../models/note.model";

export interface NoteState {
  loading: boolean;
  error: string | null;
}

const initialState: NoteState = {
  loading: false,
  error: null,
};

const noteEntityConfig = entityConfig({
  entity: type<Note>(),
  collection: "notes",
  selectId: (note: Note) => note.id,
});

export const NoteStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities(noteEntityConfig),
  withComputed(({ notesEntities }) => ({
    // Newest first
    sortedNotes: computed(() =>
      [...notesEntities()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    ),
    count: computed(() => notesEntities().length),
  })),
  withMethods((store, noteApi = inject(NoteApi)) => ({
    loadNotes: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          noteApi.getNotes().pipe(
            tapResponse({
              next: (notes) =>
                patchState(store, setAllEntities(notes, noteEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load notes: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    addNote: rxMethod<NoteFormData>(
      pipe(
        tap(() => patchState(store, { error: null })),
        switchMap((data) => {
          const title = data.title.trim();
          if (!title || title.length > NOTE_TITLE_MAX_LENGTH) {
            patchState(store, {
              error: `Title is required (max ${NOTE_TITLE_MAX_LENGTH} characters)`,
            });
            return EMPTY;
          }
          return noteApi.createNote({ title, body: data.body.trim() }).pipe(
            tapResponse({
              next: (note) =>
                patchState(store, addEntity(note, noteEntityConfig)),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to add note: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    deleteNote: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { error: null })),
        switchMap((id) =>
          noteApi.deleteNote(id).pipe(
            tapResponse({
              next: () => patchState(store, removeEntity(id, noteEntityConfig)),
              error: (error: Error) =>
                patchState(store, {
                  error: `Failed to delete note: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
