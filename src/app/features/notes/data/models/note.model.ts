export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface NoteFormData {
  title: string;
  body: string;
}

export const NOTE_TITLE_MAX_LENGTH = 80;
