# Template: Few-Shot Classifier

Use when the task is to assign an input to one of a fixed set of labels, and where the boundary between categories is ambiguous enough that examples clarify better than definitions alone.

**Typical tasks**: intent classification, content moderation tiers, ticket routing, sentiment labeling, topic categorization, policy compliance classification

---

## When to Use This Template

Few-shot classification is warranted when:

- The label set has overlapping or ambiguous categories (two labels that could plausibly apply to the same input)
- The correct classification depends on subtle cues that are harder to define in rules than to demonstrate in examples
- You need consistent behavior on boundary cases across thousands of calls
- The label set is fixed and known at prompt-write time (not dynamic)

Do not use this template when:

- The label set changes frequently — few-shot examples become stale and misleading
- You have more than 15 labels — large label sets need a different architecture (hierarchical classification or embedding-based routing)
- The task requires the model to reason about the classification, not just pattern-match (use chain-of-thought template)

---

## Template

```
You are a [domain] classifier. Your job is to assign each input to exactly one 
of the following categories.

## Categories

[CATEGORY_A]: [Definition in one sentence. Specific, not vague.]
[CATEGORY_B]: [Definition in one sentence.]
[CATEGORY_C]: [Definition in one sentence.]
[OTHER]: Use when no other category clearly applies. Do not use as a default 
when you are uncertain — uncertainty between defined categories should resolve 
to the most likely category.

## Classification Rules

ALWAYS: Assign exactly one category. If two categories seem applicable, 
assign the one that better describes the primary intent of the input.
ALWAYS: Return the category label in ALL_CAPS exactly as listed above.
NEVER: Return a category not in the list above.
NEVER: Return a sentence or explanation — return only the label.

IF the input is empty or contains no classifiable content: return [OTHER] 
(or define a specific handling here).

## Examples

[CATEGORY_A]
Input: [example input that clearly belongs to Category A]
---
Input: [another Category A example — different surface form, same category]
---

[CATEGORY_B]
Input: [example input that clearly belongs to Category B]
---
Input: [example at the Category A / Category B boundary, classified as B]
Note: This is B because [brief rationale for the boundary case].
---

[CATEGORY_C]
Input: [example input that clearly belongs to Category C]
---

[OTHER]
Input: [example of an input that does not fit any defined category]
---

Now classify the following:

Input: {{input}}
```

---

## Filling the Template

### Category Definition Quality

Category definitions must be mutually exclusive by design. Before writing examples, test your definitions against these questions:

1. Can you construct an input that fits two category definitions simultaneously? If yes, the definitions overlap — refine them.
2. Can you construct an input that fits no category definition? If yes, define your catch-all (`OTHER`) more explicitly or add the missing category.
3. Are the definitions testable? Every definition should have a clear "because" clause: `BILLING: Any message where the customer's primary concern is a financial charge, refund, or payment method.`

**Weak definition**:
```
COMPLAINT: When the customer is unhappy about something.
```

**Strong definition**:
```
COMPLAINT: The customer explicitly expresses dissatisfaction with a product, 
service, or experience they have already received. Requests for refunds are 
REFUND, not COMPLAINT, even if the customer is unhappy.
```

### Example Selection Strategy

The examples do most of the classification work. Poor example selection is the primary cause of few-shot classifier failures.

**Rule 1: Every category needs at least two examples.** One example establishes the category. A second example, with different surface characteristics, establishes the pattern.

**Rule 2: At least one example must be a boundary case.** Boundary cases — inputs that could plausibly belong to more than one category — are where classifiers fail. Annotate boundary case examples with a brief note explaining the decision.

**Rule 3: Include a negative example for the most commonly misclassified category.** If `BILLING` and `REFUND` are often confused, include an example that is `REFUND` and explicitly note why it is not `BILLING`.

**Rule 4: Examples must be representative of your actual input distribution.** If 80% of real inputs are informal short messages, examples written in formal English misrepresent the task.

**Rule 5: Example count vs. definition count.** As the number of categories increases, the number of examples required for reliable boundary coverage increases non-linearly. Target:

| Number of categories | Minimum examples | Recommended examples |
|---------------------|-----------------|---------------------|
| 2–4 | 6 | 10–12 |
| 5–7 | 10 | 14–20 |
| 8–12 | 16 | 24–36 |
| > 12 | Reconsider the architecture | — |

### Output Format Options

The basic template returns only the label. In many production systems, you need a confidence signal or rationale alongside the label. Two common patterns:

**Pattern A: Label only** (highest throughput, minimum token cost)
```
Classify with exactly one label from: [CATEGORY_A | CATEGORY_B | CATEGORY_C | OTHER]
Return the label only. Nothing else.
```

**Pattern B: Label + rationale** (useful for review queues, debugging)
```
Return valid JSON:
{
  "category": "[CATEGORY_A | CATEGORY_B | CATEGORY_C | OTHER]",
  "rationale": "[One sentence. Why this category? Reference a specific element of the input.]",
  "confidence": "[HIGH | MEDIUM | LOW]"
}
```

**Pattern C: Label + escalation flag** (useful for content moderation)
```
Return valid JSON:
{
  "category": "[label]",
  "escalate": [true | false],
  "escalation_reason": "[Required if escalate is true. Why this needs human review.]"
}
```

---

## Testing Few-Shot Classifiers

### Test Set Composition

Build a labeled test set of at least 100 examples before deploying. Composition targets:

- 60% examples from the expected real-world distribution per category
- 20% boundary cases (inputs that could belong to two categories)
- 10% out-of-domain inputs (inputs that should map to `OTHER`)
- 10% adversarial inputs (inputs crafted to confuse the classifier)

### Metrics to Track

- **Per-class precision and recall**: Aggregate accuracy hides category-level failures. A classifier that is 95% accurate overall but 60% recall on `SECURITY` category is not production-ready.
- **Confusion matrix**: Shows which categories are confused with each other. Use this to drive example selection improvements.
- **`OTHER` rate**: Track what percentage of real traffic is classified as `OTHER`. High `OTHER` rate indicates missing categories or definition drift.

### Iteration Protocol

When a category's precision or recall is below target:

1. Sample 20 misclassified examples for that category.
2. Identify whether the errors cluster around a specific misclassification pattern (which other category is it confused with?).
3. Add a boundary case example that resolves the most common confusion.
4. Re-evaluate — do not add more than 2 examples per iteration cycle, or you risk overfitting to the test set rather than improving general behavior.
