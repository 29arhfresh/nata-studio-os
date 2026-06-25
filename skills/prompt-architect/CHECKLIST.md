# Prompt Architect — Quality Checklist

Run through this checklist before finalizing any prompt. Each item targets a common failure mode.

---

## Clarity

- [ ] **Single clear task** — The prompt asks for one primary output, not several.
- [ ] **No ambiguous words** — Terms like "short," "detailed," "simple," "clean," and "good" are replaced with specific definitions.
- [ ] **Active voice** — Instructions are direct: "List the steps" not "Steps should be listed."
- [ ] **No double negatives** — Avoid "do not avoid" constructions.
- [ ] **A stranger could understand it** — Someone with no prior context can read the prompt and know exactly what to produce.

---

## Specificity

- [ ] **Format is defined** — The output format (list, table, JSON, paragraph, code block) is explicit.
- [ ] **Length is bounded** — A word count, sentence count, or item count is specified where relevant.
- [ ] **Tone is named** — Formal, casual, technical, empathetic, etc.
- [ ] **Audience is identified** — Who will read or use the output.
- [ ] **Model-specific needs are addressed** — Any known quirks of the target model are accounted for.

---

## Context

- [ ] **Essential background is included** — The model has the facts it needs to avoid wrong assumptions.
- [ ] **Irrelevant context is removed** — Nothing in the prompt distracts from the task.
- [ ] **Input data is clearly delimited** — User-provided content is wrapped in tags or quotes, separate from instructions.
- [ ] **Role/persona is assigned** — If domain expertise is needed, the model has been given that identity.

---

## Constraints

- [ ] **Negative constraints are explicit** — The prompt states what NOT to do, not just what to do.
- [ ] **Conflicting constraints are resolved** — If two constraints could conflict (brief but thorough), one takes priority.
- [ ] **Hard limits are stated** — Any non-negotiable requirements (must be in Python, must use metric units, etc.) are in the prompt.

---

## Examples

- [ ] **At least one example is provided** for format-sensitive or quality-sensitive outputs.
- [ ] **Examples are labeled** — "Example Input:" / "Example Output:" or similar.
- [ ] **Examples match the actual task** — They aren't so different from the real input that they mislead the model.

---

## Safety and Reliability

- [ ] **No prompt injection risk** — User-provided data is separated from instructions using delimiters.
- [ ] **Sensitive data is not in the prompt** — PII, credentials, or confidential content are not included unless necessary and handled safely.
- [ ] **Edge cases are handled** — The prompt specifies what to do if the input is empty, malformed, or out of scope.
- [ ] **Fallback behavior is defined** — If the model can't complete the task, it knows what to say.

---

## Iteration Readiness

- [ ] **The prompt is version-labeled** — You can track what changed between versions.
- [ ] **Test cases are defined** — You know what inputs you'll use to evaluate the prompt.
- [ ] **Success criteria are written down** — You know what a good output looks like before you test.

---

## Quick Scan (30-second version)

For fast reviews, check just these five:

1. Is the task unambiguous?
2. Is the format specified?
3. Is irrelevant context removed?
4. Are there negative constraints?
5. Is there at least one example (if format matters)?

If all five pass, the prompt is ready to test.
