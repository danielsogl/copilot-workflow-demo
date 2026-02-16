const API_URL = "http://localhost:3000";

const SEED_TASKS = [
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

export async function resetDatabase(): Promise<void> {
  const response = await fetch(`${API_URL}/tasks`);
  const tasks: { id: string }[] = await response.json();

  await Promise.all(
    tasks.map((task) =>
      fetch(`${API_URL}/tasks/${task.id}`, { method: "DELETE" }),
    ),
  );

  for (const task of SEED_TASKS) {
    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
  }
}
