# Prompt Architect — Examples

Annotated real-world prompts across domains. Each example shows the prompt, explains the design decisions, and notes what makes it effective.

---

## Example 1: Summarization

### Prompt

```
You are a professional editor. Summarize the article below for a general audience.

Requirements:
- Length: exactly 3 sentences
- Tone: neutral and informative
- Do not include the author's opinion or editorial commentary
- Do not use jargon

Article:
<article>
{article_text}
</article>
```

### Why It Works

- **Role assignment** (`professional editor`) primes appropriate vocabulary
- **Delimited input** prevents injection and makes the structure scannable
- **Exact length** (`exactly 3 sentences`) removes ambiguity about "brief"
- **Negative constraints** (`do not include opinion`) filter common summarization errors
- **Audience** (`general audience`) sets the reading level implicitly

---

## Example 2: Code Review

### Prompt

```
You are a senior software engineer reviewing a pull request.

Review the code below for:
1. Correctness bugs (logic errors, off-by-one, null handling)
2. Security vulnerabilities (injection, exposed secrets, unsafe deserialization)
3. Performance issues (N+1 queries, unnecessary allocations)

For each issue found:
- Quote the problematic line(s)
- Explain the problem in one sentence
- Provide a corrected version

If no issues are found in a category, write "None found."

Language: Python
Code:
<code>
{code}
</code>
```

### Why It Works

- **Scoped categories** (correctness, security, performance) prevent generic feedback
- **Output structure** (quote → explain → fix) makes results actionable
- **Explicit null case** (`"None found"`) prevents the model from inventing issues
- **Language specified** reduces ambiguity for polyglot models

---

## Example 3: Image Generation

### Prompt

```
Cinematic photograph of a woman in her 40s sitting at a wooden desk in a sunlit home office. 
She is reading a leather-bound book. Warm afternoon light through sheer curtains. 
Shallow depth of field. Bokeh background. Shot on 85mm lens. Film grain. 
Color palette: amber, cream, warm brown.
Style: documentary photography, natural light. No text. No watermark.
```

### Why It Works

- **Subject first** — most image models weight early tokens heavily
- **Light direction is explicit** (`warm afternoon light through sheer curtains`)
- **Technical camera language** (`85mm lens`, `shallow depth of field`) activates photorealistic style
- **Color palette named** prevents color drift
- **Exclusions at the end** (`No text. No watermark.`) are common needs

---

## Example 4: Research & Analysis

### Prompt

```
You are a research analyst. Analyze the competitive landscape for [industry] using the framework below.

Framework:
1. Market size and growth rate (cite sources if known)
2. Top 3–5 players and their primary differentiators
3. Key trends shaping the next 18 months
4. Biggest threats to incumbents
5. Whitespace opportunities for new entrants

Format each section as:
## [Section Title]
[2–4 sentences or a short bullet list]

Be specific. If you are uncertain about a fact, say "unconfirmed" rather than stating it as fact.
Use present tense throughout.
```

### Why It Works

- **Named framework** structures output predictably
- **Explicit format** (## heading + 2–4 sentences) makes scanning easy
- **Uncertainty handling** (`"unconfirmed"`) reduces hallucination risk
- **Tense instruction** (`present tense`) prevents temporal inconsistency

---

## Example 5: Creative Writing

### Prompt

```
Write the opening paragraph of a noir detective novel set in a near-future city where memories can be bought and sold.

Constraints:
- First person, past tense
- 80–120 words
- One concrete sensory detail per sentence
- End on a moment of unease, not resolution
- No clichés (no "rain-slicked streets," no "dames," no "the city never sleeps")

Tone: cynical, world-weary, precise.
```

### Why It Works

- **Genre + setting** gives the model a rich starting context
- **Craft constraints** (`one concrete sensory detail per sentence`) teach the technique, not just the style
- **Explicit cliché prohibition** avoids the most predictable outputs
- **End state defined** (`moment of unease, not resolution`) controls narrative arc

---

## Example 6: Data Extraction

### Prompt

```
Extract structured data from the text below. Return valid JSON only — no explanation, no markdown.

Schema:
{
  "company_name": "string",
  "founding_year": "integer or null",
  "headquarters": "string or null",
  "products": ["array of strings"],
  "ceo": "string or null"
}

If a field is not mentioned in the text, use null (for strings) or [] (for arrays).

Text:
<text>
{input_text}
</text>
```

### Why It Works

- **Schema provided** eliminates format guessing
- **Return type specified** (`valid JSON only — no explanation, no markdown`) prevents prose wrapping
- **Null handling defined** per field type prevents inconsistent absent-value representations
- **Delimited input** prevents the extraction prompt from leaking into the data

---

## Before / After: Improving a Weak Prompt

### Before (weak)

```
Write a good email about the product update.
```

Problems: undefined audience, undefined tone, no product context, no format, "good" is unmeasurable.

### After (strong)

```
Write a customer announcement email for a SaaS product update.

Context: We are releasing version 3.0 of TaskFlow, a project management tool. Key changes: redesigned UI, 2x faster loading, new Slack integration.

Audience: Existing paying customers, mixed technical levels.
Tone: Warm, confident, briefly excited — not salesy.
Format:
- Subject line (max 60 characters)
- Body (150–200 words)
- One clear call-to-action (link to release notes)

Do not mention pricing. Do not use exclamation marks.
```

The improved version specifies the product, audience, tone, format, length, CTA requirement, and two explicit exclusions.
