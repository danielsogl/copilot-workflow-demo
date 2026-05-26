# Landing Page Test Plan

## Application Overview

Test coverage for the landing experience of the Task Board app, including board load, task discovery tools, task CRUD interactions, board movement, and top-level navigation from a fresh state.

## Test Scenarios

### 1. Landing Page - Task Board

**Seed:** `tests/seed.spec.ts`

#### 1.1. LP-001 Load landing board and verify baseline UI

**File:** `tests/landing-page/lp-001-load-board.spec.ts`

**Steps:**

1. Open the application at /board from a fresh browser session.


    - expect: Page loads without errors and shows header 'Task Board' with subtitle 'Workflow demo'.
    - expect: Primary navigation shows 'Board' and 'AI Assistant' links.
    - expect: KPI cards are visible for Total, To Do, In Progress, Done, Overdue, and Complete.
    - expect: Success: all core sections render and are interactable.
    - expect: Failure: missing section, blank board, or navigation not visible.

2. Inspect the board columns and task cards.


    - expect: Columns 'To Do', 'In Progress', and 'Done' are present with visible counts.
    - expect: Each visible task card shows priority, title, description, due date, and overflow action menu button.
    - expect: 'Create new task' floating action button is visible and clickable.
    - expect: Success: user can identify and act on board content.
    - expect: Failure: cards or action entry points are missing.

#### 1.2. LP-002 Search tasks across columns

**File:** `tests/landing-page/lp-002-search.spec.ts`

**Steps:**

1. From fresh /board state, enter 'bug' into 'Search tasks...'.


    - expect: Matching tasks remain visible and non-matching tasks are filtered out across all columns.
    - expect: Columns with no matching items show the empty-state messaging (e.g., 'No tasks' and 'Drop a card here').
    - expect: A 'Clear search' control appears.
    - expect: Success: search narrows visible tasks consistently.
    - expect: Failure: unrelated tasks remain visible or search has no effect.

2. Click 'Clear search'.


    - expect: Search text is cleared and full task list returns.
    - expect: Column counts return to their pre-search values.
    - expect: Success: user can restore baseline list quickly.
    - expect: Failure: stale filter state persists.

#### 1.3. LP-003 Filter by priority chip

**File:** `tests/landing-page/lp-003-priority-filter.spec.ts`

**Steps:**

1. From fresh /board state, click the 'high' priority chip.


    - expect: Only high-priority tasks remain visible.
    - expect: Column counts update to reflect filtered results.
    - expect: Success: priority chip acts as a global task filter.
    - expect: Failure: tasks with other priorities remain visible.

2. Click the same 'high' chip again to clear the filter.


    - expect: All priorities return to view.
    - expect: Counts revert to default state.
    - expect: Success: chip toggles filter on/off predictably.
    - expect: Failure: filter cannot be cleared or results stay restricted.

#### 1.4. LP-004 Create task modal validation (negative)

**File:** `tests/landing-page/lp-004-create-validation.spec.ts`

**Steps:**

1. From fresh /board state, click 'Create new task'.


    - expect: 'Create Task' dialog opens with required fields: Title, Description, and Due Date.
    - expect: Create button is disabled initially.
    - expect: Success: modal opens in guarded default state.
    - expect: Failure: modal does not open or submit is enabled before input.

2. Interact with fields without entering valid data (e.g., focus/blur Title, leave required values empty).


    - expect: Validation feedback appears for missing required input (e.g., title required).
    - expect: User cannot submit while required data is incomplete.
    - expect: Success: required validation prevents invalid task creation.
    - expect: Failure: invalid/empty task can be submitted.

3. Click 'Cancel'.


    - expect: Dialog closes and board remains unchanged.
    - expect: Success: cancel exits without side effects.
    - expect: Failure: modal stays open or data mutates unexpectedly.

#### 1.5. LP-005 Edit existing task

**File:** `tests/landing-page/lp-005-edit-task.spec.ts`

**Steps:**

1. From fresh /board state, open overflow menu on an existing task and choose 'Edit'.


    - expect: 'Edit Task' dialog opens pre-populated with selected task data (title, description, priority, due date).
    - expect: Success: edit context maps to correct card.
    - expect: Failure: dialog opens with wrong/empty data.

2. Update one or more fields and submit with 'Update'.


    - expect: Dialog closes and the edited task card shows updated values on the board.
    - expect: Counts remain logically consistent for the task status column.
    - expect: Success: edits persist and surface immediately.
    - expect: Failure: update is not reflected or wrong task is changed.

#### 1.6. LP-006 Delete task confirmation handling

**File:** `tests/landing-page/lp-006-delete-task.spec.ts`

**Steps:**

1. From fresh /board state, open task overflow menu and select 'Delete'.


    - expect: 'Delete Task' confirmation dialog appears naming the selected task.
    - expect: Both 'Cancel' and 'Delete' actions are available.
    - expect: Success: destructive action is gated by confirmation.
    - expect: Failure: task deletes immediately without confirmation.

2. Click 'Cancel'.


    - expect: Dialog closes and task remains on board unchanged.
    - expect: Success: cancel safely aborts deletion.
    - expect: Failure: task is removed after cancel.

3. Repeat delete flow and click 'Delete'.


    - expect: Dialog closes and selected task is removed.
    - expect: Related column count and summary metrics update accordingly.
    - expect: Success: confirmed delete removes only targeted task.
    - expect: Failure: wrong task removed or counts not updated.

#### 1.7. LP-007 Move task between columns

**File:** `tests/landing-page/lp-007-drag-drop.spec.ts`

**Steps:**

1. From fresh /board state, drag a task card from 'To Do' to 'In Progress'.


    - expect: Card appears in destination column and is removed from source column.
    - expect: Column counts adjust by -1/+1 respectively.
    - expect: Success: board supports status transitions via drag-and-drop.
    - expect: Failure: card snaps back, duplicates, or counts do not change.

#### 1.8. LP-008 Primary navigation routing

**File:** `tests/landing-page/lp-008-navigation.spec.ts`

**Steps:**

1. From fresh /board state, click 'AI Assistant' in primary navigation.


    - expect: URL changes to /assistant and assistant page content loads.
    - expect: Header and navigation remain visible for return navigation.
    - expect: Success: top-level route transition works.
    - expect: Failure: broken navigation link or wrong route.

2. Click 'Board' link.


    - expect: URL returns to /board and board content is restored.
    - expect: Success: user can move between major landing routes without losing app shell.
    - expect: Failure: return route fails or app shell breaks.

#### 1.9. LP-009 AI assistant quick interaction from landing nav path

**File:** `tests/landing-page/lp-009-assistant-chat.spec.ts`

**Steps:**

1. From fresh /assistant state, enter a valid prompt and send message.


    - expect: User message appears in conversation thread.
    - expect: Assistant response is returned and rendered.
    - expect: 'Clear conversation' becomes enabled after at least one exchange.
    - expect: Success: basic assistant round-trip works.
    - expect: Failure: message send fails, no response, or thread does not update.

2. Click 'Clear conversation'.


    - expect: Conversation resets to greeting/empty state and clear button is disabled again.
    - expect: Success: chat history can be reset.
    - expect: Failure: prior messages persist or controls remain inconsistent.
