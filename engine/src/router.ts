import type { WorkflowContext } from './context';
import type { InputMap } from './types';
import { isLiteral } from './types';
import { makeError } from './errors';

function resolvePath(ctx: Readonly<WorkflowContext>, path: string): unknown {
  // The path namespace uses "workflow.*" for top-level context fields and
  // "steps.*" for step state — build an envelope that matches both prefixes.
  const envelope: Record<string, unknown> = {
    workflow: ctx,
    steps: ctx.steps,
  };

  const parts = path.split('.');
  let current: unknown = envelope;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function resolveInputMap(
  inputMap: InputMap,
  ctx: Readonly<WorkflowContext>,
  stepId: string,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(inputMap)) {
    if (isLiteral(value)) {
      resolved[field] = value.$literal;
      continue;
    }

    const result = resolvePath(ctx, value);
    if (result === undefined) {
      throw makeError(
        'MISSING_CONTEXT_PATH',
        stepId,
        `MISSING_CONTEXT_PATH: step "${stepId}" field "${field}" — path "${value}" resolved to undefined.`,
        { retryable: false },
      );
    }
    resolved[field] = result;
  }

  return resolved;
}
