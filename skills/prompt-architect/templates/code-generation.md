# Template: Code Generation

Use when the task requires producing syntactically correct, functionally sound code, SQL, configuration, or other formal syntax that will be executed or deployed.

**Typical tasks**: SQL query generation, function scaffolding, configuration file generation, data transformation scripts, API request/response generation, test case generation

---

## When to Use This Template

Code generation is the right pattern when:

- The output must be syntactically valid and directly executable
- The output format is a formal language with a parser (SQL, Python, JSON Schema, YAML, regex)
- Correctness can be verified by running the output, not just reading it
- The model must produce consistent syntax across variable inputs

Do not use this template when:

- The task is code explanation or review (use document-analysis template)
- The task is generating prose with code examples embedded (use role-persona or structured-output template)
- The generated code will be executed without human review in a security-sensitive context — this requires application-layer sandboxing that no prompt can substitute

---

## Template

```
You are a [language/domain] code generator. Your job is to produce [specific 
output type — a SQL SELECT query, a Python function, a YAML config, etc.] 
that satisfies the provided specification.

## Language and Version

Target language/environment: [Python 3.12 | PostgreSQL 15 | Node.js 22 | etc.]
Style guide: [PEP 8 | Airbnb | Google | project-specific]
Libraries available: [list explicitly — do not assume or import libraries not listed]
Libraries forbidden: [list any that must not be used]

## Output Rules

ALWAYS: Produce only the requested code. No explanation, no prose, no markdown 
fences unless specified below.
ALWAYS: [Language-specific rule 1 — e.g., "Use type hints on all function signatures"]
ALWAYS: [Language-specific rule 2 — e.g., "Add a docstring to every function"]
NEVER: [Language-specific prohibition — e.g., "Never use SELECT * in SQL"]
NEVER: [Security rule — e.g., "Never hardcode credentials, connection strings, or secrets"]
NEVER: [Scope rule — e.g., "Never produce DML or DDL statements"]

IF the specification is ambiguous: choose the most conservative, least surprising 
interpretation and add a comment: # Assumption: [brief description]
IF the specification cannot be satisfied with the available libraries or language 
version: produce a comment explaining the limitation and provide the closest 
possible alternative.

## Output Format

[Choose one:]

**Raw code**: Return the code only. No markdown fences, no explanation.

**Code in JSON envelope**: Return valid JSON:
{
  "code": "[complete code as a JSON string with \\n for newlines]",
  "language": "[language name]",
  "dependencies": ["[any imports or packages required]"],
  "assumptions": ["[any assumption made due to specification ambiguity]"],
  "warnings": ["[any potential issues the caller should be aware of]"]
}

**Annotated code**: Produce the code with inline comments on non-obvious decisions.
Limit comments to decisions that would surprise a senior [language] engineer.
Do not comment obvious operations.

## Specification

<spec>
{{code_specification}}
</spec>

[If schema or data structure is provided:]
<schema>
{{schema_or_data_structure}}
</schema>
```

---

## Filling the Template

### Language and Environment Precision

Specifying the language version is not optional. `Python` can mean 2.7 or 3.12, with dramatically different syntax and standard library availability. `SQL` can mean MySQL, PostgreSQL, SQLite, or BigQuery — each with different function names, join syntax, and type systems.

Common environment specifications:

```
# Python
Target: Python 3.12
Type hints: required (PEP 484)
Async: allowed where I/O bound
f-strings: required (no .format() or % formatting)
Match statements: allowed

# SQL
Target: PostgreSQL 15
CTEs: preferred over nested subqueries
Window functions: allowed
Dollar-quoted strings: use when embedding single quotes
Explicit JOIN syntax: required (no implicit comma-separated FROM)

# JavaScript/TypeScript  
Target: TypeScript 5.4, strict mode
Runtime: Node.js 22
Module system: ESM (import/export, not require)
Async: async/await (no .then() chains)
```

### Security Rules for Code Generation

Code generation has a higher security surface than other prompt types because the output is executed. These constraints must appear in every code generation prompt:

**Secret hygiene**:
```
NEVER: Hardcode credentials, API keys, passwords, or connection strings. 
Use environment variables or a secrets manager reference (os.environ['VAR_NAME']).
```

**Input handling**:
```
NEVER: Construct SQL queries through string concatenation or format strings. 
Use parameterized queries or prepared statements for all user-provided values.
```

**Scope restriction** (for SQL):
```
NEVER: Produce any statement that modifies, deletes, or creates database objects 
(INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE). SELECT only.
```

**Dependency restriction**:
```
Only import from: [explicit allowlist]. 
Never introduce a dependency not on this list.
```

### Specification Quality

The specification is what the model writes code against. A vague specification produces code that technically satisfies the words but not the intent.

**Weak specification**:
```
Write a function that processes user data.
```

**Strong specification**:
```
Write a Python 3.12 function with this signature:
  def normalize_email(email: str) -> str | None

Behavior:
- Strip leading and trailing whitespace
- Convert the local part (before @) to lowercase
- Preserve the domain part case as-is
- Return None if the input does not contain exactly one @ character
- Return None if the local part is empty after stripping
- Return None if the domain part does not contain at least one dot
- Do not validate domain existence (DNS lookup not required)
- Do not import any external libraries

Examples:
  normalize_email("  User@Example.COM  ") → "user@Example.COM"
  normalize_email("invalid-email") → None
  normalize_email("@nodomain.com") → None
```

### Testing Generated Code

Generated code should never be deployed without testing. For automated pipelines, define a validation stage:

**Stage 1: Syntax check** — Parse the code without executing it.
```python
import ast
try:
    ast.parse(generated_code)
except SyntaxError as e:
    # Retry with error in context
    ...
```

**Stage 2: Static analysis** — Run linters and type checkers.
- Python: `mypy`, `ruff`
- TypeScript: `tsc --noEmit`
- SQL: `sqlfluff lint`

**Stage 3: Functional test** — Run against known inputs with expected outputs.

**Stage 4: Security scan** — Run `bandit` (Python), `semgrep`, or equivalent static analysis security testing.

### Retry Protocol for Invalid Code

When generated code fails syntax checking:

```python
retry_prompt = f"""
The code you generated has a syntax error:
{error_message}

The code that failed:
{generated_code}

Produce a corrected version. Return only the corrected code with the same 
output format as before (no explanation, no prose).
"""
```

Retry once. If the retry also fails syntax checking, escalate to a human engineer — repeated failures indicate the specification is ambiguous or the task is outside the reliable capability of the model/prompt combination.
