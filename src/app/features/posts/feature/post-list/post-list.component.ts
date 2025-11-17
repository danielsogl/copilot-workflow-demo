import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PostStore } from '../post.store';
import { CreatePostRequest } from '../../data/post.service';

@Component({
  selector: 'app-post-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="post-list-container">
      <div class="header">
        <h1>Posts</h1>
        <button mat-raised-button color="primary" (click)="createSamplePost()">
          <mat-icon>add</mat-icon>
          Create Sample Post
        </button>
      </div>

      @if (postStore.loading()) {
        <div class="loading">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>Loading posts...</p>
        </div>
      }

      @if (postStore.error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon color="warn">error</mat-icon>
            <p>{{ postStore.error() }}</p>
            <button mat-button (click)="postStore.clearError()">Dismiss</button>
          </mat-card-content>
        </mat-card>
      }

      <div class="stats">
        <p>Total Posts: {{ postStore.totalPostCount() }}</p>
        @if (postStore.selectedPost(); as selected) {
          <p>Selected: {{ selected.title }}</p>
        }
      </div>

      @if (postStore.isEmpty() && !postStore.loading()) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon>article</mat-icon>
            <p>No posts available. Create one to get started!</p>
          </mat-card-content>
        </mat-card>
      }

      <div class="posts-grid">
        @for (post of postStore.postsEntities(); track post.id) {
          <mat-card
            class="post-card"
            [class.selected]="postStore.selectedId() === post.id">
            <mat-card-header>
              <mat-card-title>{{ post.title }}</mat-card-title>
              <mat-card-subtitle>
                Author ID: {{ post.authorId }} |
                {{ post.createdAt | date: 'short' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ post.content }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button
                mat-button
                (click)="selectPost(post.id)"
                [disabled]="postStore.selectedId() === post.id">
                Select
              </button>
              <button
                mat-button
                (click)="updatePost(post.id)">
                Update
              </button>
              <button
                mat-button
                color="warn"
                (click)="deletePost(post.id)">
                Delete
              </button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .post-list-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
    }

    .error-card {
      margin-bottom: 2rem;
      background-color: #ffebee;
    }

    .error-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stats {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      margin: 2rem 0;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .post-card {
      transition: transform 0.2s;
    }

    .post-card:hover {
      transform: translateY(-2px);
    }

    .post-card.selected {
      border: 2px solid #3f51b5;
    }

    mat-card-actions {
      display: flex;
      gap: 0.5rem;
    }
  `],
})
export class PostListComponent implements OnInit {
  readonly postStore = inject(PostStore);

  ngOnInit(): void {
    this.postStore.loadPosts();
  }

  selectPost(id: string): void {
    this.postStore.selectPost(id);
  }

  createSamplePost(): void {
    const newPost: CreatePostRequest = {
      title: `Sample Post ${Date.now()}`,
      content: 'This is a sample post created from the UI.',
      authorId: 'user-123',
    };
    this.postStore.createPost(newPost);
  }

  updatePost(id: string): void {
    const updates = {
      title: `Updated at ${new Date().toLocaleTimeString()}`,
      content: 'This post has been updated.',
    };
    this.postStore.updatePost({ id, updates });
  }

  deletePost(id: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postStore.deletePost(id);
    }
  }
}
