import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { TaskCreateModalComponent } from '../task-create-modal/task-create-modal.component';
import { Task } from '../../../../shared/models/task.model';
import { tap } from 'rxjs';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe,
    TitleCasePipe
  ]
})
export class TaskListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<string>('all');

  readonly routeParams = toSignal(this.route.params);
  
  readonly tasks = toSignal(
    this.taskService.getTasks().pipe(
      tap(() => this.isLoading.set(false)),
      tap(() => this.error.set(null))
    ), 
    { initialValue: [] as Task[] }
  );

  readonly filteredTasks = computed(() => {
    const allTasks = this.tasks();
    const filter = this.statusFilter();
    
    if (filter === 'all') {
      return allTasks;
    }
    
    return allTasks.filter(task => task.status === filter);
  });

  readonly displayedColumns = ['title', 'status', 'priority', 'dueDate', 'actions'];

  readonly statusLabels: Record<string, string> = {
    all: 'All Tasks',
    pending: 'Pending Tasks',
    completed: 'Completed Tasks',
    overdue: 'Overdue Tasks'
  };

  readonly priorityColors: Record<string, string> = {
    low: 'accent',
    medium: 'primary',
    high: 'warn'
  };

  readonly statusColors: Record<string, string> = {
    pending: 'primary',
    completed: 'accent',
    overdue: 'warn'
  };

  ngOnInit(): void {
    // Set filter based on route parameter
    const params = this.routeParams();
    if (params?.['status']) {
      this.statusFilter.set(params['status']);
    }
  }

  openCreateTaskModal(): void {
    const dialogRef = this.dialog.open(TaskCreateModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh tasks after creation
        this.refreshTasks();
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updateMethod = newStatus === 'completed' 
      ? this.taskService.markTaskComplete(task.id)
      : this.taskService.markTaskPending(task.id);

    updateMethod.subscribe({
      next: () => {
        this.refreshTasks();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.error.set('Failed to update task status');
      }
    });
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.refreshTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.error.set('Failed to delete task');
        }
      });
    }
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      completed: 'check_circle',
      overdue: 'warning'
    };
    return icons[status] || 'help';
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      low: 'keyboard_arrow_down',
      medium: 'remove',
      high: 'keyboard_arrow_up'
    };
    return icons[priority] || 'remove';
  }

  isOverdue(task: Task): boolean {
    const today = new Date().toISOString().split('T')[0];
    return task.status !== 'completed' && task.dueDate < today;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private refreshTasks(): void {
    this.isLoading.set(true);
    this.taskService.getTasks().subscribe({
      next: () => {
        // This will trigger the signal update
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error refreshing tasks:', error);
        this.error.set('Failed to refresh tasks');
        this.isLoading.set(false);
      }
    });
  }
}
