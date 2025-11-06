import {
  Component,
  Input,
  computed,
  inject,
  signal,
  effect,
  OnDestroy,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Task } from "../../../../shared/models/task.model";
import { TaskStore } from "../../services/task.store";

@Component({
  selector: "app-task-timer",
  templateUrl: "./task-timer.component.html",
  styleUrl: "./task-timer.component.scss",
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class TaskTimerComponent implements OnDestroy {
  private readonly taskStore = inject(TaskStore);

  @Input({ required: true }) task!: Task;
  @Input() compact = false;

  // Local timer tick for UI updates
  private readonly currentTime = signal(Date.now());
  private intervalId: number | null = null;

  constructor() {
    // Update current time every second if timer is running
    effect(() => {
      const task = this.task;
      if (task?.timerStatus === "running") {
        this.startLocalTimer();
      } else {
        this.stopLocalTimer();
      }
    });
  }

  // Computed values
  readonly timerStatus = computed(() => this.task?.timerStatus || "idle");
  readonly estimatedMinutes = computed(() => this.task?.estimatedMinutes || 0);
  readonly elapsedMinutes = computed(() => {
    const task = this.task;
    if (!task) return 0;

    let elapsed = task.elapsedMinutes || 0;

    // If timer is running, add time since start
    if (task.timerStatus === "running" && task.timerStartedAt) {
      const startTime = new Date(task.timerStartedAt).getTime();
      const currentTime = this.currentTime();
      const additionalMinutes = (currentTime - startTime) / (1000 * 60);
      elapsed += additionalMinutes;
    }

    return Math.floor(elapsed);
  });

  readonly progressPercentage = computed(() => {
    const estimated = this.estimatedMinutes();
    const elapsed = this.elapsedMinutes();

    if (estimated === 0) return 0;

    const percentage = (elapsed / estimated) * 100;
    return Math.min(Math.round(percentage), 100);
  });

  readonly isOvertime = computed(() => {
    return (
      this.elapsedMinutes() > this.estimatedMinutes() &&
      this.estimatedMinutes() > 0
    );
  });

  readonly isRunning = computed(() => this.timerStatus() === "running");
  readonly isPaused = computed(() => this.timerStatus() === "paused");
  readonly isIdle = computed(() => this.timerStatus() === "idle");
  readonly isCompleted = computed(() => this.timerStatus() === "completed");

  readonly formattedElapsed = computed(() =>
    this.formatMinutes(this.elapsedMinutes()),
  );
  readonly formattedEstimated = computed(() =>
    this.formatMinutes(this.estimatedMinutes()),
  );

  // Actions
  startTimer(): void {
    if (this.task) {
      this.taskStore.startTimer(this.task.id);
    }
  }

  pauseTimer(): void {
    if (this.task) {
      this.taskStore.pauseTimer(this.task.id);
    }
  }

  stopTimer(): void {
    if (this.task) {
      this.taskStore.stopTimer(this.task.id);
    }
  }

  resetTimer(): void {
    if (this.task) {
      this.taskStore.resetTimer(this.task.id);
    }
  }

  // Helper methods
  private formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  private startLocalTimer(): void {
    if (this.intervalId !== null) return;

    this.intervalId = window.setInterval(() => {
      this.currentTime.set(Date.now());
    }, 1000);
  }

  private stopLocalTimer(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopLocalTimer();
  }
}
