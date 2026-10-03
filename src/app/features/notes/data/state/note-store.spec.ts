import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { MockProvider } from "ng-mocks";
import { NoteApi } from "../infrastructure/note-api";
import { Note, NoteFormData } from "../models/note.model";
import { NoteStore } from "./note-store";

describe("NoteStore", () => {
  let store: InstanceType<typeof NoteStore>;
  let noteApi: {
    getNotes: ReturnType<typeof vi.fn<() => Observable<Note[]>>>;
    createNote: ReturnType<
      typeof vi.fn<(data: NoteFormData) => Observable<Note>>
    >;
    deleteNote: ReturnType<typeof vi.fn<(id: string) => Observable<void>>>;
  };

  const note = (overrides: Partial<Note> & Pick<Note, "id">): Note => ({
    title: "Note",
    body: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  });

  const mockNotes: Note[] = [
    note({ id: "1", title: "Old", createdAt: "2026-01-01T00:00:00.000Z" }),
    note({ id: "2", title: "New", createdAt: "2026-02-01T00:00:00.000Z" }),
  ];

  const load = (): void => {
    store.loadNotes();
    TestBed.tick();
  };

  beforeEach(() => {
    noteApi = {
      getNotes: vi.fn(() => of(mockNotes)),
      createNote: vi.fn((data) =>
        of(note({ id: "99", ...data, createdAt: "2026-03-01T00:00:00.000Z" })),
      ),
      deleteNote: vi.fn(() => of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        NoteStore,
        provideZonelessChangeDetection(),
        MockProvider(NoteApi, noteApi as Partial<NoteApi>),
      ],
    });

    store = TestBed.inject(NoteStore);
  });

  it("starts empty and idle", () => {
    expect(store.noteCount()).toBe(0);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("loads notes", () => {
    load();

    expect(store.noteCount()).toBe(2);
    expect(store.loading()).toBe(false);
  });

  it("sorts notes newest first", () => {
    load();

    expect(store.sortedNotes().map((n) => n.id)).toEqual(["2", "1"]);
  });

  it("reports a load failure", () => {
    noteApi.getNotes.mockReturnValue(throwError(() => new Error("offline")));

    load();

    expect(store.error()).toBe("Failed to load notes: offline");
    expect(store.loading()).toBe(false);
    expect(store.noteCount()).toBe(0);
  });

  it("adds a note", () => {
    load();

    store.addNote({ title: "Fresh", body: "text" });
    TestBed.tick();

    expect(noteApi.createNote).toHaveBeenCalledWith({
      title: "Fresh",
      body: "text",
    });
    expect(store.noteCount()).toBe(3);
    expect(store.sortedNotes()[0].id).toBe("99");
  });

  it("reports an add failure and keeps the collection", () => {
    load();
    noteApi.createNote.mockReturnValue(throwError(() => new Error("boom")));

    store.addNote({ title: "Fresh", body: "" });
    TestBed.tick();

    expect(store.error()).toBe("Failed to add note: boom");
    expect(store.noteCount()).toBe(2);
  });

  it("deletes a note", () => {
    load();

    store.deleteNote("1");
    TestBed.tick();

    expect(noteApi.deleteNote).toHaveBeenCalledWith("1");
    expect(store.sortedNotes().map((n) => n.id)).toEqual(["2"]);
  });

  it("reports a delete failure and keeps the collection", () => {
    load();
    noteApi.deleteNote.mockReturnValue(throwError(() => new Error("nope")));

    store.deleteNote("1");
    TestBed.tick();

    expect(store.error()).toBe("Failed to delete note: nope");
    expect(store.noteCount()).toBe(2);
  });

  it("clears the error", () => {
    noteApi.getNotes.mockReturnValue(throwError(() => new Error("offline")));
    load();

    store.clearError();

    expect(store.error()).toBeNull();
  });
});
