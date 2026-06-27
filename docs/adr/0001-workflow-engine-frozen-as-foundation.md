# ADR-0001: Workflow Engine v1.0 Frozen as Foundation of Nata Studio OS

**Status:** Accepted  
**Date:** 2026-06-27  
**Deciders:** Nata Studio OS — Principal Engineering  

---

## Context

The Workflow Engine (`skills/workflow-engine/`) reached v1.0 following a complete Phase A implementation and an independent Principal Engineer architecture review. The review assessed architecture, module boundaries, public API stability, dependency graph, extensibility, dependency injection, scalability, technical debt, and architectural risks.

The engine was found to be implementation-complete, structurally clean, and of sufficient quality to serve as the runtime foundation of Nata Studio OS. The review identified two open architectural questions (dependency injection at `run()` and handler serializability) and recommended they be answered before the API is locked. This ADR records the decision on those questions and establishes governance rules for the frozen core.

---

## Decision

**Workflow Engine v1.0 is approved as the permanent foundation of Nata Studio OS. The core is now frozen.**

### What "frozen" means

- The public API (`WorkflowDefinition`, `WorkflowRunOptions`, `WorkflowResult`, `ValidationResult`, `StepDefinition`, all named exports) is stable. No breaking changes without a new ADR.
- The seven core components (`EventBus`, `ContextStore`, `DataRouter`, `DagResolver`, `Scheduler`, `StepRunner`, and the `run()`/`validate()` orchestrator) are not to be modified during ordinary feature development.
- The internal execution model (sequential, fail-fast, in-process, synchronous EventBus) is the baseline. It is not to be changed speculatively.

### What "frozen" does not mean

- Bug fixes are permitted without a new ADR.
- Documentation improvements are permitted.
- New Skills or higher-level modules that consume the engine are unrestricted.
- Test additions that increase coverage are permitted.

---

## Rationale

The engine's strengths justify freezing rather than continuing to evolve it:

- Zero external runtime dependencies.
- Strict TypeScript throughout with comprehensive type coverage.
- 98.1% line coverage, 83.6% branch coverage across 79 tests.
- Clean dependency graph: no circular dependencies, all components independently instantiable.
- Honest, minimal scope. Phase A constraints are documented, not hidden.

The identified architectural gaps (no DI at `run()`, non-serializable definitions, dead API surface) are acknowledged as real. The decision to freeze nonetheless reflects a deliberate tradeoff: premature generalization of the engine is more dangerous than evolving it when a concrete limitation is encountered. Skills and higher-level modules provide the correct extension surface for the current product stage.

---

## Governance: Proposing a Core Modification

Any proposed change to the Workflow Engine core must include all four of the following before it will be considered:

1. **The concrete limitation encountered.** A specific, reproducible description of what the engine cannot do — not a theoretical future need.

2. **Why it cannot be solved externally.** Explanation of why a Skill, wrapper module, adapter, or higher-level orchestrator cannot satisfy the requirement without touching the engine core.

3. **The architectural impact.** A clear statement of what in the current public API or internal model would change, and which callers would be affected.

4. **A proposed ADR.** A draft of the decision record, following this document's format, submitted alongside the proposed modification.

Modifications that do not meet all four criteria will not be accepted.

---

## Known Constraints (Carried Forward from Architecture Review)

The following are documented properties of v1.0, not bugs. They are frozen alongside the engine. Future phases may address them — only when a concrete limitation is encountered and the governance process above is followed.

| Constraint | Detail |
|---|---|
| Sequential execution | Ready steps are awaited one at a time even if they could run in parallel. |
| In-process state | `ContextStore` and `stepOutputs` are in-memory Maps. No persistence, no crash recovery. |
| Non-serializable definitions | `StepHandler` is an embedded function reference. Definitions cannot be stored or transmitted. |
| Fail-fast semantics | First step failure terminates the entire workflow. No partial completion. |
| No cancellation | No mechanism to cancel an in-flight `run()` call. |
| No DI at `run()` | Component implementations are hardcoded. No substitution without modifying the engine. |
| Dead API surface | `WorkflowStatus: 'cancelled'` and `step:skipped` are typed but never produced by `run()`. |
| EventHandler exceptions propagate | A throwing `onEvent` callback will surface through `bus.emit()` into the execution loop. |

---

## Consequences

- Feature development for Nata Studio OS proceeds by building Skills and higher-level modules on top of the engine, not by extending it.
- The engine's public API is a stable contract. Consumers can depend on it without anticipating breaking changes.
- Future architectural needs (parallel execution, persistence, cancellation, distributed execution) will be addressed only when a concrete product requirement cannot be met externally, and only through the governance process above.
- The independent architecture review (2026-06-27) is the last architectural review of the engine core unless a modification is proposed.
