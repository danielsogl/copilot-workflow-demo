import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { NoteApi } from "./note-api";
import { Note } from "../models/note.model";

describe("NoteApi", () => {
  let api: NoteApi;
  let httpTesting: HttpTestingController;

  const note: Note = {
    id: "1",
    title: "Title",
    body: "Body",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClientTesting()],
    });
    api = TestBed.inject(NoteApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it("fetches all notes", () => {
    let result: Note[] = [];
    api.getNotes().subscribe((notes) => (result = notes));

    const req = httpTesting.expectOne("http://localhost:3000/notes");
    expect(req.request.method).toBe("GET");
    req.flush([note]);

    expect(result).toEqual([note]);
  });

  it("creates a note with a createdAt timestamp", () => {
    let result: Note | undefined;
    api.createNote({ title: "Title", body: "Body" }).subscribe((n) => {
      result = n;
    });

    const req = httpTesting.expectOne("http://localhost:3000/notes");
    expect(req.request.method).toBe("POST");
    expect(req.request.body.title).toBe("Title");
    expect(req.request.body.body).toBe("Body");
    expect(typeof req.request.body.createdAt).toBe("string");
    req.flush(note);

    expect(result).toEqual(note);
  });

  it("deletes a note", () => {
    api.deleteNote("1").subscribe();

    const req = httpTesting.expectOne("http://localhost:3000/notes/1");
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
  });
});
