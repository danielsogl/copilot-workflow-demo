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

  const load = (notes: Note[] = mockNotes): void => {
    noteApi.getNotes.mockReturnValue(of(notes));
    store.loadNotes();
    TestBed.tick();
  };

  beforeEach(() => {
    noteApi = {
      getNotes: vi.fn(() => of(mockNotes)),
      createNote: vi.fn((data) => of(note({ id: "99", ...data }))),
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
    expect(store.count()).toBe(0);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("loads notes sorted newest first", () => {
    load();

    expect(store.sortedNotes().map((n) => n.id)).toEqual(["2", "1"]);
    expect(store.loading()).toBe(false);
  });

  it("reports a load failure", () => {
    noteApi.getNotes.mockReturnValue(throwError(() => new Error("offline")));

    store.loadNotes();
    TestBed.tick();

    expect(store.error()).toBe("Failed to load notes: offline");
    expect(store.loading()).toBe(false);
    expect(store.count()).toBe(0);
  });

  describe("addNote", () => {
    it("trims and persists a valid note", () => {
      store.addNote({ title: "  Hello  ", body: "  world " });
      TestBed.tick();

      expect(noteApi.createNote).toHaveBeenCalledWith({
        title: "Hello",
        body: "world",
      });
      expect(store.count()).toBe(1);
    });

    it("accepts an empty body", () => {
      store.addNote({ title: "Only title", body: "" });
      TestBed.tick();

      expect(store.count()).toBe(1);
    });

    it("accepts a title of exactly 80 characters", () => {
      store.addNote({ title: "a".repeat(80), body: "" });
      TestBed.tick();

      expect(store.count()).toBe(1);
    });

    it.each([
      ["empty", ""],
      ["blank", "   "],
      ["too long", "a".repeat(81)],
    ])("rejects a %s title without calling the API", (_label, title) => {
      store.addNote({ title, body: "x" });
      TestBed.tick();

      expect(noteApi.createNote).not.toHaveBeenCalled();
      expect(store.count()).toBe(0);
      expect(store.error()).toContain("Title is required");
    });

    it("reports a persistence failure", () => {
      noteApi.createNote.mockReturnValue(throwError(() => new Error("boom")));

      store.addNote({ title: "Hi", body: "" });
      TestBed.tick();

      expect(store.error()).toBe("Failed to add note: boom");
      expect(store.count()).toBe(0);
    });
  });

  describe("deleteNote", () => {
    it("removes the note", () => {
      load();

      store.deleteNote("1");
      TestBed.tick();

      expect(noteApi.deleteNote).toHaveBeenCalledWith("1");
      expect(store.sortedNotes().map((n) => n.id)).toEqual(["2"]);
    });

    it("keeps the note and reports an error on failure", () => {
      load();
      noteApi.deleteNote.mockReturnValue(throwError(() => new Error("boom")));

      store.deleteNote("1");
      TestBed.tick();

      expect(store.error()).toBe("Failed to delete note: boom");
      expect(store.count()).toBe(2);
    });
  });

  it("clears the error", () => {
    store.addNote({ title: "", body: "" });
    TestBed.tick();

    store.clearError();

    expect(store.error()).toBeNull();
  });
});
