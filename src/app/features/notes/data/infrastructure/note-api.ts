import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Note, NoteFormData } from "../models/note.model";
import { API_CONFIG } from "../../../../core/api-config";

@Injectable({
  providedIn: "root",
})
export class NoteApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_CONFIG).notesUrl;

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  createNote(data: NoteFormData): Observable<Note> {
    const newNote: Omit<Note, "id"> = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    return this.http.post<Note>(this.apiUrl, newNote);
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
