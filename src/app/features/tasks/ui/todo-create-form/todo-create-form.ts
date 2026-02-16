import { Component, output, signal } from "@angular/core";
import {
  form,
  schema,
  FormField,
  required,
  minLength,
  maxLength,
  submit,
} from "@angular/forms/signals";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

interface TodoModel {
  todo: string;
}

const todoSchema = schema<TodoModel>((f) => {
  required(f.todo, { message: "Todo is required" });
  minLength(f.todo, 1, { message: "Todo must not be empty" });
  maxLength(f.todo, 200, { message: "Maximum length is 200 characters" });
});

@Component({
  selector: "app-todo-create-form",
  templateUrl: "./todo-create-form.html",
  styleUrl: "./todo-create-form.scss",
  imports: [
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class TodoCreateForm {
  readonly create = output<string>();

  readonly isExpanded = signal(false);

  readonly todoModel = signal<TodoModel>({ todo: "" });
  readonly todoForm = form(this.todoModel, todoSchema);

  expand(): void {
    this.isExpanded.set(true);
  }

  collapse(): void {
    this.isExpanded.set(false);
    this.todoModel.set({ todo: "" });
    this.todoForm.todo().reset();
  }

  onSubmit(): void {
    submit(this.todoForm, async () => {
      const value = this.todoModel().todo.trim();
      if (value) {
        this.create.emit(value);
        this.todoModel.set({ todo: "" });
        this.todoForm.todo().reset();
      }
    });
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
