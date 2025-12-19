import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, catchError, of, tap } from "rxjs";
import { Task } from "../../../../shared/models/task.model";

@Injectable({
  providedIn: "root",
})
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000/tasks";

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error("Error fetching tasks:", error);
        return of([]);
      }),
    );
  }

  getTasksByStatus(status: string): Observable<Task[]> {
    if (status === "all") {
      return this.getTasks();
    }

    return this.getTasks().pipe(
      map((tasks) => tasks.filter((task) => task.status === status)),
    );
  }

  getTaskById(id: string): Observable<Task | null> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error("Error fetching task:", error);
        return of(null);
      }),
    );
  }

  createTask(
    taskData: Omit<Task, "id" | "createdAt" | "completedAt" | "status">,
  ): Observable<Task> {
    const newTask: Omit<Task, "id"> = {
      ...taskData,
      status: this.isOverdue(taskData.dueDate) ? "overdue" : "pending",
      createdAt: new Date().toISOString(),
    };

    return this.http.post<Task>(this.apiUrl, newTask).pipe(
      catchError((error) => {
        console.error("Error creating task:", error);
        throw error;
      }),
    );
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, updates).pipe(
      catchError((error) => {
        console.error("Error updating task:", error);
        throw error;
      }),
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error("Error deleting task:", error);
        throw error;
      }),
    );
  }

  markTaskComplete(id: string): Observable<Task> {
    const updates: Partial<Task> = {
      status: "completed",
      completedAt: new Date().toISOString(),
    };

    return this.updateTask(id, updates);
  }

  markTaskPending(id: string): Observable<Task> {
    const updates: Partial<Task> = {
      status: "pending",
      completedAt: undefined,
    };

    return this.updateTask(id, updates);
  }

  updateOverdueTasks(): Observable<Task[]> {
    return this.getTasks().pipe(
      map((tasks) => {
        const today = new Date().toISOString().split("T")[0];
        return tasks.filter(
          (task) => task.status === "pending" && task.dueDate < today,
        );
      }),
      tap((overdueTasks) => {
        overdueTasks.forEach((task) => {
          this.updateTask(task.id, { status: "overdue" }).subscribe();
        });
      }),
    );
  }

  private isOverdue(dueDate: string): boolean {
    const today = new Date().toISOString().split("T")[0];
    return dueDate < today;
  }
}
