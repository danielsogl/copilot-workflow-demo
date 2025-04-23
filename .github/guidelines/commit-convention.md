# Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Format

```
<type>[(optional scope)](!): <description>
```

## Types

- **feat**: A new feature (correlates with MINOR in SemVer)
- **fix**: A bug fix (correlates with PATCH in SemVer)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify source or test files

## Breaking Changes

Add '!' after the type/scope to indicate a breaking change (correlates with MAJOR in SemVer).

For breaking changes, include a BREAKING CHANGE: footer with a description of the breaking change.

## Guidelines

- The scope should be a noun describing a section of the codebase
- The description should be in present tense, lowercase, and without a period at the end

## Examples

- Regular commit: `feat(auth): add login functionality`
- Breaking change: `feat(api)!: change authentication endpoints`
  ```
  BREAKING CHANGE: The authentication endpoints now require a different payload structure
  ```
