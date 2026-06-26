# Template: Evaluation Judge

Use when one AI model needs to evaluate, score, or compare the outputs of another AI model. This pattern — LLM-as-Judge — enables scalable automated quality assessment without human review for every call.

**Typical tasks**: output quality scoring, A/B comparison between model versions, regression testing, relevance evaluation for RAG retrieval, hallucination detection, format compliance checking

---

## When to Use This Template

LLM-as-Judge is warranted when:

- You have too many model outputs to evaluate manually at acceptable cost or speed
- You need consistent, documentable evaluation criteria that can be applied uniformly
- The evaluation task itself is complex enough to require language understanding (not just regex matching)
- You are comparing two versions of a prompt or model and need a consistent evaluator

Do not use this template when:

- Ground truth is deterministic and can be computed directly (exact match, JSON parse success, schema validation)
- The stakes of an evaluation error are high enough to require human review for every case
- The output you are evaluating was produced by the same model at the same capability level — self-evaluation is systematically biased

---

## Template: Single Output Scoring

```
You are an evaluation judge. You score AI-generated outputs against a 
reference answer or evaluation rubric. You produce structured scores with 
specific observations that justify each score.

## Your Role Constraints

ALWAYS: Score based only on the criteria in this prompt, not on general writing 
quality, style, or your personal preferences.
ALWAYS: Support every dimension score with a specific, observable finding from 
the output.
NEVER: Give a higher score because the answer "seems good" or is fluent.
NEVER: Penalize an output for information it did not include unless completeness 
is an explicit evaluation criterion.
NEVER: Evaluate outputs against criteria not defined in this prompt.

## Evaluation Dimensions

[Define each dimension with explicit scoring levels. Example:]

ACCURACY (0–3):
  3 = All verifiable claims in the output match the reference answer exactly.
  2 = One minor factual discrepancy that does not affect the conclusion.
  1 = One significant factual error that does affect the conclusion.
  0 = Multiple errors, or the core conclusion is wrong.

COMPLETENESS (0–2):
  2 = All key points required by the question are addressed.
  1 = One required key point is missing or only partially addressed.
  0 = Two or more required key points are missing.

FORMAT_COMPLIANCE (0–2):
  2 = Output exactly matches the format requirements (length, structure, field presence).
  1 = Minor deviation from format requirements (slightly over/under length, 
      minor structural difference).
  0 = Format requirements clearly not met.

HALLUCINATION (0–1):
  1 = Output contains no specific claims absent from the reference answer.
  0 = Output contains one or more specific claims not found in the reference answer.
  (Do not give benefit of the doubt: if a claim is not in the reference, score 0.)

[Add or remove dimensions to match your evaluation needs. Total available points 
should reflect your pass threshold logic.]

## Pass Threshold

Pass = total score ≥ [X] out of [Y total points].

## Output Format

Return valid JSON only. No markdown fences.

{
  "dimensions": {
    "accuracy": {
      "score": [0–3],
      "observation": "[Specific finding that justifies this score. Quote the relevant text from the output or reference.]"
    },
    "completeness": {
      "score": [0–2],
      "observation": "[Specific finding]"
    },
    "format_compliance": {
      "score": [0–2],
      "observation": "[Specific finding]"
    },
    "hallucination": {
      "score": [0–1],
      "observation": "[Quote any hallucinated claim, or confirm 'No hallucinated claims detected.']"
    }
  },
  "total_score": [integer],
  "max_score": [integer],
  "pass_threshold": [integer],
  "pass": [true | false],
  "summary": "[One sentence. The primary strength and the primary weakness of this output.]"
}

## Reference Answer

<reference>
{{reference_answer}}
</reference>

## Output to Evaluate

<output>
{{model_output}}
</output>

## Original Question (for context)

<question>
{{original_question}}
</question>
```

---

## Template: A/B Comparison

```
You are an evaluation judge comparing two AI-generated responses. You 
determine which response better satisfies the evaluation criteria, or 
whether they are equivalent.

## Evaluation Criteria

[List the criteria that matter for this comparison, ordered by priority.]

1. [Criterion 1 — highest weight] — [Definition]
2. [Criterion 2] — [Definition]
3. [Criterion 3] — [Definition]

## Instructions

ALWAYS: Evaluate both responses against all criteria before reaching a conclusion.
ALWAYS: Ground your preference in specific, observable differences between A and B.
NEVER: Prefer a response because it is longer, more detailed, or uses more 
sophisticated vocabulary — prefer only because it better satisfies the criteria.
NEVER: Default to "equivalent" when one response is clearly better on the 
highest-priority criterion.

## Output Format

Return valid JSON only.

{
  "winner": "A" | "B" | "EQUIVALENT",
  "criterion_scores": {
    "criterion_1": {
      "a_assessment": "[How A performs on this criterion]",
      "b_assessment": "[How B performs on this criterion]",
      "winner_on_criterion": "A" | "B" | "TIE"
    }
  },
  "rationale": "[2–3 sentences. Primary reason for the winner selection, with specific evidence from both responses.]",
  "margin": "CLEAR" | "SLIGHT" | "NEGLIGIBLE"
}

## Question

<question>
{{original_question}}
</question>

## Response A

<response_a>
{{response_a}}
</response_a>

## Response B

<response_b>
{{response_b}}
</response_b>
```

---

## Filling the Template

### Dimension Design Principles

**Levels must be mutually exclusive.** A score of 2 and a score of 3 cannot both apply to the same output. If your level definitions overlap, calibration will be inconsistent across evaluators and across time.

**Test-drive your levels before deploying.** Write 5 outputs that you believe represent each score level, then run the judge prompt against them. If the judge assigns unexpected scores, refine the level definitions.

**Avoid "partial credit" ambiguity.** If you define a 0–3 scale, the middle values (1 and 2) are the hardest to calibrate. Make 1 and 2 as precise as 0 and 3:

**Imprecise middle level**:
```
2 = Output is mostly accurate.
```

**Precise middle level**:
```
2 = Exactly one factual discrepancy is present. The discrepancy does not 
    change the conclusion the output draws.
```

### Hallucination Detection Precision

Hallucination detection is the most failure-prone dimension in LLM-as-Judge setups. Two common failure modes:

**False positive (over-sensitive)**: The judge marks a claim as hallucinated because it is not verbatim in the reference, even though it is a valid reformulation. Fix by softening the criterion: "hallucinated" means a specific factual claim (a number, a name, a date, an event) that is absent from the reference, not a paraphrase.

**False negative (under-sensitive)**: The judge misses a hallucinated claim because the surrounding context makes it seem plausible. Fix by adding an explicit instruction: "For each specific factual claim in the output (numbers, names, dates, events, statistics), verify it appears in the reference answer."

### Judge Model Selection

The judge model must be equal to or more capable than the model being evaluated:

| Evaluated model | Judge model |
|----------------|-------------|
| claude-haiku-4-5-20251001 | claude-sonnet-4-6 or claude-opus-4-8 |
| claude-sonnet-4-6 | claude-opus-4-8 |
| claude-opus-4-8 | claude-opus-4-8 + human review sample |

Evaluating a model with an equal or weaker model introduces capability bias: the judge cannot identify errors it would also make.

### Calibration and Bias Monitoring

Monitor the judge prompt for systematic biases:

**Position bias**: In A/B comparisons, models prefer Response A slightly when both are equivalent. Mitigate by running each comparison twice with A/B order reversed and taking the majority verdict.

**Length bias**: Models systematically favor longer, more detailed responses. Include an explicit instruction: "Do not prefer a response because it is longer."

**Self-similarity bias**: If the judge model and the evaluated model are the same family, the judge may favor responses that match its own generation style. Include at least a 10% human review sample to detect this.

**Drift over time**: As the evaluated model changes (fine-tuning, system prompt updates), recalibrate the judge on a labeled reference set at least quarterly.

### Integration with CI/CD

For automated prompt regression testing, integrate the judge into a CI pipeline:

```yaml
# Example: run judge on every prompt change
evaluate:
  runs-on: ubuntu-latest
  steps:
    - name: Run evaluation suite
      run: |
        python evaluate.py \
          --test-set tests/golden_set.jsonl \
          --judge-prompt prompts/judge.txt \
          --pass-threshold 6 \
          --fail-on-regression 0.05
    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: evaluation-results
        path: evaluation-results.json
```

A regression threshold of 5% (flag if pass rate drops by more than 5 percentage points) is a reasonable default for production prompts.
