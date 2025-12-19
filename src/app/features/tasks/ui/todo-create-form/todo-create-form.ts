import { Component, output, signal, inject } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-todo-create-form",
  templateUrl: "./todo-create-form.html",
  styleUrl: "./todo-create-form.scss",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class TodoCreateForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly create = output<string>();

  readonly isExpanded = signal(false);

  readonly todoControl: FormControl<string> = this.formBuilder.control("", {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(200),
    ],
  });

  expand(): void {
    this.isExpanded.set(true);
  }

  collapse(): void {
    this.isExpanded.set(false);
    this.todoControl.reset();
  }

  onSubmit(): void {
    if (this.todoControl.valid && this.todoControl.value.trim()) {
      this.create.emit(this.todoControl.value.trim());
      this.todoControl.reset();
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
