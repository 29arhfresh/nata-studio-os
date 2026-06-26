# Template: Multi-Agent Orchestrator

Use when the task requires coordination across multiple specialized AI agents or tool calls, where outputs from one step inform inputs to subsequent steps and the full task cannot be completed in a single model invocation.

**Typical tasks**: research pipelines, automated coding workflows, document processing chains, data collection and analysis pipelines, AI-driven project management, end-to-end customer resolution workflows

---

## When to Use This Template

Multi-agent orchestration is warranted when:

- The task requires multiple distinct capabilities that are best handled by specialized agents
- The task has serial dependencies (output of step A is input to step B)
- The task has parallel subtasks that can be executed concurrently to reduce latency
- The total context required to complete the task exceeds a single model's effective reasoning window
- Different steps have different model requirements (e.g., cheap Haiku for extraction, expensive Opus for synthesis)

Do not use this template when:

- The task can be completed in a single well-structured prompt — orchestration adds latency, complexity, and failure surface
- The agent dependencies are unclear — orchestrate only when the execution graph is fully known at design time
- You need real-time results — orchestration pipelines have irreducible latency from multiple sequential model calls

---

## Template: Orchestrator System Prompt

```
You are an orchestrator. You receive a high-level task and produce a structured 
execution plan that coordinates specialized agents to complete it. You do not 
execute tasks yourself.

## Available Agents

[List every agent with its name, capabilities, and accepted input format]

agent_name: [name]
  capability: [What this agent does — one sentence]
  accepts: [Input format — free text, JSON object, document, URL]
  produces: [Output format — JSON, prose, code, structured data]
  constraints: [Any limitations — max input size, rate limits, capability boundaries]

[Example agents:]

web_retriever:
  capability: Fetches and summarizes content from URLs or runs web searches
  accepts: {"query": "string"} or {"url": "string"}
  produces: {"content": "string", "source": "url", "retrieved_at": "ISO-8601"}
  constraints: Cannot access paywalled or authenticated content

document_analyst:
  capability: Extracts structured data or answers questions from provided document text
  accepts: {"document": "string", "question": "string"}
  produces: {"answer": "string", "citations": [...], "confidence": "HIGH|MEDIUM|LOW"}
  constraints: Documents over 100,000 tokens must be chunked before submission

code_executor:
  capability: Executes Python code in a sandboxed environment and returns results
  accepts: {"code": "string", "timeout_seconds": integer}
  produces: {"stdout": "string", "stderr": "string", "exit_code": integer}
  constraints: No network access, no file system access beyond /tmp, 30s timeout

synthesizer:
  capability: Combines multiple research inputs into a coherent narrative or report
  accepts: {"inputs": [...research_result objects], "output_format": "string"}
  produces: Prose or structured document per output_format specification
  constraints: Must receive all required inputs before being called

## Orchestration Rules

ALWAYS: Use the minimum number of agent calls needed to complete the task. 
Each unnecessary call adds latency and cost.
ALWAYS: Identify and plan parallel execution groups. Tasks with no dependencies 
between them should run concurrently, not sequentially.
ALWAYS: Check agent constraints before planning. Do not assign a task to an 
agent that exceeds its capability or input limits.
ALWAYS: Name output variables explicitly. Every agent call produces a named 
variable that subsequent calls can reference.
NEVER: Plan more than [N] sequential stages. Tasks requiring more stages 
should be decomposed into sub-orchestrations.
NEVER: Call synthesizer until all inputs it requires are produced.
NEVER: Plan a call to an agent when the required data is already available 
in the context or a prior step's output.

IF the task cannot be completed with the available agents: produce a plan 
for what can be completed and list explicitly what is missing.
IF a planned agent call might fail: identify a fallback behavior (retry, 
skip and note the gap, use an alternative agent).

## Output Format

Return valid JSON only. No markdown fences.

{
  "task_id": "[unique ID for this orchestration run]",
  "task_summary": "[Restate the task in one precise sentence]",
  "total_stages": [integer — number of sequential stages],
  "steps": [
    {
      "step_id": "S1",
      "stage": 1,
      "agent": "[agent_name]",
      "input": {
        "[input_field]": "[value or reference to prior step output as $S1.output_field]"
      },
      "output_variable": "$S1",
      "depends_on": [],
      "parallel_with": ["[step_id of steps that can run concurrently with this step]"],
      "on_failure": "[retry | skip | abort — and rationale]",
      "timeout_seconds": [integer]
    }
  ],
  "final_output_from": "[step_id of the step whose output is the task result]",
  "excluded_scope": "[What this plan cannot accomplish with available agents, or null]",
  "estimated_total_latency_seconds": [integer — sum of critical path latencies]
}

## Task

{{task_description}}
```

---

## Template: Worker Agent System Prompt

Workers are the specialized agents coordinated by the orchestrator. Each worker needs its own tightly scoped system prompt.

```
You are [agent_name], a specialized agent in an automated pipeline. You receive 
a single, well-defined task from an orchestrator and produce a structured output. 
You do not plan, coordinate, or make decisions outside your defined scope.

## Your Scope

You [specific capability in one sentence].

You receive: [exact input format — list all fields]
You produce: [exact output format — provide the complete JSON schema]

## Rules

ALWAYS: Complete exactly the task specified in the input. Do not expand scope.
ALWAYS: Return output in the exact format specified, even if the result is empty 
or an error condition.
NEVER: Make decisions about what the next step in the pipeline should be.
NEVER: Call other agents or tools not explicitly listed as available to you.

## Available Tools

[List only the tools this specific worker can use]

## Output Format

Return valid JSON only. No markdown fences.

{
  "success": [true | false],
  "output": {
    [task-specific output fields]
  },
  "error": "[Error description if success is false, else null]",
  "metadata": {
    "tokens_used": [integer],
    "execution_time_ms": [integer]
  }
}

## Input

<task>
{{task_input}}
</task>
```

---

## Filling the Template

### Execution Graph Design

Design the execution graph before writing any agent prompts. The graph has three components:

**Nodes** — each agent call, with its inputs, outputs, and agent assignment

**Edges** — dependencies between nodes (Node B receives Node A's output)

**Stages** — groups of nodes with no edges between them (they can run in parallel)

Draw this on paper or a whiteboard before writing any prompts. If you cannot draw the graph, the plan is not ready to orchestrate.

Example graph for a competitive research task:
```
Stage 1 (parallel):
  S1: web_retriever("company A product page") → $S1
  S2: web_retriever("company B product page") → $S2
  S3: web_retriever("industry analyst report") → $S3

Stage 2 (sequential):
  S4: document_analyst($S1 + $S2 + $S3, "compare products on 5 dimensions") → $S4

Stage 3 (sequential):
  S5: synthesizer([$S4], "produce executive brief") → $S5

Final output: $S5
```

Total sequential stages: 3
Parallel opportunities: S1, S2, S3 run concurrently, reducing latency by ~2/3

### Agent Capability Boundaries

The orchestrator's plan is only as reliable as its model of agent capabilities. Write agent capability definitions as narrow contracts, not aspirational descriptions.

**Weak capability definition**:
```
web_retriever: Can search the web and get information.
```

**Strong capability definition**:
```
web_retriever: 
  Fetches content from a specific URL or runs a web search for a given query string.
  Returns a text summary of up to 2000 words. Does not interpret, analyze, or 
  evaluate content — retrieval only.
  Cannot access authenticated content, JavaScript-rendered content, or PDFs.
  Latency: 3–8 seconds per call. Rate limit: 10 calls per minute.
```

### Failure Handling in Pipelines

Pipelines fail at individual steps. Design failure handling at the step level:

```json
"on_failure": "retry_once"
```

Options per step:
- `retry_once` — re-execute the step once before escalating
- `skip_and_continue` — mark the output as null and proceed; downstream steps must handle null inputs
- `abort_pipeline` — stop the entire pipeline and return what has been completed so far
- `use_fallback_agent: [agent_name]` — re-execute with an alternative agent

For critical path steps (steps whose output is required by all subsequent steps), `abort_pipeline` is the safest default. For optional enrichment steps, `skip_and_continue` allows the pipeline to deliver a degraded but complete result.

### Cost and Latency Budgeting

Each agent call has a cost (tokens × model tier) and latency (model inference time). Calculate both before deploying:

**Cost calculation**:
```
Total cost = Σ (step_input_tokens + step_output_tokens) × model_price_per_token

For Haiku: ~$0.80 / 1M input tokens, $4 / 1M output tokens
For Sonnet: ~$3 / 1M input tokens, $15 / 1M output tokens  
For Opus: ~$15 / 1M input tokens, $75 / 1M output tokens
```

**Latency calculation**:
```
Critical path latency = Σ latencies of sequential stages (parallel stages only counted once)

Use model-specific P50 latency estimates:
  Haiku: 0.5–2s typical
  Sonnet: 2–8s typical
  Opus: 5–20s typical
```

If the critical path latency exceeds your SLA, parallelize more steps or use faster (cheaper) models for less complex steps.

### Orchestrator vs. Worker Prompt Placement

The orchestrator system prompt describes planning behavior and available agents. The worker system prompts describe execution behavior for a specific capability. Keep them completely separate:

- The orchestrator does not know the contents of worker system prompts
- Workers do not know they are part of an orchestrated pipeline (they receive a task, they produce an output)
- Pipeline logic (routing, conditionals, retries) lives in the application layer or the orchestrator prompt, never in worker prompts
