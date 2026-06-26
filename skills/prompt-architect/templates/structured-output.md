# Template: Structured Output

Use when the task must produce machine-readable output in a fixed schema — JSON, XML, or another structured format — that will be parsed and consumed by downstream code.

**Typical tasks**: data extraction, classification with metadata, API response generation, database record creation, inter-service message production

---

## When to Use This Template

Structured output is required whenever:

- The output is consumed by code (not a human reader)
- The output must be consistently parseable across thousands of calls
- Downstream logic branches on specific output fields
- The output is stored in a database with a defined schema

---

## Template

```
You are [role]. Your job is to [objective in one sentence].

## Instructions

ALWAYS: [Behavioral constraint 1]
ALWAYS: [Behavioral constraint 2]
NEVER: [Behavioral constraint 3]
NEVER: [Behavioral constraint 4]

IF [edge case]: [handling instruction]
IF [another edge case]: [handling instruction]

## Output Format

Return valid [JSON | XML] only. No markdown fences. No prose before or after the [JSON | XML].

[Include the full schema with all required fields, their types, and valid values.
For optional fields, note that they are optional and what to use when absent (null vs. omit).]

Schema:
{
  "field_name": "[type — string | number | boolean | array | object] — [description]",
  "required_field": "string — required",
  "optional_field": "string | null — optional, set to null if not present in input",
  "enum_field": "[VALUE_A | VALUE_B | VALUE_C] — required",
  "numeric_field": "number — must be > 0",
  "array_field": [
    {
      "item_field": "string",
      "item_value": "number"
    }
  ]
}

## Example Output

[A complete, correct example output for a typical input. This is the canonical 
reference the model will use as its format ground truth. Make it perfect — 
wrong example outputs produce wrong model outputs.]

{
  "field_name": "example value",
  "required_field": "example required value",
  "optional_field": null,
  "enum_field": "VALUE_A",
  "numeric_field": 42,
  "array_field": [
    {"item_field": "example", "item_value": 1}
  ]
}

## Input

[Specify the input format and variable injection]
<input>
{{input}}
</input>
```

---

## Filling the Template

### Schema Design Principles

**Every field has a defined null behavior.** If a field may be absent from some inputs, specify whether to return `null` or omit the field entirely. Inconsistent null handling breaks downstream JSON processing.

```
// Required field — always present
"invoice_number": "string — required, set to null if no invoice number found"

// Optional field — only present when applicable
"discount_code": "string | null — null when no discount applied"
```

**Enum values are exhaustive.** If you define an enum, every valid input must map to one of the listed values. Include a catch-all (`OTHER`, `UNKNOWN`, `UNCLASSIFIED`) unless you can guarantee the input will always map to a known value.

**Array schemas are explicit.** For arrays, define the shape of each item in the array, not just the array type. An instruction like `"line_items": "array"` produces inconsistent item shapes across calls.

**Numbers are typed precisely.** Distinguish between `integer` and `float`. Specify constraints: "number — must be > 0", "integer — range 1–100". Models occasionally return strings that look like numbers; explicit type specification reduces this.

### Example Output Quality

The example output is the highest-fidelity instruction in a structured output prompt. The model treats it as the ground truth for format. Follow these rules:

- The example must be valid according to the schema — test it with a JSON parser before including it.
- Include at least one null field in the example (demonstrates null handling).
- Include at least one array with multiple items (demonstrates item schema).
- Do not use the same values in the example and in the field description — the model may copy them literally.

### Enforcing "No Markdown Fences"

Without explicit instruction, models wrap JSON output in triple-backtick fences:
```json
{ ... }
```

This breaks `JSON.parse()`. The instruction `"No markdown fences"` prevents this. Add it twice — once in the format section and once as a standalone instruction — for belt-and-suspenders reliability on high-volume deployments.

---

## Output Validation

Every caller of a structured output prompt must validate the output before use. Implement this in the application layer:

**Step 1: Parse**
```python
try:
    result = json.loads(model_output)
except json.JSONDecodeError:
    # Retry once; if it fails again, log and route to fallback
    ...
```

**Step 2: Validate schema**
Use a JSON Schema validator (e.g., `jsonschema` in Python, `ajv` in Node.js). The schema in the prompt should be duplicated in the validator.

**Step 3: Validate business rules**
Type validation catches structural errors. Business rule validation catches semantic errors:
- Enum values are in the allowed set
- Numeric fields are in the expected range
- Required fields are non-null
- Array fields have the expected item structure

**Step 4: Retry on validation failure**
On parse or validation failure, retry the model call once with an amended user turn that includes the error:

```
The previous response was invalid JSON. Error: [parse error].
Please respond with valid JSON matching this exact schema: [schema].
```

---

## Token Budget Notes

Structured output prompts use more input tokens than prose prompts due to schema definition and example inclusion. Typical overhead:

- Minimal schema (5 fields, no examples): +200–400 tokens
- Full schema with example output: +600–1,200 tokens
- Full schema with multiple few-shot examples: +1,500–3,000 tokens

Budget accordingly. For very high-volume, cost-sensitive workloads, consider reducing example count to 1 or using a compressed schema representation without field descriptions.
