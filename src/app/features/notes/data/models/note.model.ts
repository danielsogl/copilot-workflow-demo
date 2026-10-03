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
