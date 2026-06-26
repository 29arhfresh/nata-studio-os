# Template: Document Analysis

Use when the task requires reading, synthesizing, or extracting information from one or more documents that are injected into the context at runtime. The model's job is to reason over provided text, not generate from parametric knowledge.

**Typical tasks**: document summarization, contract review, research synthesis, report analysis, policy interpretation, knowledge base Q&A over uploaded content

---

## When to Use This Template

Document analysis is the right pattern when:

- The answer exists in the provided documents and must be grounded there
- The model must reason over content it has not seen during training (current documents, private documents)
- Multiple documents must be synthesized or compared
- The task requires attribution — tracing claims back to specific document passages

Do not use this template when:

- The task requires knowledge not present in the documents (use RAG or tool use)
- The documents are very long (> 100k tokens combined) — chunk and pipeline instead
- The model's parametric knowledge is sufficient and documents are used as optional context

---

## Template: Single Document

```
You are [role] with expertise in [domain]. Your job is to [objective] based 
only on the provided document.

## Grounding Rules

ALWAYS: Base every claim, answer, or extraction on content explicitly present 
in the document.
ALWAYS: If quoting from the document, use exact verbatim text. Do not paraphrase 
and present it as a quote.
NEVER: Draw on knowledge outside the provided document to supplement your answer.
NEVER: Speculate about what the document "implies" or "suggests" beyond what 
is explicitly stated.

IF the document does not contain information needed to answer the question: 
state "The document does not contain information about [topic]." 
Do not attempt to answer from general knowledge.

IF sections of the document appear to contradict each other: note the 
contradiction explicitly and present both claims with their source locations.

## Output Format

[Specify the output format. Options below:]

**Option A — Free prose response**:
Respond in [X] paragraphs. Each paragraph must correspond to a specific 
aspect of the question. End with a one-sentence summary.

**Option B — Structured JSON with citations**:
{
  "answer": "[Direct answer to the question in 2–4 sentences]",
  "citations": [
    {
      "claim": "[Specific claim from the answer]",
      "source_text": "[Verbatim quote from the document supporting this claim]",
      "location": "[Section name or paragraph reference if identifiable]"
    }
  ],
  "gaps": "[What the document does not address that would be needed for a complete answer, or null]"
}

**Option C — Extraction with schema**:
[Use the structured-output template for precise field extraction]

## Document

<document>
{{document_text}}
</document>

## Question

{{question}}
```

---

## Template: Multi-Document Synthesis

```
You are [role]. Your job is to synthesize [N] provided documents to answer 
a research question. Each document is labeled with an ID used for citation.

## Grounding Rules

ALWAYS: Every claim in your synthesis must cite at least one document by ID.
ALWAYS: When documents contradict each other, present all positions and their 
sources. Do not resolve contradictions by selecting one position.
NEVER: Introduce information not present in any of the provided documents.
NEVER: Weight documents by perceived authority. Treat each document's claims 
as equally valid until you identify explicit contradiction.

IF only one document addresses a topic and others are silent: note that the 
claim is based on a single source.
IF no document addresses a specific aspect of the question: state the gap 
explicitly rather than inferring from related content.

## Citation Format

In your response, cite documents as [DOC-1], [DOC-2], etc.
Example: "The contract was signed on June 15, 2026 [DOC-1], but the addendum 
references a June 20 signing date [DOC-3]."

## Output Format

{
  "synthesis": "[Flowing prose synthesis, 3–6 paragraphs, with inline citations]",
  "key_agreements": ["[Point where multiple documents align — cite all sources]"],
  "key_contradictions": [
    {
      "topic": "[What the contradiction is about]",
      "positions": [
        {"document": "DOC-X", "claim": "[What DOC-X says]"},
        {"document": "DOC-Y", "claim": "[What DOC-Y says]"}
      ]
    }
  ],
  "information_gaps": ["[Topic the question requires but no document addresses]"],
  "source_coverage": {
    "DOC-1": "[One sentence describing what DOC-1 contributed to the synthesis]",
    "DOC-2": "[One sentence describing what DOC-2 contributed]"
  }
}

## Documents

<documents>
<document id="DOC-1">
{{document_1}}
</document>

<document id="DOC-2">
{{document_2}}
</document>

[Add additional document tags as needed]
</documents>

## Research Question

{{research_question}}
```

---

## Filling the Template

### Document Injection Format

How documents are injected significantly affects analysis quality.

**Use XML tags with IDs**: Always wrap documents in named tags. Without tags, models treat the document text as a continuation of instructions, which causes instruction-following errors.

**Preserve document structure**: If the source document has headers, numbered sections, or tables, preserve them in the injected text. The model uses structural cues (section headers, numbered lists) to locate information efficiently.

**Include metadata when available**: Page numbers, section names, and document dates help the model produce more accurate citations and help downstream users locate the source.

```xml
<document id="DOC-1" title="Q3 2026 Financial Report" date="2026-09-30" pages="24">
[document text]
</document>
```

**Chunk long documents**: A single document over 50,000 tokens should be chunked before injection. Provide the most relevant chunks first. For Q&A tasks, use retrieval to identify and inject only the relevant sections rather than the full document.

### Grounding Strictness Calibration

The grounding constraint has two operating modes:

**Strict grounding** (default for legal, financial, compliance tasks): The model answers only from what is explicitly stated. If the document does not say it, the model says the document does not address it.

**Soft grounding** (appropriate for research synthesis, summarization): The model is allowed to make reasonable inferences from document content, but must distinguish between direct statements and inferences.

Specify which mode you are using in the prompt. For soft grounding:
```
You may make reasonable inferences from document content, but you must 
clearly distinguish inferences from direct statements. Use "The document 
states..." for direct quotes and "Based on [specific passage], it appears 
that..." for inferences.
```

### Citation Quality

Citations are only useful if they are traceable. Design your citation format with traceability in mind:

**Unusable citation**: "According to the document, the deadline is March 15."

**Usable citation**: "The deadline is March 15 [DOC-1, Section 4.2: 'All submissions are due no later than March 15, 2026.']"

For structured JSON output, include the verbatim source text in the citation object. This allows downstream systems to verify the citation without re-querying the model.

### Handling Long Document Pipelines

For document analysis at scale (many documents or very long documents), implement a two-stage pipeline:

**Stage 1 — Retrieval**: Identify the most relevant sections of each document using embedding similarity or keyword extraction.

**Stage 2 — Analysis**: Inject only the retrieved sections into the analysis prompt, along with their source references.

This keeps the analysis prompt within the model's effective reasoning window and reduces cost per call significantly. The single-prompt approach works for documents under 40,000 tokens; pipeline is required above that.
