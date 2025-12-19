import { Component, input, output } from "@angular/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Todo } from "../../../../shared/models/todo.model";

@Component({
  selector: "app-todo-item",
  templateUrl: "./todo-item.html",
  styleUrl: "./todo-item.scss",
  imports: [
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class TodoItem {
  readonly todo = input.required<Todo>();
  readonly disabled = input(false);

  readonly toggleComplete = output<Todo>();
  readonly delete = output<Todo>();

  onToggle(): void {
    if (!this.disabled()) {
      this.toggleComplete.emit(this.todo());
    }
  }

  onDelete(): void {
    if (!this.disabled()) {
      this.delete.emit(this.todo());
    }
  }
}
