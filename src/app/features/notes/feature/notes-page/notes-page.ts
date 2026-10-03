import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import {
  FormField,
  form,
  maxLength,
  required,
  schema,
} from "@angular/forms/signals";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { NoteStore } from "../../data/state/note-store";

interface NoteFormModel {
  title: string;
  body: string;
}

const noteFormSchema = schema<NoteFormModel>((f) => {
  required(f.title, { message: "Title is required" });
  maxLength(f.title, 80, { message: "Title cannot exceed 80 characters" });
});

@Component({
  selector: "app-notes-page",
  templateUrl: "./notes-page.html",
  styleUrl: "./notes-page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    DatePipe,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatError,
    MatIcon,
    MatInput,
  ],
})
export class NotesPage {
  protected readonly store = inject(NoteStore);

  protected readonly model = signal<NoteFormModel>({ title: "", body: "" });
  protected readonly noteForm = form(this.model, noteFormSchema);
  protected readonly canSubmit = computed(
    () => this.model().title.trim().length > 0 && this.noteForm().valid(),
  );

  constructor() {
    this.store.loadNotes();
  }

  protected add(): void {
    if (!this.canSubmit()) return;

    const value = this.model();
    this.store.addNote({
      title: value.title.trim(),
      body: value.body.trim(),
    });
    this.model.set({ title: "", body: "" });
  }

  protected remove(id: string): void {
    this.store.deleteNote(id);
  }
}
