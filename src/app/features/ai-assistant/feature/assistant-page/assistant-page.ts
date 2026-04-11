import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  untracked,
} from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { ChatStore } from "../../data/state/chat-store";
import { ChatPanel } from "../../ui/chat-panel/chat-panel";

@Component({
  selector: "app-assistant-page",
  templateUrl: "./assistant-page.html",
  styleUrl: "./assistant-page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatPanel, MatIconButton, MatIcon, MatTooltip],
})
export class AssistantPage {
  protected readonly store = inject(ChatStore);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    effect(() => {
      const error = this.store.error();
      if (!error) return;
      this.snackBar.open(error, "Dismiss", { duration: 5000 });
      untracked(() => this.store.clearError());
    });
  }

  protected onSend(message: string): void {
    this.store.sendMessage(message);
  }

  protected onClear(): void {
    this.store.clearChat();
  }
}
