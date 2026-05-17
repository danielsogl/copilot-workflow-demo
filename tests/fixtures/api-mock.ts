import { type Route } from "@playwright/test";
import { test as base } from "playwright-bdd";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  order: number;
}

export const SEED_TASKS: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    description:
      "Draft and finalize the Q1 project proposal for the new client engagement",
    status: "completed",
    priority: "high",
    dueDate: "2026-02-10",
    createdAt: "2026-02-01",
    completedAt: "2026-02-09",
    order: 0,
  },
  {
    id: "2",
    title: "Review team performance",
    description: "Conduct quarterly performance reviews for all team members",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-02-20",
    createdAt: "2026-02-02",
    order: 0,
  },
  {
    id: "3",
    title: "Update website content",
    description: "Refresh homepage and about page content with new branding",
    status: "todo",
    priority: "low",
    dueDate: "2026-02-25",
    createdAt: "2026-02-03",
    order: 1,
  },
  {
    id: "4",
    title: "Prepare budget report",
    description:
      "Compile Q4 budget analysis and projections for management review",
    status: "completed",
    priority: "high",
    dueDate: "2026-02-12",
    createdAt: "2026-02-01",
    completedAt: "2026-02-11",
    order: 1,
  },
  {
    id: "5",
    title: "Schedule team meeting",
    description: "Organize monthly team sync meeting and prepare agenda",
    status: "todo",
    priority: "medium",
    dueDate: "2026-02-28",
    createdAt: "2026-02-05",
    order: 2,
  },
  {
    id: "6",
    title: "Fix critical bug",
    description: "Resolve login authentication issue reported by QA team",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-02-14",
    createdAt: "2026-02-06",
    order: 1,
  },
  {
    id: "7",
    title: "Code review session",
    description: "Review pull requests from development team for the sprint",
    status: "completed",
    priority: "medium",
    dueDate: "2026-02-15",
    createdAt: "2026-02-03",
    completedAt: "2026-02-14",
    order: 2,
  },
  {
    id: "8",
    title: "Client presentation",
    description: "Present project progress to stakeholders and gather feedback",
    status: "todo",
    priority: "high",
    dueDate: "2026-02-27",
    createdAt: "2026-02-06",
    order: 0,
  },
];

const TASKS_BASE = "http://localhost:3000/tasks";

function parseBody<T>(route: Route): T {
  const raw = route.request().postData();
  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

async function jsonFulfill(
  route: Route,
  body: unknown,
  status = 200,
): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export const test = base.extend<{ tasksApi: Task[] }>({
  tasksApi: [
    async ({ context }, use) => {
      const tasks = new Map<string, Task>(
        SEED_TASKS.map((task) => [task.id, structuredClone(task)]),
      );
      let nextId = SEED_TASKS.length + 1;

      await context.route(`${TASKS_BASE}**`, async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const method = request.method();
        const segments = url.pathname.split("/").filter(Boolean);
        const id = segments.length > 1 ? segments[1] : undefined;

        if (!id) {
          if (method === "GET") {
            return jsonFulfill(route, Array.from(tasks.values()));
          }
          if (method === "POST") {
            const body = parseBody<Partial<Task>>(route);
            const created: Task = {
              order: 0,
              status: "todo",
              priority: "medium",
              dueDate: "",
              description: "",
              title: "",
              createdAt: new Date().toISOString().split("T")[0],
              ...body,
              id: String(nextId++),
            };
            tasks.set(created.id, created);
            return jsonFulfill(route, created, 201);
          }
        } else {
          const existing = tasks.get(id);
          if (method === "GET") {
            return existing
              ? jsonFulfill(route, existing)
              : jsonFulfill(route, { error: "Not Found" }, 404);
          }
          if (method === "PATCH" || method === "PUT") {
            if (!existing)
              return jsonFulfill(route, { error: "Not Found" }, 404);
            const body = parseBody<Partial<Task>>(route);
            const updated: Task = { ...existing, ...body, id };
            tasks.set(id, updated);
            return jsonFulfill(route, updated);
          }
          if (method === "DELETE") {
            tasks.delete(id);
            return jsonFulfill(route, {});
          }
        }

        await route.continue();
      });

      await use(Array.from(tasks.values()));
    },
    { auto: true },
  ],
});

export const expect = test.expect;
