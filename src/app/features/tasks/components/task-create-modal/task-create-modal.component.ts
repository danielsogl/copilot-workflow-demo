import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { Task } from '../../../../shared/models/task.model';

interface TaskForm {
  title: FormControl<string>;
  description: FormControl<string>;
  priority: FormControl<'low' | 'medium' | 'high'>;
  dueDate: FormControl<string>;
}

@Component({
  selector: 'app-task-create-modal',
  templateUrl: './task-create-modal.component.html',
  styleUrl: './task-create-modal.component.scss',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class TaskCreateModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskCreateModalComponent>);
  private readonly taskService = inject(TaskService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly taskForm: FormGroup<TaskForm> = this.formBuilder.group<TaskForm>({
    title: this.formBuilder.control('', { 
      nonNullable: true, 
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)]
    }),
    description: this.formBuilder.control('', { 
      nonNullable: true, 
      validators: [Validators.maxLength(500)]
    }),
    priority: this.formBuilder.control('medium' as const, { 
      nonNullable: true, 
      validators: [Validators.required]
    }),
    dueDate: this.formBuilder.control('', { 
      nonNullable: true, 
      validators: [Validators.required]
    })
  });

  readonly priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ] as const;

  readonly minDate = new Date();

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading.set(true);
      this.error.set(null);

      const formValue = this.taskForm.getRawValue();
      const taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'status'> = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: formValue.dueDate
      };

      this.taskService.createTask(taskData).subscribe({
        next: (createdTask) => {
          this.isLoading.set(false);
          this.dialogRef.close(createdTask);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Failed to create task. Please try again.');
          console.error('Error creating task:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: keyof TaskForm): string {
    const control = this.taskForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: keyof TaskForm): string {
    const labels: Record<keyof TaskForm, string> = {
      title: 'Title',
      description: 'Description',
      priority: 'Priority',
      dueDate: 'Due Date'
    };
    return labels[fieldName];
  }
}
