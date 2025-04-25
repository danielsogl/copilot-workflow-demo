Task Management Web Application

This document describes the core features and phases for the development of an Angular-based task management application for software developers. The app helps developers effectively manage their daily tasks and track progress.

---

# Core Features (MVP)

## 1. Task Creation

**Description:**

- Users can create new tasks.
- Each task includes: title, description, due date.

**Acceptance Criteria:**

- A "New Task" button is visible.
- A form opens for entering title, description, and due date (required fields: title, due date).
- After saving, the task appears in the task list.
- Tasks are stored locally (mock backend).

**User Stories:**

- As a user, I want to create tasks with a title, description, and due date so I can plan my work.

## 2. Task Status Management

**Description:**

- Tasks can have the status "In Progress" or "Completed".
- Tasks are automatically marked as "Overdue" if the due date is exceeded and they are not completed.

**Acceptance Criteria:**

- Users can set the status of a task to "In Progress" or "Completed".
- Tasks with an exceeded due date and status ≠ "Completed" are displayed as "Overdue".
- Status changes are immediately reflected in the UI.

**User Stories:**

- As a user, I want to mark tasks as "In Progress" or "Completed" to track my progress.
- As a user, I want to clearly recognize overdue tasks.

## 3. Task Filtering & Sorting

**Description:**

- Tasks can be filtered and sorted by status and due date.

**Acceptance Criteria:**

- Filter options: All, In Progress, Completed, Overdue.
- Sorting by due date (ascending/descending).
- Filter and sorting directly affect the displayed task list.

**User Stories:**

- As a user, I want to filter tasks by status to keep an overview.
- As a user, I want to sort tasks by due date to set priorities.

---

# Development Phases

## Phase 1: MVP (Mock Backend)

**Goal:** Basic frontend features and UI without a real backend service or authentication.

**Deliverables:**

- Create, display, update status, filter, and sort tasks (locally, mock backend).
- UI with Angular Material.
- Automatic overdue calculation.

**User Stories:**

- See above under Core Features.

**Tech:**

- Angular, TypeScript, Angular Material, mock backend (e.g., json-server, In-Memory Web API).

## Phase 2: Backend Integration

**Goal:** Persistent storage and management of tasks via a real backend service.

**Deliverables:**

- Tasks are stored and loaded from the backend.
- Status and overdue calculation are validated server-side.
- Error handling for server issues.

**User Stories:**

- As a user, I want my tasks to persist after a reload.
- As a user, I want to see error messages if the backend is unavailable.

**Tech:**

- NestJS or Firebase as backend.

## Phase 3: User Authentication and Management

**Goal:** User accounts and personal task management.

**Deliverables:**

- Registration, login, logout.
- Tasks are user-specific.
- Access protection for tasks.

**User Stories:**

- As a user, I want to register and log in so my tasks are private.
- As a user, I want to see and edit only my own tasks.

**Tech:**

- JWT auth (NestJS) or Firebase Auth.

---

# Task Data Model (Proposal)

The Task object contains the following fields:

- id: string (unique ID, e.g., UUID)
- title: string (required)
- description: string (optional)
- dueDate: string (ISO 8601, required)
- status: 'in-progress' | 'completed' | 'overdue'
- priority: 'low' | 'medium' | 'high' (optional, default: 'medium')
- tags: string[] (optional)
- createdAt: string (ISO 8601, set automatically)
- updatedAt: string (ISO 8601, set automatically)
- assignee: string (optional, e.g., user ID or name)
- notes: string (optional)
- attachments: string[] (optional, e.g., file URLs)

---

# Backend Integration (Phase 2)

**Possible Backend Technologies:**

- NestJS (TypeScript-based)
- Firebase (Firestore)
- Supabase (PostgreSQL, Auth, Storage, Realtime)

**Note:** Supabase offers a modern, scalable solution with SQL database, authentication, and file uploads. The task data model is compatible with Supabase (PostgreSQL).

---

This specification serves as a basis for further planning, user stories, and implementation of the individual features and phases.
