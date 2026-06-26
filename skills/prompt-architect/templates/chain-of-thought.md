# Template: Chain-of-Thought

Use when the task requires multi-step reasoning where intermediate conclusions affect the final answer. Do not use for tasks where the answer is a direct lookup, classification, or format transformation — CoT adds latency and token cost without quality benefit on those tasks.

**Typical tasks**: math problems, logical inference, diagnosis, complex decision trees, legal or policy interpretation, multi-condition eligibility checks

---

## When to Use This Template

Chain-of-thought is warranted when:

- The correct answer depends on intermediate conclusions (if A then B, and B implies C)
- The task has multiple valid solution paths and you need the model to select among them
- The failure mode without CoT is "plausible but wrong" rather than "clearly wrong"
- The model must handle exceptions or edge cases that depend on context established earlier in the reasoning

CoT is not warranted when:

- The task is classification into a fixed label set (use few-shot-classifier template)
- The task is data extraction from a structured source (the answer is present, not derived)
- The task is format transformation (tone rewriter, code formatter)

---

## Template

```
You are [role with domain specificity]. Your job is to [objective in one sentence].

## Process
Before giving your final answer, reason through the problem step by step inside 
<thinking> tags. Work through:

1. [First reasoning step — what to identify or establish first]
2. [Second reasoning step — what to evaluate or compute given step 1]
3. [Third reasoning step — what to verify or check for exceptions]
4. [Final reasoning step — how to arrive at the conclusion]

After </thinking>, produce only the output specified in the Format section below. 
Do not include reasoning in the output section.

## Constraints

ALWAYS: [Positive behavioral constraint]
ALWAYS: [Positive behavioral constraint]
NEVER: [Negative behavioral constraint]
NEVER: [Negative behavioral constraint]

IF [edge case condition]: [how to handle it]
IF [another edge case]: [how to handle it]

## Format

[Exact output specification. If JSON, include the full schema. If prose, specify 
length, structure, and register.]

## Input

[Input variable injection or instructions for where input appears]
{{input}}
```

---

## Filling the Template

### Step 1: Define the reasoning sequence

The four steps in the `<thinking>` scaffold should not be generic ("think about the problem"). Name the specific intellectual operations the model must perform in this task.

**Weak (generic)**:
```
1. Think about the problem.
2. Consider all factors.
3. Evaluate options.
4. Arrive at the answer.
```

**Strong (specific)**:
```
1. Identify the claim being evaluated and the standard it must meet.
2. List all criteria the standard requires, in priority order.
3. Evaluate the claim against each criterion, one by one.
4. Determine the outcome and identify any criteria that were not fully satisfied.
```

### Step 2: Place CoT before the output contract

The `<thinking>` instruction must come before the format specification. The model reads top-to-bottom; if it sees the output format first, it begins producing output before reasoning.

### Step 3: Isolate thinking from output

The `<thinking>` tag marks content that is not shown to end users (in most architectures). State this explicitly in the prompt if the application strips the thinking section:

```
Your <thinking> section will be logged but not shown to the end user.
After </thinking>, produce only the output the user sees.
```

### Step 4: Size the reasoning steps to the task

Simple reasoning tasks need 3–4 steps. Complex tasks may need 6–7 explicit steps. Do not add steps for the sake of completeness — each step should represent a decision or inference the model would otherwise skip.

---

## Reasoning Quality Signals

After testing, look for these indicators that the CoT scaffold is working:

**Good signal**: The model discovers an edge case in `<thinking>` and adjusts its final output accordingly.

**Good signal**: The intermediate reasoning steps produce different conclusions at different points, showing genuine inference rather than post-hoc justification.

**Bad signal**: The thinking section is a restatement of the input with "therefore [conclusion]" appended. This means the reasoning steps are too vague — specify them more precisely.

**Bad signal**: The final output contradicts the conclusion in `<thinking>`. This indicates an instruction conflict between the reasoning scaffold and the output constraints. Resolve by making the reasoning scaffold the explicit authority: "Your final output must be consistent with the conclusion reached in your thinking section."

---

## Performance Notes

- CoT adds 1.5–3× more tokens to the generation compared to a direct-answer prompt. Budget for this in your token cost model.
- For batch processing, consider whether the thinking section needs to be stored. If not, implement streaming parsing to discard `<thinking>` content before storage.
- At temperature 0, CoT improves consistency on reasoning tasks by ~15–25% compared to direct answer prompts on benchmark data. The improvement is larger on tasks with multiple exception conditions.
