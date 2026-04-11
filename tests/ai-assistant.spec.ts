import { test, expect, Route } from "@playwright/test";

const CHAT_API = "http://localhost:3001/api/assistant/chat";

function sseResponse(chunks: string[]): string {
  return chunks
    .map((chunk) => `event: delta\ndata: ${JSON.stringify(chunk)}\n\n`)
    .concat(['event: done\ndata: ""\n\n'])
    .join("");
}

async function mockChat(route: Route, responseText: string) {
  await route.fulfill({
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
    body: sseResponse([responseText]),
  });
}

test.describe("AI Assistant", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/assistant");
    await expect(page.locator(".assistant-page")).toBeVisible();
  });

  test.describe("Page Structure", () => {
    test("should display the page header", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "AI Task Assistant" }),
      ).toBeVisible();
      await expect(page.getByText("Powered by GitHub Copilot")).toBeVisible();
    });

    test("should show empty state initially", async ({ page }) => {
      await expect(page.locator(".empty-state")).toBeVisible();
      await expect(
        page.getByText("👋 Ask me anything about your tasks!"),
      ).toBeVisible();
    });

    test("should display the message input", async ({ page }) => {
      await expect(
        page.getByRole("textbox", { name: "Ask your assistant..." }),
      ).toBeVisible();
    });

    test("should have send button disabled when input is empty", async ({
      page,
    }) => {
      await expect(
        page.getByRole("button", { name: "Send message" }),
      ).toBeDisabled();
    });

    test("should have clear history button disabled initially", async ({
      page,
    }) => {
      await expect(page.locator(".page-header button")).toBeDisabled();
    });
  });

  test.describe("Composer Behavior", () => {
    test("should enable send button when text is entered", async ({ page }) => {
      await page
        .getByRole("textbox", { name: "Ask your assistant..." })
        .fill("Hello");
      await expect(
        page.getByRole("button", { name: "Send message" }),
      ).toBeEnabled();
    });

    test("should disable send button after clearing input", async ({
      page,
    }) => {
      const input = page.getByRole("textbox", {
        name: "Ask your assistant...",
      });
      await input.fill("Hello");
      await expect(
        page.getByRole("button", { name: "Send message" }),
      ).toBeEnabled();
      await input.clear();
      await expect(
        page.getByRole("button", { name: "Send message" }),
      ).toBeDisabled();
    });

    test("should not send message on Enter when input is empty", async ({
      page,
    }) => {
      await page
        .getByRole("textbox", { name: "Ask your assistant..." })
        .press("Enter");
      await expect(page.locator(".empty-state")).toBeVisible();
    });
  });

  test.describe("Sending Messages", () => {
    test("should display user message after sending", async ({ page }) => {
      await page.route(CHAT_API, (route) =>
        mockChat(route, "Here are your tasks."),
      );

      const input = page.getByRole("textbox", {
        name: "Ask your assistant...",
      });
      await input.fill("Show me all tasks");
      await page.getByRole("button", { name: "Send message" }).click();

      await expect(
        page.locator(".messages").getByText("Show me all tasks"),
      ).toBeVisible();
    });

    test("should display assistant response after sending", async ({
      page,
    }) => {
      await page.route(CHAT_API, (route) =>
        mockChat(route, "Here are your high priority tasks."),
      );

      const input = page.getByRole("textbox", {
        name: "Ask your assistant...",
      });
      await input.fill("What are my high priority tasks?");
      await page.getByRole("button", { name: "Send message" }).click();

      await expect(
        page
          .locator(".messages")
          .getByText("Here are your high priority tasks."),
      ).toBeVisible();
    });

    test("should clear input after sending", async ({ page }) => {
      await page.route(CHAT_API, (route) => mockChat(route, "Done."));

      const input = page.getByRole("textbox", {
        name: "Ask your assistant...",
      });
      await input.fill("Show me tasks");
      await page.getByRole("button", { name: "Send message" }).click();

      await expect(input).toHaveValue("");
    });

    test("should hide empty state once a message is sent", async ({ page }) => {
      await page.route(CHAT_API, (route) => mockChat(route, "Sure!"));

      await page
        .getByRole("textbox", { name: "Ask your assistant..." })
        .fill("Hello");
      await page.getByRole("button", { name: "Send message" }).click();

      await expect(page.locator(".empty-state")).not.toBeVisible();
    });

    test("should send message via Enter key", async ({ page }) => {
      await page.route(CHAT_API, (route) => mockChat(route, "Got it."));

      const input = page.getByRole("textbox", {
        name: "Ask your assistant...",
      });
      await input.fill("Hello via keyboard");
      await input.press("Enter");

      await expect(
        page.locator(".messages").getByText("Hello via keyboard"),
      ).toBeVisible();
    });
  });

  test.describe("Clear History", () => {
    test("should enable clear button after receiving a response", async ({
      page,
    }) => {
      await page.route(CHAT_API, (route) =>
        mockChat(route, "Response received."),
      );

      await page
        .getByRole("textbox", { name: "Ask your assistant..." })
        .fill("Hello");
      await page.getByRole("button", { name: "Send message" }).click();

      await expect(
        page.locator(".messages").getByText("Response received."),
      ).toBeVisible();

      await expect(page.locator(".page-header button")).toBeEnabled();
    });

    test("should clear messages and show empty state on clear", async ({
      page,
    }) => {
      await page.route(CHAT_API, (route) => mockChat(route, "I can help!"));

      await page
        .getByRole("textbox", { name: "Ask your assistant..." })
        .fill("Hello");
      await page.getByRole("button", { name: "Send message" }).click();
      await expect(
        page.locator(".messages").getByText("I can help!"),
      ).toBeVisible();

      await page.locator(".page-header button").click();

      await expect(page.locator(".empty-state")).toBeVisible();
      await expect(page.locator("app-chat-message")).toHaveCount(0);
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to board via navbar link", async ({ page }) => {
      await page.getByRole("link", { name: "Board" }).click();
      await expect(page).toHaveURL(/\/board/);
    });

    test("should highlight AI Assistant link as active", async ({ page }) => {
      await expect(
        page.getByRole("link", { name: "AI Assistant" }),
      ).toHaveClass(/active-link/);
    });
  });
});
