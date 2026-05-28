# Landing Page Test Plan – Task Board Workflow Demo

## Application Overview

The application is a Kanban-style Task Board (Workflow Demo) accessible at http://localhost:4200. The root URL redirects to /board, which serves as the landing page. It features a statistics dashboard, a filterable and searchable Kanban board with three columns (To Do, In Progress, Done), full CRUD operations for tasks, priority filtering, real-time search, drag-and-drop reordering, and an AI Assistant chat page at /assistant.

## Test Scenarios

### 1. Landing Page – Layout & Statistics

**Seed:** `tests/seed.spec.ts`

#### 1.1. Verify page title and header branding

**File:** `tests/landing-page/layout-statistics.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200


    - expect: The browser tab title reads 'Task Board · Workflow Demo'
    - expect: The page URL redirects to /board
    - expect: The sidebar header shows the 'dashboard' icon, the 'Task Board' title and 'Workflow demo' subtitle

#### 1.2. Verify statistics cards are displayed

**File:** `tests/landing-page/layout-statistics.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board


    - expect: Six statistic cards are visible: Total, To Do, In Progress, Done, Overdue, and Complete

2. Observe the numeric values shown on each statistics card


    - expect: 'Total' card shows an integer value
    - expect: 'To Do' card shows an integer value
    - expect: 'In Progress' card shows an integer value
    - expect: 'Done' card shows an integer value
    - expect: 'Overdue' card shows an integer value
    - expect: 'Complete' card shows a percentage value

3. Observe the progress bar in the 'Complete' statistics card


    - expect: A progress bar is visible and its fill corresponds to the displayed completion percentage

#### 1.3. Verify primary navigation links

**File:** `tests/landing-page/layout-statistics.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and inspect the sidebar navigation


    - expect: Two navigation links are visible: 'Board' (icon: view_kanban) and 'AI Assistant' (icon: auto_awesome)

2. Click the 'AI Assistant' navigation link


    - expect: The URL changes to /assistant
    - expect: The AI Assistant page is displayed

3. Click the 'Board' navigation link


    - expect: The URL changes to /board
    - expect: The Task Board page is displayed

### 2. Landing Page – Kanban Board Display

**Seed:** `tests/seed.spec.ts`

#### 2.1. Verify three Kanban columns are displayed with correct headings and counts

**File:** `tests/landing-page/kanban-board.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board


    - expect: Three Kanban columns are visible with headings 'To Do', 'In Progress', and 'Done'
    - expect: Each column heading is accompanied by a numeric badge showing the task count in that column

#### 2.2. Verify task cards display all required information

**File:** `tests/landing-page/kanban-board.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and observe any task card in any column


    - expect: Each task card shows a priority badge (high, medium, or low)
    - expect: Each task card shows a title
    - expect: Each task card shows a description text
    - expect: Each task card shows a due date with a calendar icon
    - expect: Each task card has a 'more_vert' (three-dot) menu button

#### 2.3. Verify empty column state is displayed when no tasks match

**File:** `tests/landing-page/kanban-board.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, type a search term in the search box that matches no tasks (e.g. 'zzzzz')


    - expect: All Kanban columns display an empty state with an inbox icon, 'No tasks' text, and 'Drop a card here' label

### 3. Landing Page – Search Functionality

**Seed:** `tests/seed.spec.ts`

#### 3.1. Search tasks by keyword in title

**File:** `tests/landing-page/search.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board


    - expect: The search text box with placeholder 'Search tasks...' is visible

2. Type 'bug' into the search text box


    - expect: Only tasks whose title or description contains 'bug' are shown across all columns
    - expect: The 'To Do' and 'Done' columns show '0' count and display the empty state
    - expect: The 'In Progress' column shows '1' and displays the 'Fix critical bug' task card
    - expect: A 'Clear search' (×) button appears inside the search box

#### 3.2. Clear search restores all tasks

**File:** `tests/landing-page/search.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and type 'bug' into the search box


    - expect: Filtered results are shown

2. Click the 'Clear search' (×) button


    - expect: The search text box is emptied
    - expect: All original tasks are restored across all columns
    - expect: The 'Clear search' button disappears

#### 3.3. Search with no matching results shows empty state in all columns

**File:** `tests/landing-page/search.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and type 'xyznonexistent' into the search box


    - expect: Every Kanban column shows '0' count and the 'No tasks / Drop a card here' empty state

#### 3.4. Search is case-insensitive

**File:** `tests/landing-page/search.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and type 'BUG' (uppercase) into the search box


    - expect: The 'Fix critical bug' task card is still shown (search is case-insensitive)

### 4. Landing Page – Priority Filter

**Seed:** `tests/seed.spec.ts`

#### 4.1. Filter tasks by 'high' priority

**File:** `tests/landing-page/priority-filter.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board


    - expect: Three priority filter chips are visible: 'high', 'medium', and 'low'

2. Click the 'high' priority chip


    - expect: Only tasks with a 'high' priority badge are shown in the Kanban board
    - expect: Tasks with 'medium' or 'low' priority are hidden

#### 4.2. Filter tasks by 'medium' priority

**File:** `tests/landing-page/priority-filter.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and click the 'medium' priority chip


    - expect: Only tasks with a 'medium' priority badge are displayed in the board

#### 4.3. Filter tasks by 'low' priority

**File:** `tests/landing-page/priority-filter.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and click the 'low' priority chip


    - expect: Only tasks with a 'low' priority badge are displayed in the board

#### 4.4. Deselect priority filter restores all tasks

**File:** `tests/landing-page/priority-filter.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, click 'high' to activate filter, then click 'high' again to deactivate it


    - expect: All tasks are restored in the Kanban board regardless of priority

#### 4.5. Combined search and priority filter

**File:** `tests/landing-page/priority-filter.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, click the 'high' priority chip, then type 'bug' in the search box


    - expect: Only the 'Fix critical bug' task (high priority, contains 'bug') is shown

### 5. Landing Page – Create Task

**Seed:** `tests/seed.spec.ts`

#### 5.1. Open and close Create Task dialog via Cancel

**File:** `tests/landing-page/create-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and click the 'Create new task' floating action button


    - expect: A modal dialog titled 'Create Task' opens
    - expect: The dialog contains: Title field (required), Description field (required), Priority dropdown (default 'Medium'), Due Date field (required)
    - expect: The 'Create' button is disabled
    - expect: The 'Cancel' button is enabled

2. Click the 'Cancel' button


    - expect: The dialog closes without creating a task
    - expect: The Kanban board is unchanged

#### 5.2. Create Task form validation – required fields

**File:** `tests/landing-page/create-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, click 'Create new task', then click inside the Title field and immediately click elsewhere without entering text


    - expect: A validation error 'Title is required' is displayed below the Title field

2. Leave the Description and Due Date fields empty


    - expect: The 'Create' button remains disabled as long as required fields are empty

#### 5.3. Create Task – Priority dropdown options

**File:** `tests/landing-page/create-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, open the Create Task dialog, then click the Priority dropdown


    - expect: A dropdown list appears with three options: 'Low', 'Medium' (selected by default), and 'High'

#### 5.4. Successfully create a new task

**File:** `tests/landing-page/create-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and click 'Create new task'


    - expect: The Create Task dialog opens

2. Enter 'Test task title' in the Title field


    - expect: Text is entered in the Title field

3. Enter 'Test task description' in the Description field


    - expect: Text is entered in the Description field

4. Select 'High' in the Priority dropdown


    - expect: Priority is set to High

5. Enter a future date (e.g., '12/31/2026') in the Due Date field


    - expect: The date is entered and the 'Create' button becomes enabled

6. Click the 'Create' button


    - expect: The dialog closes
    - expect: The new 'Test task title' task card appears in the 'To Do' column
    - expect: The 'To Do' column count increments by 1
    - expect: The 'Total' statistics card increments by 1

#### 5.5. Create button is disabled when required fields are missing

**File:** `tests/landing-page/create-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, open the Create Task dialog, and fill in only the Title field


    - expect: The 'Create' button remains disabled

2. Fill in Description but leave Due Date empty


    - expect: The 'Create' button remains disabled

### 6. Landing Page – Edit Task

**Seed:** `tests/seed.spec.ts`

#### 6.1. Open Edit Task dialog with pre-filled data

**File:** `tests/landing-page/edit-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and click the 'more_vert' (three-dot) button on the 'Client presentation' task card in the 'To Do' column


    - expect: A dropdown menu appears with two items: 'Edit' and 'Delete'

2. Click 'Edit'


    - expect: An 'Edit Task' modal dialog opens
    - expect: The Title field is pre-filled with 'Client presentation'
    - expect: The Description field is pre-filled with the task's existing description
    - expect: The Priority dropdown shows 'High'
    - expect: The Due Date field is pre-filled with '2/27/2026'
    - expect: The 'Update' button is enabled

#### 6.2. Cancel Edit Task dialog discards changes

**File:** `tests/landing-page/edit-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, open the Edit dialog for the 'Client presentation' task, change the title to 'Modified title', then click 'Cancel'


    - expect: The dialog closes
    - expect: The task card still shows 'Client presentation' as the title (no change persisted)

#### 6.3. Successfully update a task

**File:** `tests/landing-page/edit-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and open the Edit dialog for the 'Schedule team meeting' task


    - expect: The dialog opens with pre-filled values

2. Clear the Title field and type 'Updated meeting title'


    - expect: The Title field shows 'Updated meeting title'

3. Click the 'Update' button


    - expect: The dialog closes
    - expect: The task card in the 'To Do' column now shows 'Updated meeting title'

#### 6.4. Edit Task – Update button disabled when Title is cleared

**File:** `tests/landing-page/edit-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, open the Edit dialog for any task, and clear the Title field completely


    - expect: A 'Title is required' validation error appears and the 'Update' button is disabled

### 7. Landing Page – Delete Task

**Seed:** `tests/seed.spec.ts`

#### 7.1. Open Delete confirmation dialog

**File:** `tests/landing-page/delete-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, click the 'more_vert' button on the 'Update website content' task, then click 'Delete'


    - expect: A 'Delete Task' confirmation dialog appears
    - expect: The dialog message reads: Are you sure you want to delete "Update website content"?
    - expect: Two buttons are shown: 'Cancel' and 'Delete'

#### 7.2. Cancel Delete dialog does not remove the task

**File:** `tests/landing-page/delete-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, open the Delete dialog for 'Update website content', then click 'Cancel'


    - expect: The dialog closes
    - expect: The 'Update website content' task card is still visible in the 'To Do' column

#### 7.3. Confirm Delete removes the task from the board

**File:** `tests/landing-page/delete-task.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board, open the Delete dialog for 'Update website content', then click 'Delete'


    - expect: The dialog closes
    - expect: The 'Update website content' task card is no longer visible on the board
    - expect: The 'To Do' column count decrements by 1
    - expect: The 'Total' statistics card decrements by 1

### 8. Landing Page – Task Card Context Menu

**Seed:** `tests/seed.spec.ts`

#### 8.1. Context menu opens and closes for any task card

**File:** `tests/landing-page/task-context-menu.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/board and click the 'more_vert' button on the 'Fix critical bug' task in the 'In Progress' column


    - expect: A dropdown menu appears with 'Edit' and 'Delete' menu items, each with a corresponding icon

2. Press Escape or click elsewhere on the page


    - expect: The dropdown menu closes without any action taken

### 9. Landing Page – AI Assistant Page

**Seed:** `tests/seed.spec.ts`

#### 9.1. Verify AI Assistant page layout

**File:** `tests/landing-page/ai-assistant.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/assistant


    - expect: The page title shows 'AI Task Assistant'
    - expect: The subtitle reads 'Powered by GitHub Copilot'
    - expect: A 'Clear conversation' button is visible but disabled (no conversation yet)
    - expect: A greeting message is shown with suggested prompts
    - expect: A text input field with placeholder 'e.g. What are my high priority tasks?' is visible
    - expect: A 'Send message' button is visible but disabled (input is empty)

#### 9.2. Send message button is disabled when input is empty

**File:** `tests/landing-page/ai-assistant.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/assistant and observe the 'Send message' button state


    - expect: The 'Send message' button is disabled when the text input is empty

#### 9.3. Send message button enables when text is entered

**File:** `tests/landing-page/ai-assistant.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/assistant and type 'What are my high priority tasks?' in the text input


    - expect: The 'Send message' button becomes enabled
