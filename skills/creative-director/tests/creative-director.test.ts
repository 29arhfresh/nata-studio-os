/**
 * Tests for Creative Director Skill.
 */

import director, {
  buildCreativeBrief,
  buildMoodboard,
  buildArtDirection,
  scoreCreative,
} from '../src/index';

// ─── buildCreativeBrief ──────────────────────────────────────────────────────

describe('buildCreativeBrief', () => {
  const baseInput = {
    brand: 'Test Brand',
    objective: 'Launch a new product to a global audience.',
    tone: ['minimal', 'sophisticated'],
    deliverables: ['hero-image' as const],
  };

  it('returns a valid creative brief for minimal input', () => {
    const brief = buildCreativeBrief(baseInput);
    expect(brief.brand).toBe('Test Brand');
    expect(brief.deliverables).toContain('hero-image');
    expect(brief.colorStrategy.primary).toBeTruthy();
    expect(brief.storytellingAngle).toBeTruthy();
  });

  it('returns correct composition principle for first deliverable', () => {
    const brief = buildCreativeBrief(baseInput);
    expect(brief.compositionPrinciple).toBe('negative-space');
  });

  it('respects mandatory colors from constraints', () => {
    const brief = buildCreativeBrief({
      ...baseInput,
      constraints: { mandatoryColors: ['#FF0000', '#00FF00'], forbiddenElements: [] },
    });
    expect(brief.colorStrategy.primary).toBe('#FF0000');
    expect(brief.colorStrategy.accent).toBe('#00FF00');
  });

  it('includes references when provided', () => {
    const brief = buildCreativeBrief({ ...baseInput, references: ['Celine SS23'] });
    expect(brief.references).toContain('Celine SS23');
  });

  it('defaults references to empty array when omitted', () => {
    const brief = buildCreativeBrief(baseInput);
    expect(brief.references).toEqual([]);
  });

  it('derives sophisticated typography for sophisticated tone', () => {
    const brief = buildCreativeBrief({ ...baseInput, tone: ['sophisticated'] });
    expect(brief.typographyGuidance.primary).toBe('Didot');
  });

  it('throws OBJECTIVE_TOO_LONG when objective exceeds 300 chars', () => {
    expect(() =>
      buildCreativeBrief({ ...baseInput, objective: 'x'.repeat(301) }),
    ).toThrow('OBJECTIVE_TOO_LONG');
  });

  it('throws INVALID_TONE for a tone with a digit', () => {
    expect(() =>
      buildCreativeBrief({ ...baseInput, tone: ['minimal', 'bold2'] }),
    ).toThrow('INVALID_TONE');
  });

  it('throws MISSING_DELIVERABLE when deliverables array is empty', () => {
    expect(() =>
      buildCreativeBrief({ ...baseInput, deliverables: [] }),
    ).toThrow('MISSING_DELIVERABLE');
  });

  it('throws INVALID_DELIVERABLE for an unrecognised deliverable', () => {
    expect(() =>
      buildCreativeBrief({ ...baseInput, deliverables: ['poster' as never] }),
    ).toThrow('INVALID_DELIVERABLE');
  });

  it('throws MANDATORY_COLOR_INVALID for a malformed hex color', () => {
    expect(() =>
      buildCreativeBrief({
        ...baseInput,
        constraints: { mandatoryColors: ['red'], forbiddenElements: [] },
      }),
    ).toThrow('MANDATORY_COLOR_INVALID');
  });
});

// ─── buildMoodboard ──────────────────────────────────────────────────────────

describe('buildMoodboard', () => {
  const baseInput = {
    concept: 'Memory of light at dusk',
    mood: ['golden', 'quiet'],
  };

  it('returns a valid moodboard for minimal input', () => {
    const board = buildMoodboard(baseInput);
    expect(board.concept).toBe('Memory of light at dusk');
    expect(board.format).toBe('digital');
    expect(board.referenceCategories.length).toBeGreaterThan(0);
  });

  it('uses provided palette when specified', () => {
    const palette = { primary: '#000000', accent: '#FFFFFF', neutral: '#888888', rationale: 'test' };
    const board = buildMoodboard({ ...baseInput, palette });
    expect(board.palette.primary).toBe('#000000');
  });

  it('defaults to digital format when omitted', () => {
    const board = buildMoodboard(baseInput);
    expect(board.format).toBe('digital');
  });

  it('accepts print format', () => {
    const board = buildMoodboard({ ...baseInput, format: 'print' });
    expect(board.format).toBe('print');
  });

  it('throws MOOD_COUNT_OUT_OF_RANGE for fewer than 2 mood keywords', () => {
    expect(() => buildMoodboard({ ...baseInput, mood: ['golden'] })).toThrow('MOOD_COUNT_OUT_OF_RANGE');
  });

  it('throws MOOD_COUNT_OUT_OF_RANGE for more than 8 mood keywords', () => {
    expect(() =>
      buildMoodboard({ ...baseInput, mood: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] }),
    ).toThrow('MOOD_COUNT_OUT_OF_RANGE');
  });

  it('throws when concept exceeds 200 characters', () => {
    expect(() =>
      buildMoodboard({ ...baseInput, concept: 'x'.repeat(201) }),
    ).toThrow('OBJECTIVE_TOO_LONG');
  });
});

// ─── buildArtDirection ───────────────────────────────────────────────────────

describe('buildArtDirection', () => {
  const brief = buildCreativeBrief({
    brand: 'Test Brand',
    objective: 'Launch campaign.',
    tone: ['minimal'],
    deliverables: ['hero-image'],
  });

  it('returns art direction with correct deliverable type', () => {
    const dir = buildArtDirection({ brief, deliverableType: 'hero-image' });
    expect(dir.deliverableType).toBe('hero-image');
  });

  it('uses provided composition rule', () => {
    const dir = buildArtDirection({ brief, deliverableType: 'hero-image', compositionRule: 'symmetry' });
    expect(dir.compositionRule).toBe('symmetry');
  });

  it('falls back to brief composition principle when no rule provided', () => {
    const dir = buildArtDirection({ brief, deliverableType: 'hero-image' });
    expect(dir.compositionRule).toBe(brief.compositionPrinciple);
  });

  it('includes color application in output', () => {
    const dir = buildArtDirection({ brief, deliverableType: 'hero-image' });
    expect(dir.colorApplication).toContain(brief.colorStrategy.primary);
  });

  it('throws INVALID_COMPOSITION_RULE for unsupported rule', () => {
    expect(() =>
      buildArtDirection({ brief, deliverableType: 'hero-image', compositionRule: 'diagonal' as never }),
    ).toThrow('INVALID_COMPOSITION_RULE');
  });
});

// ─── scoreCreative ───────────────────────────────────────────────────────────

describe('scoreCreative', () => {
  const perfectInput = {
    deliverable: 'hero-image' as const,
    brandAlignment: 10 as const,
    compositionQuality: 10 as const,
    colorConsistency: 10 as const,
    storytellingClarity: 10 as const,
    technicalExecution: 10 as const,
  };

  it('returns Exceptional grade for all-10 scores', () => {
    const result = scoreCreative(perfectInput);
    expect(result.grade).toBe('Exceptional');
    expect(result.total).toBe(100);
  });

  it('returns Reject grade for all-1 scores', () => {
    const result = scoreCreative({
      ...perfectInput,
      brandAlignment: 1,
      compositionQuality: 1,
      colorConsistency: 1,
      storytellingClarity: 1,
      technicalExecution: 1,
    });
    expect(result.grade).toBe('Reject');
  });

  it('includes all five dimensions in output', () => {
    const result = scoreCreative(perfectInput);
    expect(Object.keys(result.dimensions)).toHaveLength(5);
  });

  it('recommendation contains "Approve" for Exceptional grade', () => {
    const result = scoreCreative(perfectInput);
    expect(result.recommendation).toContain('Approve');
  });

  it('recommendation contains "Revise" for low scores', () => {
    const result = scoreCreative({
      ...perfectInput,
      brandAlignment: 2,
      compositionQuality: 2,
      colorConsistency: 2,
      storytellingClarity: 2,
      technicalExecution: 2,
    });
    expect(result.recommendation).toContain('Revise');
  });

  it('throws INVALID_SCORE for score below 1', () => {
    expect(() =>
      scoreCreative({ ...perfectInput, brandAlignment: 0 as never }),
    ).toThrow('INVALID_SCORE');
  });

  it('throws INVALID_SCORE for score above 10', () => {
    expect(() =>
      scoreCreative({ ...perfectInput, compositionQuality: 11 as never }),
    ).toThrow('INVALID_SCORE');
  });

  it('throws INVALID_SCORE for non-integer score', () => {
    expect(() =>
      scoreCreative({ ...perfectInput, colorConsistency: 7.5 as never }),
    ).toThrow('INVALID_SCORE');
  });
});

// ─── Default export ───────────────────────────────────────────────────────────

describe('default export', () => {
  it('exposes all four public functions', () => {
    expect(typeof director.buildCreativeBrief).toBe('function');
    expect(typeof director.buildMoodboard).toBe('function');
    expect(typeof director.buildArtDirection).toBe('function');
    expect(typeof director.scoreCreative).toBe('function');
  });
});
