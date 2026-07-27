using System.Text.Json;
using TaskApi.Models;

namespace TaskApi;

/// <summary>
/// In-memory task store, seeded from the repo's <c>db.json</c>.
/// Writes are not persisted — a restart resets the board, which is what a
/// workshop wants.
/// </summary>
public sealed class TaskStore
{
    // ponytail: one lock for the whole list. Per-task locking if this ever
    // serves more than a workshop room.
    private readonly Lock _gate = new();
    private readonly List<TaskItem> _tasks = [];

    public TaskStore(IEnumerable<TaskItem> seed) => _tasks.AddRange(seed);

    public static TaskStore FromSeedFile(string path)
    {
        using var stream = File.OpenRead(path);
        using var document = JsonDocument.Parse(stream);

        var tasks = document.RootElement.GetProperty("tasks").Deserialize<List<TaskItem>>(JsonSerializerOptions.Web);
        return new TaskStore(tasks ?? []);
    }

    public IReadOnlyList<TaskItem> All()
    {
        lock (_gate)
        {
            return [.. _tasks];
        }
    }

    public TaskItem? Find(string id)
    {
        lock (_gate)
        {
            return _tasks.FirstOrDefault(task => task.Id == id);
        }
    }

    public TaskItem Add(TaskItem task)
    {
        var created = task with { Id = NewId() };

        lock (_gate)
        {
            _tasks.Add(created);
        }

        return created;
    }

    /// <summary>
    /// Applies a partial update, the way <c>PATCH /tasks/{id}</c> did under
    /// json-server: only the properties present in the payload change.
    /// </summary>
    public TaskItem? Patch(string id, JsonElement patch)
    {
        lock (_gate)
        {
            var index = _tasks.FindIndex(task => task.Id == id);
            if (index < 0)
            {
                return null;
            }

            var updated = Apply(_tasks[index], patch);
            _tasks[index] = updated;
            return updated;
        }
    }

    public bool Remove(string id)
    {
        lock (_gate)
        {
            return _tasks.RemoveAll(task => task.Id == id) > 0;
        }
    }

    private static TaskItem Apply(TaskItem task, JsonElement patch)
    {
        foreach (var property in patch.EnumerateObject())
        {
            task = property.Name switch
            {
                "title" => task with { Title = property.Value.GetString() ?? task.Title },
                "description" => task with { Description = property.Value.GetString() ?? task.Description },
                "status" => task with { Status = property.Value.GetString() ?? task.Status },
                "priority" => task with { Priority = property.Value.GetString() ?? task.Priority },
                "dueDate" => task with { DueDate = property.Value.GetString() },
                "createdAt" => task with { CreatedAt = property.Value.GetString() },
                "completedAt" => task with { CompletedAt = property.Value.GetString() },
                "order" => task with { Order = property.Value.GetInt32() },
                _ => task,
            };
        }

        return task;
    }

    /// <summary>Eleven URL-safe characters, like the ids json-server generated.</summary>
    private static string NewId() =>
        Convert.ToBase64String(Guid.NewGuid().ToByteArray())[..11].Replace('+', '-').Replace('/', '_');
}
