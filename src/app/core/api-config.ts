import { InjectionToken } from "@angular/core";

export interface ApiConfig {
  readonly tasksUrl: string;
  readonly assistantUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>("API_CONFIG", {
  providedIn: "root",
  factory: () => ({
    tasksUrl: "http://localhost:3000/tasks",
    assistantUrl: "http://localhost:3001/api/assistant/chat",
  }),
});
