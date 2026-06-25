# Prompt Architect — Workflow

A repeatable process for building prompts from scratch.

---

## Phase 1: Define the Goal

Before writing a single word, answer these questions:

- **What is the desired output?** (text, code, image, structured data, etc.)
- **Who is the audience for the output?** (end user, developer, internal team)
- **What does success look like?** (specific, measurable if possible)
- **What are the hard constraints?** (length, format, tone, things to avoid)
- **Which model will run this prompt?**

Write your answers down. They become the blueprint.

---

## Phase 2: Choose a Framework

Select a prompt engineering framework that fits the complexity of your task.

| Task Type | Recommended Framework |
|-----------|----------------------|
| Simple instruction | Direct instruction |
| Role-based task | RISEN or COSTAR |
| Complex reasoning | Chain-of-Thought (CoT) |
| Multi-step workflow | ReAct or Plan-then-Execute |
| Creative generation | Constraint + Example |
| Evaluation / critique | Rubric-based |

See `FRAMEWORKS.md` for full descriptions.

---

## Phase 3: Draft the Prompt

Write a first draft using your chosen framework. Do not self-censor — get something on the page.

Structure to follow:

```
[Role / Persona]          ← Who the model should be
[Context / Background]    ← What the model needs to know
[Task / Instruction]      ← What you want done
[Format / Constraints]    ← How the output should look
[Examples (optional)]     ← What good looks like
[Evaluation hint]         ← How the model should check its own work
```

---

## Phase 4: Stress-Test It

Read the draft as if you have no prior knowledge of the task.

- Could someone misunderstand any sentence?
- Is any term ambiguous (e.g., "short" could mean 50 or 500 words)?
- Are there implicit assumptions that the model won't share?
- Is the desired format actually described, or just implied?

---

## Phase 5: Add Examples

If the output format or quality bar is non-obvious, add at least one example.

- **One example**: establishes the baseline
- **Two contrasting examples**: defines the acceptable range
- **Three examples**: establishes a pattern the model can extrapolate

Prefer real examples over made-up ones. Label them clearly: `Example Input:` / `Example Output:`.

---

## Phase 6: Run the Checklist

Go through `CHECKLIST.md` before finalizing. This catches the most common failure modes.

---

## Phase 7: Test and Iterate

Run the prompt. Evaluate the output against your Phase 1 success criteria.

| Output Quality | Action |
|---------------|--------|
| Completely wrong | Re-examine the task instruction and context |
| Right direction, wrong format | Refine the format/constraint section |
| Right format, wrong quality | Add examples or tighten constraints |
| Almost right | Make one targeted edit and re-test |
| Success | Lock the prompt and document what worked |

---

## Phase 8: Version and Document

When you have a working prompt:

1. Save it with a descriptive name
2. Record which model(s) it was tested on
3. Note any known edge cases or failure modes
4. Store in the appropriate template file for reuse
