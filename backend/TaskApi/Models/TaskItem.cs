namespace TaskApi.Models;

/// <summary>
/// Mirrors the Angular <c>Task</c> model in
/// <c>src/app/features/tasks/data/models/task.model.ts</c>.
/// </summary>
public sealed record TaskItem
{
    /// <summary>Assigned by the store on create; clients POST without one.</summary>
    public string Id { get; init; } = "";

    public required string Title { get; init; }
    public string Description { get; init; } = "";

    /// <summary>"todo" | "in_progress" | "completed"</summary>
    public string Status { get; init; } = "todo";

    /// <summary>"low" | "medium" | "high"</summary>
    public string Priority { get; init; } = "medium";

    public string? DueDate { get; init; }
    public string? CreatedAt { get; init; }
    public string? CompletedAt { get; init; }
    public int Order { get; init; }
}
