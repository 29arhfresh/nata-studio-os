import director, {
  type ShotConfig,
  type SequenceConfig,
} from '../src/index';

// ─── buildShot ───────────────────────────────────────────────────────────────

describe('buildShot', () => {
  const base: ShotConfig = {
    model: 'seedance',
    format: 'cinematic',
    scene: 'A wolf stands on a snow-covered mountain peak at dawn.',
    duration: 5,
  };

  it('returns a prompt string for a valid minimal config', () => {
    const shot = director.buildShot(base);
    expect(typeof shot.prompt).toBe('string');
    expect(shot.prompt.length).toBeGreaterThan(0);
  });

  it('includes the format prefix in the prompt', () => {
    const shot = director.buildShot(base);
    expect(shot.prompt).toMatch(/Cinematic shot/i);
  });

  it('includes camera movement in the prompt', () => {
    const shot = director.buildShot({ ...base, camera: { movement: 'dolly-in' } });
    expect(shot.prompt).toMatch(/dolly-in/i);
  });

  it('sets default duration to 5 when not specified', () => {
    const { duration: _, ...withoutDuration } = base;
    const shot = director.buildShot(withoutDuration as ShotConfig);
    expect(shot.duration).toBe(5);
  });

  it('suppresses negative prompt for models that do not support it', () => {
    const shot = director.buildShot({ ...base, model: 'seedance', negativePrompt: 'blurry' });
    expect(shot.negativePrompt).toBe('');
  });

  it('preserves negative prompt for models that support it', () => {
    const shot = director.buildShot({ ...base, model: 'kling', negativePrompt: 'blurry, distorted' });
    expect(shot.negativePrompt).toBe('blurry, distorted');
  });

  it('appends lighting clause when provided', () => {
    const shot = director.buildShot({ ...base, lighting: 'golden hour backlight' });
    expect(shot.prompt).toContain('golden hour backlight');
  });

  it('appends character clause when provided', () => {
    const shot = director.buildShot({
      ...base,
      character: { description: 'Woman with red hair', seed: 7 },
    });
    expect(shot.prompt).toContain('Woman with red hair');
  });

  it('throws INVALID_MODEL for an unknown model', () => {
    expect(() => director.buildShot({ ...base, model: 'fakemodel' as never }))
      .toThrow(/INVALID_MODEL/);
  });

  it('throws INVALID_FORMAT for an unknown format', () => {
    expect(() => director.buildShot({ ...base, format: 'podcast' as never }))
      .toThrow(/INVALID_FORMAT/);
  });

  it('throws SCENE_TOO_LONG when scene exceeds 500 characters', () => {
    expect(() => director.buildShot({ ...base, scene: 'a'.repeat(501) }))
      .toThrow(/SCENE_TOO_LONG/);
  });

  it('throws DURATION_OUT_OF_RANGE for seedance below minimum', () => {
    expect(() => director.buildShot({ ...base, duration: 1 }))
      .toThrow(/DURATION_OUT_OF_RANGE/);
  });

  it('throws DURATION_OUT_OF_RANGE for seedance above maximum', () => {
    expect(() => director.buildShot({ ...base, duration: 99 }))
      .toThrow(/DURATION_OUT_OF_RANGE/);
  });

  it('accepts maximum duration for sora', () => {
    const shot = director.buildShot({ ...base, model: 'sora', duration: 20 });
    expect(shot.duration).toBe(20);
  });

  it('includes estimated token count in metadata', () => {
    const shot = director.buildShot(base);
    expect(shot.metadata.estimatedTokens).toBeGreaterThan(0);
  });
});

// ─── buildSequence ───────────────────────────────────────────────────────────

describe('buildSequence', () => {
  const base: SequenceConfig = {
    model: 'kling',
    format: 'music-video',
    shots: [
      { scene: 'Singer on rooftop, neon city behind.', duration: 4 },
      { scene: 'Close-up of hands on synthesizer.', duration: 2 },
    ],
  };

  it('returns the correct number of shots', () => {
    const seq = director.buildSequence(base);
    expect(seq.shots).toHaveLength(2);
  });

  it('calculates total duration correctly', () => {
    const seq = director.buildSequence(base);
    expect(seq.totalDuration).toBe(6);
  });

  it('propagates character config to all shots', () => {
    const seq = director.buildSequence({
      ...base,
      character: { description: 'Man with silver jacket', seed: 3 },
    });
    seq.shots.forEach((s) => expect(s.prompt).toContain('Man with silver jacket'));
  });

  it('throws INVALID_MODEL when sequence model is invalid', () => {
    expect(() => director.buildSequence({ ...base, model: 'bogus' as never }))
      .toThrow(/INVALID_MODEL/);
  });
});

// ─── optimisePrompt ──────────────────────────────────────────────────────────

describe('optimisePrompt', () => {
  it('returns the prompt unchanged when under the token limit', () => {
    const prompt = 'Short prompt here.';
    expect(director.optimisePrompt(prompt, 100)).toBe(prompt);
  });

  it('truncates to maxTokens words when over the limit', () => {
    const prompt = 'one two three four five';
    expect(director.optimisePrompt(prompt, 3)).toBe('one two three');
  });

  it('returns empty string for empty input', () => {
    expect(director.optimisePrompt('', 50)).toBe('');
  });
});

// ─── compareModels ───────────────────────────────────────────────────────────

describe('compareModels', () => {
  it('returns all 6 models when no filter is given', () => {
    const result = director.compareModels();
    expect(result).toHaveLength(6);
  });

  it('returns only the requested models', () => {
    const result = director.compareModels(['runway', 'veo']);
    expect(result.map((r) => r.model).sort()).toEqual(['runway', 'veo'].sort());
  });

  it('includes strengths, weaknesses, and capability flags', () => {
    const [runway] = director.compareModels(['runway']);
    expect(runway.strengths.length).toBeGreaterThan(0);
    expect(runway.weaknesses.length).toBeGreaterThan(0);
    expect(typeof runway.supportsVideoToVideo).toBe('boolean');
  });

  it('throws INVALID_MODEL for an unknown model in the filter', () => {
    expect(() => director.compareModels(['unknown' as never]))
      .toThrow(/INVALID_MODEL/);
  });
});
