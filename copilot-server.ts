import express, { Request, Response } from "express";
import cors from "cors";
import { CopilotClient, approveAll, defineTool } from "@github/copilot-sdk";
import { z } from "zod";

const PORT = 3001;
const JSON_SERVER_URL = "http://localhost:3000";

const taskStatusSchema = z.enum(["todo", "in_progress", "completed"]);
const taskPrioritySchema = z.enum(["low", "medium", "high"]);

type TaskStatus = z.infer<typeof taskStatusSchema>;
type TaskPriority = z.infer<typeof taskPrioritySchema>;

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

const getTasks = defineTool("get_tasks", {
  description:
    "Get tasks from the task board. Use this tool whenever the user asks about tasks, todos, or work items. " +
    'Status values: "todo" = open/not started, "in_progress" = active/ongoing, "completed" = done/finished. ' +
    'IMPORTANT: "open" and "not started" map to status "todo". Always use the exact enum values.',
  parameters: z.object({
    status: taskStatusSchema
      .describe(
        'Filter by status. Use "todo" for open/not-started tasks, "in_progress" for active tasks, "completed" for done tasks. Omit to get all tasks.',
      )
      .optional(),
    priority: taskPrioritySchema
      .describe("Optional filter by task priority")
      .optional(),
  }),
  skipPermission: true,
  handler: async ({ status, priority }) => {
    const response = await fetch(`${JSON_SERVER_URL}/tasks`);
    const tasks: Task[] = await response.json();

    const normalizedStatus = status
      ? (STATUS_ALIASES[status.toLowerCase()] ?? status)
      : undefined;

    return tasks.filter((task) => {
      if (normalizedStatus && task.status !== normalizedStatus) return false;
      if (priority && task.priority !== priority) return false;
      return true;
    });
  },
});

const createTask = defineTool("create_task", {
  description: "Create a new task on the task board.",
  parameters: z.object({
    title: z.string().describe("Task title"),
    description: z.string().describe("Task description"),
    priority: taskPrioritySchema.describe("Task priority"),
    dueDate: z.string().describe("Due date in ISO format (YYYY-MM-DD)"),
  }),
  handler: async ({ title, description, priority, dueDate }) => {
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
    return { success: true, task: created };
  },
});

const updateTaskStatus = defineTool("update_task_status", {
  description: "Update the status of an existing task.",
  parameters: z.object({
    taskId: z.string().describe("The task ID to update"),
    status: taskStatusSchema.describe("New status for the task"),
  }),
  handler: async ({ taskId, status }) => {
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
    return { success: true, task: updated };
  },
});

const SYSTEM_MESSAGE = `You are a helpful AI assistant for a task management board (Kanban-style).
The board has three columns with these exact status values:
- "todo" → open, not started, pending tasks
- "in_progress" → active, ongoing, currently worked on
- "completed" → done, finished, closed

Tasks have: id, title, description, priority (low/medium/high), dueDate, status.

When users ask about "open", "pending", or "not started" tasks, use get_tasks with status="todo".
When users ask about "active" or "ongoing" tasks, use get_tasks with status="in_progress".
When users ask about all tasks without a status filter, call get_tasks without a status parameter.

Always call get_tasks before answering questions about tasks — never guess the count.
Be concise and friendly. Confirm actions when creating or updating tasks.
Always respond in the same language the user writes in.`;

app.post("/api/assistant/chat", async (req: Request, res: Response) => {
  const { message } = req.body as { message: string };

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

  const client = new CopilotClient();

  try {
    const session = await client.createSession({
      model: "claude-sonnet-4.6",
      streaming: true,
      systemMessage: { content: SYSTEM_MESSAGE },
      tools: [getTasks, createTask, updateTaskStatus],
      onPermissionRequest: approveAll,
    });

    session.on("assistant.message_delta", (event) => {
      sendEvent("delta", event.data.deltaContent ?? "");
    });

    session.on("session.idle", () => {
      sendEvent("done", "");
      res.end();
    });

    await session.sendAndWait({ prompt: message });
    await session.disconnect();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    sendEvent("error", errorMessage);
    res.end();
  } finally {
    await client.stop();
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

app.listen(PORT, () => {
  console.log(
    `🤖 Copilot Assistant Server running on http://localhost:${PORT}`,
  );
});
