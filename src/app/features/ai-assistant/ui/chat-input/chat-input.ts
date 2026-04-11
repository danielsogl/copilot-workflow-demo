import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: "app-chat-input",
  templateUrl: "./chat-input.html",
  styleUrl: "./chat-input.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
  ],
})
export class ChatInput {
  readonly disabled = input(false);
  readonly send = output<string>();

  protected readonly text = signal("");

  protected onSubmit(): void {
    const value = this.text().trim();
    if (!value || this.disabled()) return;
    this.send.emit(value);
    this.text.set("");
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
