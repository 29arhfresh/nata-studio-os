# Template: Basic Prompt

Use for simple, single-turn instructions where you want a direct response with minimal ceremony.

---

## Template

```
[TASK INSTRUCTION — one clear sentence describing what you want]

[CONTEXT — 1–3 sentences of background the model needs, if any]

[FORMAT — how the output should look]

[CONSTRAINTS — what to avoid or limit, if any]

[INPUT — the actual data or question, if separate from the instruction]
```

---

## Filled Example

```
Summarize the following meeting notes in 5 bullet points.

The meeting was a weekly product sync. Focus on decisions made and action items assigned — skip discussion threads.

Format: bullet list, each point max 20 words.
Tone: neutral, factual.
Do not include speaker names.

Meeting notes:
[paste notes here]
```

---

## Minimal Version (when context is obvious)

```
[TASK]. Format: [FORMAT]. Max length: [LENGTH].

[INPUT]
```

Example:
```
Translate the following sentence into French. Use informal register.

"Can you help me find the nearest train station?"
```

---

## Checklist

- [ ] Task is one action (not "do X and also Y")
- [ ] Format is specified
- [ ] Length or scope is bounded
- [ ] Input is clearly separated from instructions
