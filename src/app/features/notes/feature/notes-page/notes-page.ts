import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { MatButton, MatIconButton } from "@angular/material/button";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
} from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { NoteStore } from "../../data/state/note-store";
import { NOTE_TITLE_MAX_LENGTH } from "../../data/models/note.model";

@Component({
  selector: "app-notes-page",
  templateUrl: "./notes-page.html",
  styleUrl: "./notes-page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatIcon,
    MatInput,
  ],
})
export class NotesPage {
  protected readonly store = inject(NoteStore);
  protected readonly titleMaxLength = NOTE_TITLE_MAX_LENGTH;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: [
      "",
      [Validators.required, Validators.maxLength(NOTE_TITLE_MAX_LENGTH)],
    ],
    body: [""],
  });

  constructor() {
    this.store.loadNotes();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.addNote(this.form.getRawValue());
    this.form.reset();
  }

  protected remove(id: string): void {
    this.store.deleteNote(id);
  }
}
