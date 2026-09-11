import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { MockProvider } from "ng-mocks";
import { ChatApi, ChatStreamEvent } from "../infrastructure/chat-api";
import { ChatStore } from "./chat-store";

describe("ChatStore", () => {
  let store: InstanceType<typeof ChatStore>;
  let chatApi: {
    sendMessage: ReturnType<
      typeof vi.fn<(message: string) => Observable<ChatStreamEvent>>
    >;
  };

  const stream = (...events: ChatStreamEvent[]): Observable<ChatStreamEvent> =>
    of(...events);

  const delta = (data: string): ChatStreamEvent => ({ type: "delta", data });
  const done: ChatStreamEvent = { type: "done", data: "" };

  beforeEach(() => {
    chatApi = { sendMessage: vi.fn(() => stream(done)) };

    TestBed.configureTestingModule({
      providers: [
        ChatStore,
        provideZonelessChangeDetection(),
        MockProvider(ChatApi, chatApi as Partial<ChatApi>),
      ],
    });

    store = TestBed.inject(ChatStore);
  });

  it("starts with an empty conversation", () => {
    expect(store.messages()).toEqual([]);
    expect(store.streamingContent()).toBe("");
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("appends the user message before the request resolves", () => {
    chatApi.sendMessage.mockReturnValue(new Observable<ChatStreamEvent>());

    store.sendMessage("Hallo");
    TestBed.tick();

    expect(store.messages()).toHaveLength(1);
    expect(store.messages()[0]).toMatchObject({
      role: "user",
      content: "Hallo",
    });
    expect(store.loading()).toBe(true);
  });

  it("accumulates deltas into the streaming buffer", () => {
    chatApi.sendMessage.mockReturnValue(
      stream(delta("Hal"), delta("lo "), delta("Welt")),
    );

    store.sendMessage("Hi");
    TestBed.tick();

    expect(store.streamingContent()).toBe("Hallo Welt");
    expect(store.loading()).toBe(true);
  });

  it("commits the accumulated deltas as one assistant message on done", () => {
    chatApi.sendMessage.mockReturnValue(
      stream(delta("Hallo "), delta("Welt"), done),
    );

    store.sendMessage("Hi");
    TestBed.tick();

    expect(store.messages()).toHaveLength(2);
    expect(store.messages()[1]).toMatchObject({
      role: "assistant",
      content: "Hallo Welt",
    });
    expect(store.streamingContent()).toBe("");
    expect(store.loading()).toBe(false);
  });

  it("gives each message a distinct id", () => {
    chatApi.sendMessage.mockReturnValue(stream(delta("a"), done));

    store.sendMessage("one");
    TestBed.tick();

    const ids = store.messages().map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("surfaces an error event and drops the partial answer", () => {
    chatApi.sendMessage.mockReturnValue(
      stream(delta("half an ans"), { type: "error", data: "rate limited" }),
    );

    store.sendMessage("Hi");
    TestBed.tick();

    expect(store.error()).toBe("rate limited");
    expect(store.streamingContent()).toBe("");
    expect(store.loading()).toBe(false);
    expect(store.messages()).toHaveLength(1);
  });

  it("falls back to a generic message when the error event carries no text", () => {
    chatApi.sendMessage.mockReturnValue(stream({ type: "error", data: "" }));

    store.sendMessage("Hi");
    TestBed.tick();

    expect(store.error()).toBe("An error occurred");
  });

  it("reports a failed connection", () => {
    chatApi.sendMessage.mockReturnValue(
      throwError(() => new Error("ECONNREFUSED")),
    );

    store.sendMessage("Hi");
    TestBed.tick();

    expect(store.error()).toBe(
      "Failed to connect to the assistant. Is the server running?",
    );
    expect(store.loading()).toBe(false);
    expect(store.streamingContent()).toBe("");
  });

  it("clears the error without dropping the conversation", () => {
    chatApi.sendMessage.mockReturnValue(
      stream({ type: "error", data: "nope" }),
    );
    store.sendMessage("Hi");
    TestBed.tick();

    store.clearError();

    expect(store.error()).toBeNull();
    expect(store.messages()).toHaveLength(1);
  });

  it("resets everything on clearChat", () => {
    chatApi.sendMessage.mockReturnValue(stream(delta("hi"), done));
    store.sendMessage("Hi");
    TestBed.tick();

    store.clearChat();

    expect(store.messages()).toEqual([]);
    expect(store.streamingContent()).toBe("");
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
