# Mobile View Test Plan

## Application Overview

Test plan for verifying the responsive mobile experience of the Workflow Demo task board app (Angular 21). Tests target a mobile viewport (e.g., Playwright `devices['iPhone 13']` or 390×844) and validate the layout breakpoints at 640px and 1024px, including navbar collapse, single-column kanban board stacking, full-width forms/dialogs, chat panel adaptation, and touch-friendly interactions. All tests assume a fresh app state at http://localhost:4200 with the json-server mock API running. The seed file configures `test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })` or uses `devices['iPhone 13']`.

## Test Scenarios

### 1. mobile-layout

**Seed:** `tests/mobile/seed.spec.ts`

#### 1.1. Navbar collapses to icon-only on mobile

**File:** `tests/mobile/navbar-collapse.spec.ts`

**Steps:**

1. Navigate to http://localhost:4200/ on a 390×844 mobile viewport
   - expect: The app redirects to /board
   - expect: The top toolbar is visible and fixed near the top of the viewport
   - expect: The toolbar height is approximately 60px (mobile size)
   - expect: The 'Workflow demo' subtitle text under the 'Task Board' title is hidden

2. Inspect the primary navigation links 'Board' and 'AI Assistant'
   - expect: Both navigation links remain visible as icon-only buttons
   - expect: The text labels 'Board' and 'AI Assistant' are visually hidden (display:none) and only the Material icons (view_kanban, auto_awesome) are shown
   - expect: Each nav link still has an accessible name for screen readers

3. Tap the 'AI Assistant' nav icon
   - expect: The route changes to /assistant
   - expect: The 'AI Assistant' icon shows the active-link visual state

4. Tap the 'Board' nav icon
   - expect: The route changes back to /board
   - expect: The 'Board' icon shows the active-link visual state

#### 1.2. Task board stacks columns vertically on mobile

**File:** `tests/mobile/task-board-stack.spec.ts`

**Steps:**

1. Navigate to /board on mobile viewport
   - expect: The task board container renders as a single column (grid-template-columns: 1fr)
   - expect: The three columns 'To Do', 'In Progress', and 'Done' are stacked vertically
   - expect: Each column spans the full available content width
   - expect: No horizontal scroll is required to see all columns

2. Scroll down the page
   - expect: All three columns and their tasks become reachable through vertical scrolling
   - expect: The floating 'Create new task' action button remains visible/accessible while scrolling

3. Inspect the dashboard stats row at the top of /board
   - expect: Stats cards (Total, To Do, In Progress, Done, Overdue, Complete) remain readable and do not overflow the viewport
   - expect: Numbers and labels inside each card are not clipped

#### 1.3. Create task dialog adapts to mobile width

**File:** `tests/mobile/task-form-dialog-mobile.spec.ts`

**Steps:**

1. Navigate to /board on mobile viewport and tap the floating 'Create new task' button
   - expect: The task form dialog opens
   - expect: The dialog uses (close to) the full mobile viewport width rather than its desktop min-width of 420px
   - expect: All form fields (title, description, priority, status, due date) are fully visible without horizontal scrolling

2. Fill in 'Mobile smoke test task' as title and 'Created from mobile viewport' as description, leave defaults for priority/status
   - expect: Inputs accept text and remain visible above the on-screen keyboard area
   - expect: Submit/Save action button is reachable by scrolling within the dialog

3. Tap the Save / Create action
   - expect: The dialog closes
   - expect: A new task card 'Mobile smoke test task' appears in the 'To Do' column
   - expect: The 'Total' and 'To Do' counters in the stats row increment by 1

4. Tap the floating 'Create new task' button again, then tap the close/cancel control
   - expect: The dialog opens and closes cleanly without leaving a scrim overlay stuck on screen
   - expect: No new task is created

#### 1.4. Task card menu and edit flow are usable on mobile

**File:** `tests/mobile/task-card-actions-mobile.spec.ts`

**Steps:**

1. Navigate to /board on mobile viewport and locate the 'Client presentation' card in the 'To Do' column
   - expect: The card renders with priority badge, title, description, and due date all visible inside the mobile column width
   - expect: The 'more_vert' menu trigger button is visible at the top-right of the card

2. Tap the 'more_vert' button on the 'Client presentation' card
   - expect: A context menu appears with at least Edit and Delete actions
   - expect: The menu is positioned within the viewport and is fully visible (not clipped at screen edges)

3. Tap the 'Edit' action
   - expect: The task form dialog opens pre-filled with the 'Client presentation' values
   - expect: The dialog fits the mobile viewport width

4. Change the title to 'Client presentation (mobile edit)' and save
   - expect: The dialog closes
   - expect: The card on the board now shows the updated title 'Client presentation (mobile edit)'

#### 1.5. Filters bar is usable on mobile

**File:** `tests/mobile/task-filters-mobile.spec.ts`

**Steps:**

1. Navigate to /board on mobile viewport
   - expect: The 'Search tasks...' input and the priority chips (high, medium, low) are visible
   - expect: Filter controls wrap onto multiple rows if needed and do not cause horizontal scroll

2. Type 'bug' into the search input
   - expect: Only the 'Fix critical bug' card remains visible across the columns
   - expect: Other columns show their empty/no-results state or hidden cards

3. Clear the search and tap the 'high' priority chip
   - expect: Only cards with high priority are visible (e.g., 'Client presentation', 'Fix critical bug', 'Complete project proposal', 'Prepare budget report')

4. Tap the 'high' chip again to deselect
   - expect: All cards are visible again
   - expect: The chip returns to its inactive visual state

#### 1.6. AI Assistant chat panel adapts to mobile

**File:** `tests/mobile/ai-assistant-mobile.spec.ts`

**Steps:**

1. Tap the 'AI Assistant' nav icon from /board on mobile viewport
   - expect: The /assistant route loads and shows the chat panel
   - expect: Chat content area uses reduced horizontal padding (~16px) appropriate for mobile
   - expect: Message bubbles never exceed the viewport width and wrap text correctly

2. Tap the message input field and type 'Hello from mobile'
   - expect: The input is focusable and accepts typing
   - expect: The input area remains visible at the bottom of the screen

3. Submit the message (tap Send or press Enter)
   - expect: The user message 'Hello from mobile' appears as a chat bubble aligned to the right
   - expect: An assistant response bubble is rendered (or a typing indicator) without overflowing the viewport

#### 1.7. Touch interactions and tap targets

**File:** `tests/mobile/touch-targets.spec.ts`

**Steps:**

1. On mobile viewport at /board, measure the bounding box of the floating 'Create new task' button, the navbar icon links, and a task card's 'more_vert' button
   - expect: Each interactive control has a touch target of at least 40×40 CSS pixels
   - expect: Controls are not overlapping; there is sufficient spacing between adjacent tap targets

2. Perform a tap (not a click) on the 'Create new task' button using touch emulation
   - expect: The task form dialog opens, confirming the button responds to touch events

3. Close the dialog and tap a task card body area (not the menu button)
   - expect: The card press either opens the detail/edit view or remains inert without selecting text, with no accidental triggering of the menu

#### 1.8. No horizontal overflow on any primary route

**File:** `tests/mobile/no-horizontal-overflow.spec.ts`

**Steps:**

1. On mobile viewport, navigate to /board and evaluate document.documentElement.scrollWidth vs window.innerWidth
   - expect: scrollWidth is less than or equal to innerWidth (no horizontal scrollbar appears)

2. Navigate to /assistant and repeat the measurement
   - expect: scrollWidth is less than or equal to innerWidth on the assistant page as well

3. Open the create-task dialog on mobile and measure the dialog's bounding box
   - expect: The dialog's right edge does not exceed window.innerWidth
   - expect: Form controls inside the dialog do not introduce horizontal scroll

#### 1.9. Breakpoint boundary behavior

**File:** `tests/mobile/breakpoint-boundaries.spec.ts`

**Steps:**

1. Set viewport to 640×900 (exactly at the navbar/app breakpoint) and load /board
   - expect: The mobile navbar styles apply: subtitle hidden, nav-link labels hidden, toolbar height ~60px

2. Set viewport to 641×900 and reload /board
   - expect: The desktop navbar styles apply: subtitle visible, nav-link text labels 'Board' and 'AI Assistant' visible alongside icons

3. Set viewport to 1024×800 and reload /board
   - expect: The board grid still renders as a single column (the board breakpoint at max-width:1024px is inclusive)

4. Set viewport to 1025×800 and reload /board
   - expect: The board grid renders as three side-by-side columns: 'To Do', 'In Progress', 'Done'
