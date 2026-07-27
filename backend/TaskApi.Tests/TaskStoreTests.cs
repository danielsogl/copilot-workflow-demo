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
