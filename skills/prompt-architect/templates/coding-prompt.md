# Template: Coding Prompt

Use for code generation, debugging, code review, refactoring, test writing, and documentation.

---

## Template

```
## Task
[One sentence: what you want the code to do or what problem to solve]

## Language / Stack
Language: [language]
Framework: [framework or library, if relevant]
Version: [version, if it matters]
Runtime: [Node 20, Python 3.12, etc.]

## Context
[Relevant background: what system this fits into, constraints, existing patterns]
[Paste relevant existing code here if needed]

## Requirements
- [Functional requirement 1]
- [Functional requirement 2]
- [Non-functional requirement: performance, security, style guide]

## Constraints
- Do not use [library/pattern] — [reason]
- Must be compatible with [environment/version]
- Follow [coding style: PEP 8, Airbnb, Google, etc.]
- [Other hard constraints]

## Output Format
Provide:
1. The implementation (in a fenced code block with language tag)
2. A brief explanation of the key design decisions (3–5 sentences)
3. Any edge cases or known limitations

Do not provide:
- Boilerplate setup code unless asked
- Unrelated refactoring suggestions
- Explanations of basic language features
```

---

## Filled Example: Feature Implementation

```
## Task
Write a Python function that rate-limits API calls to a max of N requests per time window, 
using a sliding window algorithm.

## Language / Stack
Language: Python 3.11
No external dependencies — standard library only.

## Requirements
- Accept parameters: max_requests (int), window_seconds (float)
- Thread-safe
- Return True if request is allowed, False if rate limit exceeded
- O(N) memory at most

## Constraints
- Do not use time.sleep or threading.Timer
- Do not use a fixed window (bucket) algorithm — must be sliding window
- No global state — the rate limiter must be an object

## Output Format
1. The class implementation in a fenced Python code block
2. One usage example showing initialization and a call loop
3. Note any thread-safety caveats
```

---

## Filled Example: Debugging

```
## Task
Find and fix the bug in the function below. It should return the Nth Fibonacci number 
but returns incorrect results for inputs greater than 30.

## Language
Python 3.10

## Code
```python
def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

## Expected Behavior
fibonacci(0) → 0
fibonacci(1) → 1
fibonacci(10) → 55
fibonacci(30) → 832040

## Output Format
1. Identify the bug (one sentence)
2. Corrected code in a fenced block
3. Explain why the original was wrong
```

---

## Filled Example: Code Review

```
## Task
Review this TypeScript function for correctness, security, and readability.

## Language / Stack
TypeScript 5.x, Node.js 20, Express 4

## Code
[paste code here]

## Focus Areas
1. Input validation and sanitization (security priority)
2. Error handling completeness
3. TypeScript type safety

## Output Format
For each issue found:
- **Severity**: Critical / High / Medium / Low
- **Location**: line number or function name
- **Problem**: one sentence
- **Fix**: corrected code snippet

End with a summary: overall quality rating (1–5) and the single most important change.
Do not comment on style unless it causes bugs.
```

---

## Common Coding Task Patterns

### Generation
```
Write a [language] [function/class/module] that [does X].
Requirements: [list]
Do not: [list]
Provide the code in a fenced block with a brief explanation.
```

### Debugging
```
This [language] code should [expected behavior] but [actual behavior].
Identify the bug, explain why it occurs, and provide the corrected code.
[code block]
```

### Refactoring
```
Refactor the code below to [goal: improve readability / reduce complexity / follow [pattern]].
Do not change external behavior.
List each change made and why.
[code block]
```

### Test Generation
```
Write unit tests for the function below using [test framework].
Cover: happy path, edge cases ([list]), error cases ([list]).
Use [assertion style: assert, expect, should].
Do not mock [dependency] — use a real instance.
[code block]
```

### Documentation
```
Write [docstring / JSDoc / OpenAPI spec] for the function below.
Audience: [developers new to the codebase / API consumers / etc.]
Include: parameters, return type, exceptions thrown, one usage example.
Do not repeat what the code already makes obvious.
[code block]
```

---

## Checklist

- [ ] Language and version specified
- [ ] Input/output described or demonstrated with examples
- [ ] Constraints on libraries, patterns, or style stated
- [ ] Existing code pasted if the task involves modifying it
- [ ] Output format specified (code block + explanation, or code only, etc.)
- [ ] Error handling requirements stated
- [ ] Performance or security requirements noted if relevant
