import { Component, output, signal } from "@angular/core";
import {
  form,
  schema,
  Field,
  required,
  maxLength,
} from "@angular/forms/signals";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

interface TodoForm {
  todo: string;
}

const todoSchema = schema<TodoForm>((f) => {
  required(f.todo, { message: "Todo is required" });
  maxLength(f.todo, 200, { message: "Maximum length is 200 characters" });
});

@Component({
  selector: "app-todo-create-form",
  templateUrl: "./todo-create-form.html",
  styleUrl: "./todo-create-form.scss",
  imports: [
    Field,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class TodoCreateForm {
  readonly create = output<string>();

  readonly isExpanded = signal(false);

  readonly todoData = signal<TodoForm>({ todo: "" });

  readonly todoForm = form(this.todoData, todoSchema);

  expand(): void {
    this.isExpanded.set(true);
  }

  collapse(): void {
    this.isExpanded.set(false);
    this.todoData.set({ todo: "" });
  }

  onSubmit(): void {
    const value = this.todoData().todo.trim();
    if (this.todoForm().valid() && value) {
      this.create.emit(value);
      this.todoData.set({ todo: "" });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    } else if (event.key === "Escape") {
      this.collapse();
    }
  }
}
