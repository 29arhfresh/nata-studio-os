/**
 * MemorySystemAdapter — bridges the Memory System Skill into the Integration Layer.
 *
 * Supported operations:
 *   store            — write a value to memory
 *   search           — semantic / hybrid memory search
 *   restore-context  — reconstruct context for a session or project
 *   handoff          — transfer memory keys between Skills
 */

import { AdapterError } from '../contracts/errors';
import { createResponse } from '../contracts/request';
import type { SkillRequest, SkillResponse } from '../contracts/request';
import type { ISkillAdapter } from '../invocation/types';
import type {
  IMemorySystem,
  MemoryContextRestoreOptions,
  MemoryHandoffOptions,
  MemorySearchQuery,
  MemoryStoreInput,
} from './types';

export type MemoryOperation =
  | 'store'
  | 'search'
  | 'restore-context'
  | 'handoff';

export class MemorySystemAdapter implements ISkillAdapter {
  readonly name = 'memory-system';

  constructor(private readonly skill: IMemorySystem) {}

  async invoke<TInput, TOutput>(
    request: SkillRequest<TInput>
  ): Promise<SkillResponse<TOutput>> {
    const start = Date.now();
    const op = request.operation as MemoryOperation;

    let output: unknown;
    try {
      output = this._dispatch(op, request.input);
    } catch (err) {
      throw new AdapterError(
        `MemorySystem operation "${op}" failed: ${err instanceof Error ? err.message : String(err)}`,
        request.requestId,
        err instanceof Error ? err : undefined
      );
    }

    return createResponse({
      request,
      output: output as TOutput,
      context: request.context,
      durationMs: Date.now() - start,
    });
  }

  private _dispatch(op: MemoryOperation, input: unknown): unknown {
    switch (op) {
      case 'store':
        return this.skill.store(input as MemoryStoreInput);
      case 'search':
        return this.skill.search(input as MemorySearchQuery);
      case 'restore-context':
        return this.skill.restoreContext(input as MemoryContextRestoreOptions);
      case 'handoff':
        return this.skill.handoff(input as MemoryHandoffOptions);
      default:
        throw new Error(`Unsupported MemorySystem operation: "${String(op)}"`);
    }
  }
}
