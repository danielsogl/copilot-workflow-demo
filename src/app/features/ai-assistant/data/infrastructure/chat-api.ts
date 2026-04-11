import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

const ASSISTANT_API_URL = "http://localhost:3001/api/assistant/chat";

export interface ChatStreamEvent {
  type: "delta" | "done" | "error";
  data: string;
}

@Injectable({ providedIn: "root" })
export class ChatApi {
  sendMessage(message: string): Observable<ChatStreamEvent> {
    return new Observable((subscriber) => {
      const controller = new AbortController();

      fetch(ASSISTANT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            subscriber.error(new Error(`HTTP ${response.status}`));
            return;
          }

          let eventType = "";

          const reader = response
            .body!.pipeThrough(new TextDecoderStream())
            .getReader();

          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += value;
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                subscriber.next({
                  type: eventType as ChatStreamEvent["type"],
                  data: JSON.parse(line.slice(6).trim()) as string,
                });
              }
            }
          }

          subscriber.complete();
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== "AbortError") {
            subscriber.error(error);
          }
        });

      return () => controller.abort();
    });
  }
}
