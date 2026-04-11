import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { ChatMessage as ChatMessageModel } from "../../data/models/chat.model";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.html",
  styleUrl: "./chat-message.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, DatePipe],
})
export class ChatMessage {
  readonly message = input.required<ChatMessageModel>();
}
