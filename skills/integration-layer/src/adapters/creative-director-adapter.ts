/**
 * CreativeDirectorAdapter — bridges the Creative Director Skill into the Integration Layer.
 *
 * Supported operations:
 *   build-brief       — generate a creative brief from brand inputs
 *   build-moodboard   — compose a visual moodboard
 *   build-art-direction — produce composition and lighting direction
 *   score-creative    — evaluate creative output across five dimensions
 */

import { AdapterError } from '../contracts/errors';
import { createResponse } from '../contracts/request';
import type { SkillRequest, SkillResponse } from '../contracts/request';
import type { ISkillAdapter } from '../invocation/types';
import type {
  ArtDirectionInput,
  CreativeBriefInput,
  CreativeScoringInput,
  ICreativeDirector,
  MoodboardInput,
} from './types';

export type CreativeOperation =
  | 'build-brief'
  | 'build-moodboard'
  | 'build-art-direction'
  | 'score-creative';

export class CreativeDirectorAdapter implements ISkillAdapter {
  readonly name = 'creative-director';

  constructor(private readonly skill: ICreativeDirector) {}

  async invoke<TInput, TOutput>(
    request: SkillRequest<TInput>
  ): Promise<SkillResponse<TOutput>> {
    const start = Date.now();
    const op = request.operation as CreativeOperation;

    let output: unknown;
    try {
      output = this._dispatch(op, request.input);
    } catch (err) {
      throw new AdapterError(
        `CreativeDirector operation "${op}" failed: ${err instanceof Error ? err.message : String(err)}`,
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

  private _dispatch(op: CreativeOperation, input: unknown): unknown {
    switch (op) {
      case 'build-brief':
        return this.skill.buildCreativeBrief(input as CreativeBriefInput);
      case 'build-moodboard':
        return this.skill.buildMoodboard(input as MoodboardInput);
      case 'build-art-direction':
        return this.skill.buildArtDirection(input as ArtDirectionInput);
      case 'score-creative':
        return this.skill.scoreCreative(input as CreativeScoringInput);
      default:
        throw new Error(`Unsupported CreativeDirector operation: "${String(op)}"`);
    }
  }
}

function _extractQualityScore(output: unknown): number | undefined {
  if (
    typeof output === 'object' &&
    output !== null &&
    'total' in output &&
    typeof (output as Record<string, unknown>).total === 'number'
  ) {
    return ((output as Record<string, unknown>).total as number) / 100;
  }
  return undefined;
}
