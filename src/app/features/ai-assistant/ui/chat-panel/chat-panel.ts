import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from "@angular/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ChatMessage as ChatMessageModel } from "../../data/models/chat.model";
import { ChatMessage } from "../chat-message/chat-message";
import { ChatInput } from "../chat-input/chat-input";

@Component({
  selector: "app-chat-panel",
  templateUrl: "./chat-panel.html",
  styleUrl: "./chat-panel.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatMessage, ChatInput, MatProgressSpinner],
})
export class ChatPanel implements AfterViewChecked {
  readonly messages = input.required<ChatMessageModel[]>();
  readonly streamingContent = input("");
  readonly loading = input(false);
  readonly send = output<string>();

  private readonly messagesContainer =
    viewChild<ElementRef>("messagesContainer");

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer()?.nativeElement as
      | HTMLElement
      | undefined;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
