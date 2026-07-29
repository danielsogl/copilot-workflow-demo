using System.Text.Json;
using TaskApi.Models;
using Xunit;

namespace TaskApi.Tests;

public class TaskStoreTests
{
    private static TaskStore StoreWith(params TaskItem[] tasks) => new(tasks);

    private static TaskItem ATask(string id = "abc", string status = "todo", int order = 0) =>
        new() { Id = id, Title = "Write the gate skill", Status = status, Order = order };

    private static JsonElement Patch(string json) => JsonDocument.Parse(json).RootElement;

    [Fact]
    public void Add_assigns_an_id_and_keeps_the_submitted_values()
    {
        var store = StoreWith();

        var created = store.Add(new TaskItem { Title = "Bundle the gates", Priority = "high" });

        Assert.NotEmpty(created.Id);
        Assert.Equal("Bundle the gates", created.Title);
        Assert.Equal("high", created.Priority);
        Assert.Single(store.All());
    }

    [Fact]
    public void Patch_changes_only_the_properties_present_in_the_payload()
    {
        var store = StoreWith(ATask(status: "todo", order: 3));

        var patched = store.Patch("abc", Patch("""{"status":"completed"}"""));

        Assert.NotNull(patched);
        Assert.Equal("completed", patched.Status);
        Assert.Equal("Write the gate skill", patched.Title);
        Assert.Equal(3, patched.Order);
    }

    [Fact]
    public void Patch_returns_null_for_an_unknown_id()
    {
        var store = StoreWith(ATask());

        Assert.Null(store.Patch("nope", Patch("""{"status":"completed"}""")));
    }

    [Fact]
    public void Patch_ignores_properties_the_model_does_not_have()
    {
        var store = StoreWith(ATask());

        var patched = store.Patch("abc", Patch("""{"assignee":"nobody"}"""));

        Assert.Equal(ATask(), patched);
    }

    [Fact]
    public void Add_hands_out_a_fresh_id_per_task()
    {
        var store = StoreWith();

        var first = store.Add(new TaskItem { Title = "One" });
        var second = store.Add(new TaskItem { Title = "Two" });

        Assert.NotEqual(first.Id, second.Id);
        Assert.Equal(11, first.Id.Length);
        Assert.DoesNotContain(first.Id, ['+', '/']);
    }

    [Fact]
    public void Find_returns_the_task_or_null()
    {
        var store = StoreWith(ATask());

        Assert.Equal(ATask(), store.Find("abc"));
        Assert.Null(store.Find("nope"));
    }

    [Fact]
    public void Patch_applies_every_supported_property()
    {
        var store = StoreWith(ATask());

        var patched = store.Patch(
            "abc",
            Patch(
                """
                {
                  "title": "Renamed",
                  "description": "Why",
                  "status": "completed",
                  "priority": "high",
                  "dueDate": "2026-01-01",
                  "createdAt": "2025-01-01",
                  "completedAt": "2026-02-02",
                  "order": 7
                }
                """
            )
        );

        Assert.Equal(
            new TaskItem
            {
                Id = "abc",
                Title = "Renamed",
                Description = "Why",
                Status = "completed",
                Priority = "high",
                DueDate = "2026-01-01",
                CreatedAt = "2025-01-01",
                CompletedAt = "2026-02-02",
                Order = 7,
            },
            patched
        );
    }

    [Fact]
    public void Patch_clears_nullable_dates_when_the_payload_says_null()
    {
        var store = StoreWith(ATask() with { DueDate = "2026-01-01", CompletedAt = "2026-02-02" });

        var patched = store.Patch("abc", Patch("""{"dueDate":null,"completedAt":null}"""));

        Assert.Null(patched!.DueDate);
        Assert.Null(patched.CompletedAt);
    }

    [Fact]
    public void FromSeedFile_reads_the_tasks_array_with_web_naming()
    {
        var path = Path.GetTempFileName();
        File.WriteAllText(
            path,
            """{"tasks":[{"id":"seed-1","title":"Seeded","status":"todo","priority":"low","dueDate":"2026-03-03","order":2}]}"""
        );

        try
        {
            var store = TaskStore.FromSeedFile(path);

            var seeded = Assert.Single(store.All());
            Assert.Equal("seed-1", seeded.Id);
            Assert.Equal("Seeded", seeded.Title);
            Assert.Equal("2026-03-03", seeded.DueDate);
            Assert.Equal(2, seeded.Order);
        }
        finally
        {
            File.Delete(path);
        }
    }

    [Fact]
    public void Remove_reports_whether_it_removed_anything()
    {
        var store = StoreWith(ATask());

        Assert.True(store.Remove("abc"));
        Assert.False(store.Remove("abc"));
        Assert.Empty(store.All());
    }

    [Fact]
    public void All_returns_a_copy_so_callers_cannot_mutate_the_store()
    {
        var store = StoreWith(ATask());

        var snapshot = store.All();
        store.Remove("abc");

        Assert.Single(snapshot);
    }
}
