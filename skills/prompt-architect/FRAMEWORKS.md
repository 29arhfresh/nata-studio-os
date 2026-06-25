# Prompt Architect — Frameworks

Reusable prompt engineering frameworks with descriptions, structure, and when to use each.

---

## 1. RISEN

**R**ole · **I**nput · **S**teps · **E**xpectation · **N**arrowing

Best for: structured tasks with a clear deliverable.

```
Role:        You are a [role] with expertise in [domain].
Input:       Here is [the material / data / context]: [...]
Steps:       Follow these steps:
             1. [Step one]
             2. [Step two]
             3. [Step three]
Expectation: The output should [describe quality, format, length].
Narrowing:   Do not [constraint]. Focus only on [scope].
```

---

## 2. COSTAR

**C**ontext · **O**bjective · **S**tyle · **T**one · **A**udience · **R**esponse

Best for: content creation, communications, marketing copy.

```
Context:   [Background information the model needs]
Objective: [What you want the model to produce]
Style:     [Writing style — formal, casual, technical, narrative]
Tone:      [Emotional tone — optimistic, neutral, urgent, empathetic]
Audience:  [Who will read the output]
Response:  [Format and length of the expected response]
```

---

## 3. Chain-of-Thought (CoT)

Best for: reasoning, math, logic, step-by-step problem solving.

**Standard CoT** — append to any prompt:
```
Think through this step by step before giving your final answer.
```

**Zero-shot CoT**:
```
Let's think step by step.
```

**Few-shot CoT** — provide examples that show reasoning:
```
Q: [Question]
A: Let me work through this.
   First, [reasoning step 1].
   Then, [reasoning step 2].
   Therefore, [conclusion].

Q: [New question]
A:
```

---

## 4. ReAct (Reason + Act)

Best for: agents, tool-use, multi-step tasks that require external information.

```
You have access to the following tools: [list tools].

To answer a question, use this loop:
Thought: [reason about what to do next]
Action: [tool name]
Input: [tool input]
Observation: [tool output]
... (repeat as needed)
Final Answer: [your answer]
```

---

## 5. Plan-then-Execute

Best for: complex tasks that benefit from upfront decomposition.

```
Before beginning, create a plan:
1. List the sub-tasks required to complete this goal.
2. Identify any dependencies between sub-tasks.
3. Execute each sub-task in order.
4. Synthesize the results into a final output.

Goal: [describe the goal]
```

---

## 6. Persona + Constraint

Best for: creative writing, character-consistent outputs, role-play.

```
You are [character/persona]. You [key trait]. You never [constraint].
When responding, always [behavioral rule].

[Task or question]
```

---

## 7. Rubric-Based Evaluation

Best for: review, critique, grading, comparison tasks.

```
Evaluate the following [content] using this rubric:

| Criterion     | Weight | Description                         |
|---------------|--------|-------------------------------------|
| [Criterion 1] | [X%]   | [What good looks like]              |
| [Criterion 2] | [X%]   | [What good looks like]              |
| [Criterion 3] | [X%]   | [What good looks like]              |

For each criterion:
- Assign a score (1–5)
- Provide a one-sentence justification

End with an overall score and the single most important improvement.

Content to evaluate:
[content]
```

---

## 8. Few-Shot Learning

Best for: format-sensitive outputs, classification, extraction.

```
[Task instruction]

Examples:

Input: [example input 1]
Output: [example output 1]

Input: [example input 2]
Output: [example output 2]

Input: [actual input]
Output:
```

---

## Choosing a Framework

```
Is the task creative?                → Persona + Constraint
Does it require external tools?      → ReAct
Is it a multi-step complex task?     → Plan-then-Execute
Does format matter a lot?            → Few-Shot Learning
Is it reasoning or math?             → Chain-of-Thought
Is it a structured deliverable?      → RISEN
Is it content for an audience?       → COSTAR
Is it evaluating something?          → Rubric-Based
```
