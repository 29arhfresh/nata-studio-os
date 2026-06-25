# Template: Research Prompt

Use for research synthesis, literature review, competitive analysis, fact-finding, summarization, and knowledge extraction.

---

## Template

```
## Role
You are a [domain expert / research analyst / subject matter expert] with expertise in [field].

## Research Question
[The central question or topic to investigate — be specific]

## Scope
- Time range: [e.g., last 5 years, 2010–2024, all time]
- Geography: [global, specific regions, or irrelevant]
- Depth: [overview, intermediate, deep-dive]
- Focus: [specific sub-topics to include]
- Exclude: [sub-topics or angles to skip]

## Output Structure
Organize your response using these sections:
1. [Section 1 — e.g., Background / Context]
2. [Section 2 — e.g., Key Findings]
3. [Section 3 — e.g., Competing Perspectives]
4. [Section 4 — e.g., Gaps / Open Questions]
5. [Section 5 — e.g., Recommendations / Implications]

## Format
- Use markdown headers for each section
- Length per section: [e.g., 100–200 words]
- Use bullet points for lists of 3+ items
- Cite sources inline as [Author, Year] when referencing specific claims
- If a fact is uncertain or contested, mark it: *(unconfirmed)*

## Constraints
- Do not speculate beyond what is supported by evidence
- Do not repeat points across sections
- Prioritize specificity over comprehensiveness — better to cover fewer topics well
- If a section has insufficient information, say so explicitly rather than padding
```

---

## Filled Example: Technology Research

```
## Role
You are a technology analyst specializing in enterprise software and AI adoption.

## Research Question
What are the primary barriers to enterprise adoption of large language models (LLMs) 
in regulated industries (finance, healthcare, legal) as of 2024–2025?

## Scope
- Time range: 2023–2025
- Geography: North America and Western Europe primarily
- Depth: Intermediate — decision-maker level, not academic
- Focus: compliance, data privacy, auditability, cost, and organizational change
- Exclude: technical model architecture details

## Output Structure
1. Overview (2–3 sentences framing the landscape)
2. Top 5 barriers (ranked by frequency of citation in industry literature)
3. How leading organizations are addressing each barrier
4. What remains unsolved
5. Outlook for the next 18 months

## Format
- Markdown headers
- 150–200 words per section
- Bullet lists for barriers and solutions
- Flag unverified claims with *(unconfirmed)*

## Constraints
- No generic AI hype — focus on concrete friction points
- If a barrier has no documented mitigation yet, say so
```

---

## Filled Example: Competitive Analysis

```
## Role
You are a market research analyst.

## Research Question
Compare Notion, Coda, and Obsidian as knowledge management tools for 
small software engineering teams (5–20 people).

## Scope
- Depth: Decision-making level — help a team choose one tool
- Focus: Collaboration features, developer integrations (GitHub, Jira), 
  pricing, offline access, API availability, and data portability
- Exclude: Consumer / personal use cases

## Output Structure
1. One-paragraph summary of each tool (3 paragraphs total)
2. Feature comparison table (rows: features, columns: tools)
   Columns: Notion | Coda | Obsidian
   Rows: Real-time collaboration, API, GitHub integration, 
         Offline mode, Data export, Pricing (team tier), 
         Best for
3. Recommendation with rationale (2–3 sentences)
4. Scenarios where a different tool would win

## Format
- Table in markdown
- Recommendation in bold
- Under 600 words total

## Constraints
- Use publicly available pricing (note if pricing may have changed)
- Do not recommend based on brand popularity alone
```

---

## Summarization Sub-Template

When the input is a document to be summarized:

```
Summarize the [document type] below.

Audience: [who will read this summary]
Purpose: [why they need it — to make a decision, to be briefed, to file, etc.]
Length: [word count or format: executive summary, 5 bullets, 1 paragraph]
Focus on: [key elements: decisions made, action items, risks, findings]
Omit: [what to skip: preamble, tangents, repetition]
Tone: [neutral, formal, conversational]

Document:
<document>
[paste content]
</document>
```

---

## Checklist

- [ ] Research question is specific and bounded
- [ ] Scope narrows time range, geography, and depth
- [ ] Output sections are named — no "summarize it" without structure
- [ ] Length per section is specified
- [ ] Uncertainty handling defined (flag unconfirmed claims, don't pad)
- [ ] Exclusions listed to prevent scope creep
- [ ] Format matches the audience (executive, technical, academic)
