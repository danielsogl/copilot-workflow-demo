# TypeScript Guidelines

> **Note:** The use of barrel files (index.ts files for re-exporting) is strictly prohibited in this project. Do not create, reference, or use barrel files in any part of the codebase or documentation.

## 1. Core Principles

- **Strong Typing:**

  - Always use explicit types, interfaces, and generics.
  - Avoid `any` and implicit `any`.
  - Prefer `unknown` over `any` when necessary.
  - Use type inference where safe, but be explicit for public APIs.

  ```typescript
  // Good
  interface User {
    id: string;
    name: string;
  }

  function getUser(id: string): User {
    /* ... */
  }

  // Bad
  function getUser(id) {
    /* ... */
  } // Implicit any
  ```

- **Single Responsibility:**

  - Each file, class, or function should have a single, well-defined purpose.

- **Rule of One:**

  - Each file should define only one entity (component, service, model, etc.).

- **Consistent Naming:**
  - Use descriptive, consistent names that follow TypeScript and project conventions.
  - Types and interfaces: `PascalCase` (e.g., `UserProfile`)
  - Variables and functions: `camelCase` (e.g., `getUserProfile`)
  - Constants: `UPPER_CASE` (e.g., `MAX_RETRIES`)

## 2. Formatting

- **Tab width:** 2 spaces
- **Print width:** 80 characters
- **Semicolons:** Always use semicolons
- **Quotes:**
  - Single quotes for TypeScript
  - Double quotes for HTML
- **Trailing commas:** Where valid
- **Bracket spacing:** Spaces inside brackets
- **Arrow parens:** Always include parentheses
- **End of line:** LF

```typescript
// Good
const users: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const getUser = (id: string): User | undefined => {
  return users.find((u) => u.id === id);
};
```

## 3. Linting

- Code must pass all ESLint and Prettier checks
- Fix all lint errors before committing

## 4. File Size

- Limit files to 400 lines of code
- Split large files by responsibility

## 5. Error Handling

- Always handle errors in async code with try-catch
- Never swallow errors silently; log or propagate as appropriate

```typescript
async function fetchData(): Promise<Data> {
  try {
    const response = await api.get<Data>("/data");
    return response;
  } catch (error) {
    // Handle or rethrow
    throw new Error("Failed to fetch data");
  }
}
```

## 6. Testing

- Write unit tests for all logic using strong typing
- Use the AAA pattern (Arrange, Act, Assert)
- Tests should be descriptive and cover edge cases

```typescript
describe("getUser", () => {
  it("returns user by id", () => {
    // Arrange
    const users = [{ id: "1", name: "Alice" }];
    // Act
    const result = getUser("1");
    // Assert
    expect(result).toEqual({ id: "1", name: "Alice" });
  });
});
```

## 7. No Sensitive Data

- Never include sensitive data (API keys, secrets, credentials) in client-side code

> For Angular and NgRx-specific patterns, see their dedicated guidelines.

## 8. Code Comments and JSDoc

- Do not use code comments or JSDoc in TypeScript code.
- Code should be self-explanatory through clear naming, structure, and adherence to these guidelines.
- If documentation is required, use external markdown files or project-level documentation, not inline comments or JSDoc blocks.
