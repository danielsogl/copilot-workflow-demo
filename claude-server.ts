import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";
import {
  query,
  tool,
  createSdkMcpServer,
} from "@anthropic-ai/claude-agent-sdk";

const PORT = 3001;
const JSON_SERVER_URL = "http://localhost:3000";

type TaskStatus = "todo" | "in_progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  order: number;
}

const STATUS_ALIASES: Record<string, TaskStatus> = {
  open: "todo",
  "not started": "todo",
  not_started: "todo",
  active: "in_progress",
  ongoing: "in_progress",
  done: "completed",
  finished: "completed",
};

const app = express();
app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());

const tasksServer = createSdkMcpServer({
  name: "tasks",
  version: "1.0.0",
  tools: [
    tool(
      "get_tasks",
      'Get tasks from the task board. Use whenever the user asks about tasks, todos, or work items. Status enum: "todo" = open/not started, "in_progress" = active/ongoing, "completed" = done/finished.',
      {
        status: z
          .enum(["todo", "in_progress", "completed"])
          .optional()
          .describe(
            'Filter by status. "todo" = open/not-started, "in_progress" = active, "completed" = done. Omit for all.',
          ),
        priority: z
          .enum(["low", "medium", "high"])
          .optional()
          .describe("Optional filter by task priority"),
      },
      async ({ status, priority }) => {
        const response = await fetch(`${JSON_SERVER_URL}/tasks`);
        const tasks: Task[] = await response.json();

        const normalizedStatus = status
          ? (STATUS_ALIASES[status.toLowerCase()] ?? status)
          : undefined;

        const filtered = tasks.filter((task) => {
          if (normalizedStatus && task.status !== normalizedStatus)
            return false;
          if (priority && task.priority !== priority) return false;
          return true;
        });

        return {
          content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
        };
      },
    ),
    tool(
      "create_task",
      "Create a new task on the task board.",
      {
        title: z.string().describe("Task title"),
        description: z.string().describe("Task description"),
        priority: z.enum(["low", "medium", "high"]).describe("Task priority"),
        dueDate: z.string().describe("Due date in ISO format (YYYY-MM-DD)"),
      },
      async ({ title, description, priority, dueDate }) => {
        const newTask: Omit<Task, "id"> = {
          title,
          description,
          priority,
          dueDate,
          status: "todo",
          createdAt: new Date().toISOString().split("T")[0],
          order: 0,
        };

        const response = await fetch(`${JSON_SERVER_URL}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
        const created: Task = await response.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, task: created }, null, 2),
            },
          ],
        };
      },
    ),
    tool(
      "update_task_status",
      "Update the status of an existing task.",
      {
        taskId: z.string().describe("The task ID to update"),
        status: z
          .enum(["todo", "in_progress", "completed"])
          .describe("New status for the task"),
      },
      async ({ taskId, status }) => {
        const updates: Partial<Task> = { status };
        if (status === "completed") {
          updates.completedAt = new Date().toISOString().split("T")[0];
        }

        const response = await fetch(`${JSON_SERVER_URL}/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const updated: Task = await response.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, task: updated }, null, 2),
            },
          ],
        };
      },
    ),
  ],
});

const SYSTEM_PROMPT = `You are a helpful AI assistant for a task management board (Kanban-style).
The board has three columns with these exact status values:
- "todo" → open, not started, pending tasks
- "in_progress" → active, ongoing, currently worked on
- "completed" → done, finished, closed

Tasks have: id, title, description, priority (low/medium/high), dueDate, status.

When users ask about "open", "pending", or "not started" tasks, call get_tasks with status="todo".
When users ask about "active" or "ongoing" tasks, call get_tasks with status="in_progress".
When users ask about all tasks without a status filter, call get_tasks without a status parameter.

Always call get_tasks before answering questions about tasks — never guess the count.
Be concise and friendly. Confirm actions when creating or updating tasks.
Always respond in the same language the user writes in.`;

app.post("/api/assistant/chat", async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (event: string, data: string) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = query({
      prompt: message,
      options: {
        model: "claude-sonnet-4-6",
        systemPrompt: SYSTEM_PROMPT,
        mcpServers: { tasks: tasksServer },
        allowedTools: [
          "mcp__tasks__get_tasks",
          "mcp__tasks__create_task",
          "mcp__tasks__update_task_status",
        ],
        maxTurns: 8,
      },
    });

    for await (const msg of stream) {
      if (msg.type === "assistant" && msg.message) {
        for (const block of msg.message.content) {
          if (block.type === "text" && "text" in block) {
            sendEvent("delta", block.text);
          }
        }
      }
      if (msg.type === "result") {
        sendEvent("done", "");
      }
    }

    res.end();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    sendEvent("error", errorMessage);
    res.end();
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

app.listen(PORT, () => {
  console.log(`🤖 Claude Assistant Server running on http://localhost:${PORT}`);
});
