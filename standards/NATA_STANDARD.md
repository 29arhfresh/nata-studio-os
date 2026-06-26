# NATA Studio OS — Universal Skill Standard

**Version:** 1.0.0
**Status:** Active
**Effective Date:** 2026-06-26

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Required Files](#2-required-files)
3. [Documentation Rules](#3-documentation-rules)
4. [Writing Standards](#4-writing-standards)
5. [Quality Requirements](#5-quality-requirements)
6. [Review Checklist](#6-review-checklist)
7. [Commit Rules](#7-commit-rules)
8. [Pull Request Rules](#8-pull-request-rules)
9. [Versioning](#9-versioning)
10. [Future Compatibility](#10-future-compatibility)

---

## 1. Folder Structure

Nata Studio OS supports two Skill types. The required layout depends on the `type` declared in `skill.json`.

**TypeScript Skill** (`"type": "typescript"`)

```
skills/
└── <skill-name>/
    ├── SKILL.md
    ├── skill.json
    ├── src/
    │   └── index.ts          # Primary entry point
    ├── tests/
    │   └── <skill-name>.test.ts
    └── assets/               # Optional — icons, images, static files
        └── icon.svg
```

**AI-native Skill** (`"type": "ai-native"`)

```
skills/
└── <skill-name>/
    ├── SKILL.md
    ├── skill.json
    ├── SYSTEM_PROMPT.md      # Primary entry point — loaded as the AI session instruction
    ├── WORKFLOW.md
    ├── CHECKLIST.md
    ├── EXAMPLES.md
    └── templates/            # Structural prompt templates
        └── <template-name>.md
```

### Rules

- The `skills/` directory lives at the repository root.
- `<skill-name>` must be lowercase, hyphen-separated (kebab-case). No underscores, no spaces.
- `src/` holds all runtime logic for TypeScript Skills. Sub-folders are permitted for complex Skills.
- `tests/` is mandatory for TypeScript Skills even when the Skill has no side effects.
- AI-native Skills are executed by an AI model. `SYSTEM_PROMPT.md` is the required entrypoint.
- `assets/` is optional. When included, only version-controlled, production-ready assets belong there.
- No build artifacts (`dist/`, `out/`, `.cache/`) may be committed.

---

## 2. Required Files

### 2.1 `SKILL.md`

Human-readable documentation. See [Section 3](#3-documentation-rules) for content rules.

### 2.2 `skill.json`

Machine-readable manifest. Must be valid JSON matching the schema below.

```json
{
  "name": "string",
  "version": "semver",
  "description": "string",
  "author": "string",
  "tags": ["string"],
  "type": "typescript",
  "entrypoint": "src/index.ts",
  "permissions": [],
  "dependencies": {}
}
```

| Field          | Type                            | Required | Description                                                          |
|----------------|---------------------------------|----------|----------------------------------------------------------------------|
| `name`         | `string`                        | Yes      | Matches the folder name exactly                                      |
| `version`      | `semver string`                 | Yes      | Follows rules in [Section 9](#9-versioning)                          |
| `description`  | `string`                        | Yes      | One sentence, ≤ 120 characters                                       |
| `author`       | `string`                        | Yes      | Full name or GitHub handle                                           |
| `tags`         | `string[]`                      | Yes      | At least one tag; all lowercase                                      |
| `type`         | `"typescript" \| "ai-native"`   | Yes      | Execution model. Determines required folder layout (see Section 1)   |
| `entrypoint`   | `string`                        | Yes      | `"src/index.ts"` for TypeScript Skills; `"SYSTEM_PROMPT.md"` for AI-native |
| `permissions`  | `string[]`                      | Yes      | Empty array if none required                                         |
| `dependencies` | `object`                        | Yes      | Empty object if none                                                 |

### 2.3 `src/index.ts` — TypeScript Skills only

The primary entry point. Must export a default function or class that represents the Skill's public interface. Not required for AI-native Skills.

### 2.4 `tests/<skill-name>.test.ts` — TypeScript Skills only

At least one test file covering the core behaviour of the Skill. See [Section 5](#5-quality-requirements) for coverage requirements. Not required for AI-native Skills.

---

## 3. Documentation Rules

### 3.1 `SKILL.md` Structure

Every `SKILL.md` must contain the following sections in this order:

```
# <Skill Name>

## Overview
## Usage
## Parameters
## Examples
## Errors
## Changelog
```

**Overview** — What the Skill does and why it exists. Maximum 5 sentences.

**Usage** — How to invoke or integrate the Skill. Include a minimal code example.

**Parameters** — A markdown table with columns: `Name`, `Type`, `Required`, `Default`, `Description`.

**Examples** — At least two complete, runnable examples (minimum case and a realistic real-world case).

**Errors** — All error codes or exception types the Skill can emit, with a one-line explanation and remediation hint for each.

**Changelog** — One entry per version, newest first. Format: `## [version] — YYYY-MM-DD` followed by bullet points.

### 3.2 Inline Code Documentation

- Public functions and classes must have a single-line JSDoc comment stating the purpose.
- Do not document what the code does if the name already explains it.
- Document the *why* only when a decision is non-obvious, constrained by an external system, or would surprise a reader.

---

## 4. Writing Standards

### 4.1 Language

- All documentation is written in English (American spelling).
- Sentences are concise. Maximum 25 words per sentence in technical descriptions.
- Active voice is preferred. Avoid passive constructions.

### 4.2 Naming Conventions

| Scope              | Convention         | Example                    |
|--------------------|--------------------|----------------------------|
| Folder name        | kebab-case         | `image-resizer`            |
| TypeScript files   | kebab-case         | `resize-image.ts`          |
| Exported functions | camelCase          | `resizeImage()`            |
| Exported classes   | PascalCase         | `ImageResizer`             |
| Constants          | SCREAMING_SNAKE    | `MAX_FILE_SIZE_MB`         |
| Types / interfaces | PascalCase         | `ResizeOptions`            |
| Test files         | `<name>.test.ts`   | `image-resizer.test.ts`    |

### 4.3 Code Style

- TypeScript strict mode enabled (`"strict": true`).
- No `any` type. Use `unknown` and narrow explicitly.
- All exported symbols must have explicit return types.
- Maximum function length: 40 lines. Extract helpers when exceeded.
- No magic numbers. Extract named constants.
- No commented-out code in committed files.

---

## 5. Quality Requirements

### 5.1 Test Coverage

- Minimum **80% line coverage** per Skill.
- Every public function must have at least one positive test and one negative test.
- Edge cases (empty input, boundary values, unexpected types) must each have a dedicated test.

### 5.2 Performance

- Skills must not block the main thread for longer than 100 ms for synchronous operations.
- Asynchronous operations must resolve or reject within a documented timeout; that timeout must be configurable.
- Memory allocations must not grow unboundedly in response to repeated calls.

### 5.3 Security

- No secrets, credentials, or personal data may be hardcoded.
- All external inputs must be validated before use.
- Dependency versions must be pinned to an exact version in `skill.json`.
- Known CVEs in dependencies block merging.

### 5.4 Accessibility and Internationalisation

- Any user-facing strings produced by a Skill must use externalisable keys; hardcoded English strings are not permitted in output.
- Date, time, and number formatting must use locale-aware APIs.

---

## 6. Review Checklist

A Pull Request may not be merged unless every item below is confirmed.

### Author Self-Review (before opening PR)

- [ ] Folder structure matches [Section 1](#1-folder-structure) exactly.
- [ ] All required files listed in [Section 2](#2-required-files) are present.
- [ ] `SKILL.md` contains all required sections in the correct order.
- [ ] `skill.json` is valid JSON and all fields are populated.
- [ ] No `any` types, no commented-out code, no hardcoded secrets.
- [ ] All public exports have explicit TypeScript types.
- [ ] Tests cover ≥ 80% of lines; positive and negative cases exist.
- [ ] No build artifacts committed.
- [ ] Changelog updated with the new version entry.
- [ ] Commit messages follow [Section 7](#7-commit-rules).

### Reviewer Checklist

- [ ] Logic is correct and the stated behaviour matches the implementation.
- [ ] No obvious security vulnerabilities (injection, unsafe parsing, exposed secrets).
- [ ] Error handling is explicit; no silent failures.
- [ ] Performance constraints from [Section 5.2](#52-performance) are not violated.
- [ ] Documentation is accurate and complete.
- [ ] Test cases are meaningful, not superficial.
- [ ] No unnecessary abstractions or features beyond scope.
- [ ] The Skill degrades gracefully when optional dependencies are absent.

---

## 7. Commit Rules

### 7.1 Format

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Type** must be one of:

| Type       | When to use                                         |
|------------|-----------------------------------------------------|
| `feat`     | New Skill or new capability added to a Skill        |
| `fix`      | Bug correction                                      |
| `docs`     | Documentation only                                  |
| `test`     | Adding or correcting tests                          |
| `refactor` | Code restructuring with no behaviour change         |
| `chore`    | Tooling, configuration, dependency updates          |
| `perf`     | Performance improvement                             |
| `ci`       | CI/CD pipeline changes                              |

**Scope** is the Skill folder name (e.g., `image-resizer`) or `standards` for this document.

**Subject** rules:
- Imperative mood: "add", "fix", "remove" — not "added" or "fixes".
- Maximum 72 characters.
- No period at the end.
- No Jira/issue numbers in the subject line (put them in the footer).

### 7.2 Body and Footer

- Body is optional but recommended for non-trivial changes. Explain the *why*, not the *what*.
- Footer must reference breaking changes: `BREAKING CHANGE: <description>`.
- Footer must reference related issues: `Closes #<issue-number>`.

### 7.3 Atomicity

- Each commit represents one logical change.
- Do not bundle unrelated changes in a single commit.
- Do not commit work-in-progress. Every commit on `main` must leave the repository in a working state.

---

## 8. Pull Request Rules

### 8.1 Naming

PR titles must follow the same Conventional Commits format as commit subjects:

```
<type>(<scope>): <subject>
```

### 8.2 Description Template

Every PR must include:

```markdown
## Summary
<!-- 1–3 bullet points describing what changed and why -->

## Test Plan
<!-- How reviewers can verify correctness -->

## Breaking Changes
<!-- List any, or write "None" -->

## Checklist
<!-- Copy and complete Section 6 author checklist -->
```

### 8.3 Size Limits

- A single PR should not exceed **400 lines changed** excluding generated files and test fixtures.
- If a change is inherently large, split it into a base PR (structural) and follow-up PRs (implementation).

### 8.4 Review Requirements

- Minimum **one approved review** from a maintainer before merging.
- All automated checks (lint, type-check, tests, coverage) must pass.
- No unresolved review comments.

### 8.5 Merge Strategy

- Merge method: **squash and merge** for feature and fix PRs.
- Merge method: **merge commit** for release PRs to preserve the merge history.
- Branch must be up to date with `main` before merging.
- Delete the source branch after merge.

### 8.6 Draft PRs

- Open as a **draft** while work is in progress.
- Convert to ready-for-review only when the author self-review checklist is complete.

---

## 9. Versioning

Nata Studio OS Skills follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Segment | Increment when                                                    |
|---------|-------------------------------------------------------------------|
| MAJOR   | A breaking change is introduced to the public interface           |
| MINOR   | New backward-compatible functionality is added                    |
| PATCH   | A backward-compatible bug fix is applied                          |

### 9.1 Initial Development

- New Skills start at `0.1.0`.
- The public interface may change between minor versions while `MAJOR = 0`.
- Promote to `1.0.0` only when the interface is considered stable.

### 9.2 Pre-release and Build Metadata

- Pre-release versions use the format `1.0.0-alpha.1`, `1.0.0-beta.2`, etc.
- Build metadata is not included in `skill.json`.

### 9.3 Changelog Requirements

- Every version bump requires a Changelog entry in `SKILL.md`.
- The entry must be added in the same commit that bumps the version in `skill.json`.

---

## 10. Future Compatibility

### 10.1 Public Interface Contract

- Once a Skill reaches `1.0.0`, its exported function signatures and parameter shapes are considered the public interface.
- Any change that would break a caller must increment MAJOR and be documented as a `BREAKING CHANGE`.

### 10.2 Deprecation Policy

- A symbol or behaviour must be marked `@deprecated` for a minimum of **one MINOR version** before removal.
- Deprecated symbols must log a warning at runtime if invoked.
- The removal PR must reference the deprecation commit.

### 10.3 Dependency Management

- External dependencies must be justified in `SKILL.md` under an optional **Dependencies** section.
- Prefer zero-dependency implementations for small utility Skills.
- Peer dependencies must be declared explicitly in `skill.json` and must not be pinned to a patch version (use `^` range for peers only).

### 10.4 Environment Assumptions

- Skills must not assume a specific operating system, shell, or Node.js version beyond what is declared in the root `package.json` `engines` field.
- File path separators must use the platform-native API (`path.join`) rather than hardcoded slashes.
- Any environment variable a Skill reads must be documented in `SKILL.md` under a **Configuration** section.

### 10.5 Extensibility

- Skills must expose extension points (callbacks, plugins, or configuration objects) rather than hard-coding behaviour that a consumer might need to change.
- Internal implementation details must not be exported. Mark them with a leading underscore or keep them in non-exported modules.

---

## Appendix A — Quick Reference Card

```
New Skill checklist — TypeScript
──────────────────────────────────
 skills/<name>/
   ├── SKILL.md        ← All 6 sections present
   ├── skill.json      ← type: typescript, semver, all fields
   ├── src/index.ts    ← Default export, explicit types, no `any`
   └── tests/          ← ≥80% coverage, positive + negative cases

New Skill checklist — AI-native
─────────────────────────────────
 skills/<name>/
   ├── SKILL.md        ← All 6 sections present
   ├── skill.json      ← type: ai-native, entrypoint: SYSTEM_PROMPT.md
   ├── SYSTEM_PROMPT.md ← Agent persona and behavioural rules
   ├── WORKFLOW.md
   ├── CHECKLIST.md
   ├── EXAMPLES.md
   └── templates/      ← At least one structural template

Commit format
─────────────
  feat(skill-name): add initial implementation

PR requirements
───────────────
  Draft → self-review → ready → 1 approval → squash merge
```

---

*This document is the authoritative standard for all Skills in Nata Studio OS. Deviations require an explicit amendment to this file, approved through the standard PR process.*
