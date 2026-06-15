---
name: Analyze Codebase For Bugs
description: "Run a structured bug-focused code review for selected files, folders, or the whole workspace"
argument-hint: "Target scope, feature, or file paths to analyze"
agent: "agent"
---
Analyze the codebase for real defects and regression risks.

Input:
- Treat the prompt argument as scope (for example: a feature folder, changed files, or a specific flow).
- If no scope is provided, analyze the most relevant production code paths in the workspace.

Primary objective:
- Find concrete bugs, broken behavior, risky assumptions, and missing tests.
- Prioritize findings by severity.
- Avoid style-only feedback unless it causes runtime, data, security, accessibility, or maintenance risk.

Required workflow:
1. Gather context with targeted code search and file reads.
2. Validate behavior assumptions from code, tests, and configuration.
3. Report findings first, ordered by severity.
4. For each finding include:
   - Severity: Critical, High, Medium, or Low
   - Location: exact file path and line link
   - Impact: what breaks and when
   - Evidence: code-level reason
   - Fix suggestion: minimal, safe change
   - Test gap: what test should exist or be updated
5. After findings, include:
   - Open questions and assumptions
   - Brief change summary only if no critical blockers exist

Output format:
- Start with section: Findings
- If there are no findings, state explicitly: No functional bugs found.
- Then list residual risks and test coverage gaps.
- Keep the response concise, specific, and actionable.

Quality bar:
- Do not invent issues without evidence.
- Do not request broad refactors unless directly needed to fix a defect.
- Prefer deterministic reproduction hints when possible.
