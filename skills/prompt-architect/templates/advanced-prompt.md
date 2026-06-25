# Template: Advanced Prompt

Use for multi-step tasks, agentic workflows, role-based interactions, or outputs that require chain-of-thought reasoning.

---

## Template

```
## Role
You are [role/persona] with expertise in [domain]. You [key characteristic]. You never [anti-behavior].

## Context
[Background information the model must know to complete the task correctly.
Be specific. Remove anything not directly relevant.]

## Task
[Primary task — what you want produced]

Sub-tasks (complete in order):
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Reasoning
Before producing the final output, think through:
- [Question 1 the model should consider]
- [Question 2 the model should consider]

Write your reasoning in a <thinking> block before the final answer.

## Output Format
[Exact format specification — headers, sections, JSON schema, table structure, etc.]

## Constraints
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

## Input
[Input data, delimited clearly]
<input>
[data]
</input>
```

---

## Filled Example

```
## Role
You are a technical writer with expertise in developer documentation. You write for engineers who are time-constrained and prefer precision over prose.

## Context
We are documenting a new REST API endpoint: POST /v1/users/invite. It accepts an email address and an optional role, creates a pending invitation, and sends an email to the invitee. Rate limit: 10 invitations per minute per org.

## Task
Write the API reference documentation for this endpoint.

Sub-tasks (complete in order):
1. Write the endpoint summary (1 sentence)
2. Document request parameters in a table
3. Document response codes and their meanings
4. Provide a cURL example request and a JSON example response

## Reasoning
Before writing, consider:
- What information does a developer need to use this endpoint without further questions?
- What error cases are most likely and should be documented?

Write your reasoning in a <thinking> block before the final answer.

## Output Format
Use standard API reference markdown:
- ## Endpoint
- ## Parameters (table: Name | Type | Required | Description)
- ## Response Codes (table: Code | Meaning)
- ## Examples (fenced code blocks)

## Constraints
- Do not mention internal implementation details
- Do not assume the reader has seen other endpoints
- Keep the summary under 20 words
- Use present tense
```

---

## Checklist

- [ ] Role gives the model the right domain context
- [ ] Sub-tasks are ordered and unambiguous
- [ ] Reasoning step is present for complex outputs
- [ ] Output format is exact, not implied
- [ ] Input data is inside delimiters
- [ ] Constraints are negative (what NOT to do), not vague ("be good")
