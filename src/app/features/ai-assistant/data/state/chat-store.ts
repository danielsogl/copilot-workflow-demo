import { inject } from "@angular/core";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { ChatApi } from "../infrastructure/chat-api";
import { ChatMessage } from "../models/chat.model";

interface ChatState {
  messages: ChatMessage[];
  streamingContent: string;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  streamingContent: "",
  loading: false,
  error: null,
};

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const ChatStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store, chatApi = inject(ChatApi)) => ({
    sendMessage: rxMethod<string>(
      pipe(
        tap((text) => {
          const userMessage: ChatMessage = {
            id: generateId(),
            role: "user",
            content: text,
            timestamp: new Date(),
          };
          patchState(store, (state) => ({
            messages: [...state.messages, userMessage],
            streamingContent: "",
            loading: true,
            error: null,
          }));
        }),
        switchMap((text) =>
          chatApi.sendMessage(text).pipe(
            tapResponse({
              next: (event) => {
                if (event.type === "delta") {
                  patchState(store, (state) => ({
                    streamingContent: state.streamingContent + event.data,
                  }));
                } else if (event.type === "done") {
                  patchState(store, (state) => {
                    const assistantMessage: ChatMessage = {
                      id: generateId(),
                      role: "assistant",
                      content: state.streamingContent,
                      timestamp: new Date(),
                    };
                    return {
                      messages: [...state.messages, assistantMessage],
                      streamingContent: "",
                      loading: false,
                    };
                  });
                } else if (event.type === "error") {
                  patchState(store, {
                    loading: false,
                    streamingContent: "",
                    error: event.data || "An error occurred",
                  });
                }
              },
              error: () => {
                patchState(store, {
                  loading: false,
                  streamingContent: "",
                  error:
                    "Failed to connect to the assistant. Is the server running?",
                });
              },
            }),
          ),
        ),
      ),
    ),

    clearChat(): void {
      patchState(store, initialState);
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
