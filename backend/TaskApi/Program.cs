using System.Text.Json;
using TaskApi;
using TaskApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

// Seeded from the repo's db.json — the same fixture the Angular app has always used.
var seedFile = builder.Configuration["SeedFile"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "..", "..", "db.json");
builder.Services.AddSingleton(TaskStore.FromSeedFile(Path.GetFullPath(seedFile)));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

var tasks = app.MapGroup("/tasks");

tasks.MapGet("/", (TaskStore store) => store.All());

tasks.MapGet("/{id}", (TaskStore store, string id) =>
    store.Find(id) is { } task ? Results.Ok(task) : Results.NotFound());

tasks.MapPost("/", (TaskStore store, TaskItem task) =>
{
    var created = store.Add(task);
    return Results.Created($"/tasks/{created.Id}", created);
});

tasks.MapPatch("/{id}", (TaskStore store, string id, JsonElement patch) =>
    store.Patch(id, patch) is { } task ? Results.Ok(task) : Results.NotFound());

tasks.MapDelete("/{id}", (TaskStore store, string id) =>
    store.Remove(id) ? Results.NoContent() : Results.NotFound());

app.Run();
