import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Task, TaskFormData } from "../models/task.model";

@Injectable({
  providedIn: "root",
})
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000/tasks";

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(taskData: TaskFormData, order: number): Observable<Task> {
    const newTask: Omit<Task, "id"> = {
      ...taskData,
      status: "todo",
      order,
      createdAt: new Date().toISOString().split("T")[0],
    };
    return this.http.post<Task>(this.apiUrl, newTask);
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, updates);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
