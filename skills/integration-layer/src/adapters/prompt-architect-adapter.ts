/**
 * PromptArchitectAdapter — bridges the Prompt Architect Skill into the Integration Layer.
 *
 * Supported operations:
 *   build-prompt     — assemble system + user prompts from a brief
 *   evaluate-prompt  — run test cases and produce an evaluation report
 *   compress-prompt  — reduce token count while preserving intent
 *   version-prompt   — apply semantic versioning to a prompt revision
 */

import { AdapterError } from '../contracts/errors';
import { createResponse } from '../contracts/request';
import type { SkillRequest, SkillResponse } from '../contracts/request';
import type { ISkillAdapter } from '../invocation/types';
import type { BuiltPrompt, IPromptArchitect, PromptBrief, TestCase } from './types';

export type PromptOperation =
  | 'build-prompt'
  | 'evaluate-prompt'
  | 'compress-prompt'
  | 'version-prompt';

export interface EvaluateInput {
  prompt: BuiltPrompt;
  testCases: TestCase[];
}

export interface CompressInput {
  text: string;
  maxTokens: number;
}

export interface VersionInput {
  prompt: BuiltPrompt;
  changeType: string;
  summary: string;
}

export class PromptArchitectAdapter implements ISkillAdapter {
  readonly name = 'prompt-architect';

  constructor(private readonly skill: IPromptArchitect) {}

  async invoke<TInput, TOutput>(
    request: SkillRequest<TInput>
  ): Promise<SkillResponse<TOutput>> {
    const start = Date.now();
    const op = request.operation as PromptOperation;

    let output: unknown;
    try {
      output = this._dispatch(op, request.input);
    } catch (err) {
      throw new AdapterError(
        `PromptArchitect operation "${op}" failed: ${err instanceof Error ? err.message : String(err)}`,
        request.requestId,
        err instanceof Error ? err : undefined
      );
    }

    const qualityScore = _extractQualityScore(output);

    return createResponse({
      request,
      output: output as TOutput,
      context: request.context,
      durationMs: Date.now() - start,
      qualityScore,
    });
  }

  private _dispatch(op: PromptOperation, input: unknown): unknown {
    switch (op) {
      case 'build-prompt':
        return this.skill.buildPrompt(input as PromptBrief);
      case 'evaluate-prompt': {
        const { prompt, testCases } = input as EvaluateInput;
        return this.skill.evaluatePrompt(prompt, testCases);
      }
      case 'compress-prompt': {
        const { text, maxTokens } = input as CompressInput;
        return this.skill.compressPrompt(text, maxTokens);
      }
      case 'version-prompt': {
        const { prompt, changeType, summary } = input as VersionInput;
        return this.skill.versionPrompt(prompt, changeType, summary);
      }
      default:
        throw new Error(`Unsupported PromptArchitect operation: "${String(op)}"`);
    }
  }
}

function _extractQualityScore(output: unknown): number | undefined {
  if (
    typeof output === 'object' &&
    output !== null &&
    'qualityScore' in output &&
    typeof (output as Record<string, unknown>).qualityScore === 'number'
  ) {
    return (output as Record<string, unknown>).qualityScore as number;
  }
  return undefined;
}
