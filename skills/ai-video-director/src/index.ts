/**
 * AI Video Director — primary entry point.
 * Builds, optimises, and sequences AI video prompts across multiple models.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type VideoModel = 'seedance' | 'veo' | 'kling' | 'sora' | 'higgsfield' | 'runway';

export type ProductionFormat =
  | 'cinematic'
  | 'reels'
  | 'commercial'
  | 'product-video'
  | 'music-video';

export type CameraMovement =
  | 'static'
  | 'dolly-in'
  | 'dolly-out'
  | 'pan-left'
  | 'pan-right'
  | 'tilt-up'
  | 'tilt-down'
  | 'orbit'
  | 'handheld'
  | 'tracking'
  | 'crane-up'
  | 'crane-down';

export type CameraAngle =
  | 'eye-level'
  | 'low-angle'
  | 'high-angle'
  | 'bird\'s-eye'
  | 'dutch-angle'
  | 'worm\'s-eye';

export interface CameraConfig {
  movement?: CameraMovement;
  lens?: string;
  angle?: CameraAngle;
}

export interface CharacterConfig {
  description: string;
  seed?: number;
  referenceId?: string;
}

export interface StyleConfig {
  colorGrade?: string;
  filmStock?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '2.39:1' | '4:3';
  mood?: string;
}

export interface ShotConfig {
  model: VideoModel;
  format: ProductionFormat;
  scene: string;
  camera?: CameraConfig;
  lighting?: string;
  duration?: number;
  character?: CharacterConfig;
  style?: StyleConfig;
  negativePrompt?: string;
}

export interface SequenceShotConfig {
  scene: string;
  camera?: CameraConfig;
  lighting?: string;
  duration: number;
  style?: StyleConfig;
}

export interface SequenceConfig {
  model: VideoModel;
  format: ProductionFormat;
  shots: SequenceShotConfig[];
  character?: CharacterConfig;
  bpm?: number;
  beats?: number;
}

export interface BuiltShot {
  prompt: string;
  negativePrompt: string;
  model: VideoModel;
  duration: number;
  metadata: ShotMetadata;
}

export interface ShotMetadata {
  format: ProductionFormat;
  camera: Required<CameraConfig>;
  estimatedTokens: number;
}

export interface BuiltSequence {
  shots: BuiltShot[];
  totalDuration: number;
  model: VideoModel;
}

export interface ModelComparison {
  model: VideoModel;
  strengths: string[];
  weaknesses: string[];
  maxDuration: number;
  supportsNegativePrompt: boolean;
  supportsCharacterSeed: boolean;
  supportsImageToVideo: boolean;
  supportsVideoToVideo: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_SCENE_LENGTH = 500;

const MODEL_LIMITS: Record<VideoModel, { minDuration: number; maxDuration: number }> = {
  seedance:   { minDuration: 3, maxDuration: 10 },
  veo:        { minDuration: 3, maxDuration: 8  },
  kling:      { minDuration: 3, maxDuration: 10 },
  sora:       { minDuration: 3, maxDuration: 20 },
  higgsfield: { minDuration: 2, maxDuration: 8  },
  runway:     { minDuration: 4, maxDuration: 16 },
};

const MODEL_CAPABILITIES: Record<VideoModel, Omit<ModelComparison, 'model'>> = {
  seedance: {
    strengths: ['fast generation', 'physics accuracy', 'realistic motion', 'prompt adherence'],
    weaknesses: ['limited style control', 'no negative prompt'],
    maxDuration: 10,
    supportsNegativePrompt: false,
    supportsCharacterSeed: false,
    supportsImageToVideo: true,
    supportsVideoToVideo: false,
  },
  veo: {
    strengths: ['cinematic quality', 'long duration', 'instruction following', 'spatial consistency'],
    weaknesses: ['slower generation', 'limited availability'],
    maxDuration: 8,
    supportsNegativePrompt: false,
    supportsCharacterSeed: false,
    supportsImageToVideo: true,
    supportsVideoToVideo: false,
  },
  kling: {
    strengths: ['character consistency', 'face preservation', 'motion quality', 'Asian aesthetics'],
    weaknesses: ['English prompts less optimal', 'slower at high resolutions'],
    maxDuration: 10,
    supportsNegativePrompt: true,
    supportsCharacterSeed: true,
    supportsImageToVideo: true,
    supportsVideoToVideo: true,
  },
  sora: {
    strengths: ['longest clips', 'world consistency', 'creative freedom', 'text rendering'],
    weaknesses: ['limited commercial access', 'physics inconsistencies'],
    maxDuration: 20,
    supportsNegativePrompt: false,
    supportsCharacterSeed: false,
    supportsImageToVideo: true,
    supportsVideoToVideo: false,
  },
  higgsfield: {
    strengths: ['lip sync', 'dialogue generation', 'character animation', 'human motion'],
    weaknesses: ['short clips', 'narrow style range'],
    maxDuration: 8,
    supportsNegativePrompt: false,
    supportsCharacterSeed: true,
    supportsImageToVideo: true,
    supportsVideoToVideo: true,
  },
  runway: {
    strengths: ['style control', 'video-to-video', 'colour grading', 'motion brush'],
    weaknesses: ['shorter free clips', 'photorealism ceiling'],
    maxDuration: 16,
    supportsNegativePrompt: true,
    supportsCharacterSeed: false,
    supportsImageToVideo: true,
    supportsVideoToVideo: true,
  },
};

const FORMAT_PREFIXES: Record<ProductionFormat, string> = {
  'cinematic':      'Cinematic shot,',
  'reels':          'Vertical social media video,',
  'commercial':     'Professional commercial,',
  'product-video':  'Clean product shot,',
  'music-video':    'Music video scene,',
};

// ─── Validation ──────────────────────────────────────────────────────────────

function assertValidModel(model: unknown): asserts model is VideoModel {
  const valid: VideoModel[] = ['seedance', 'veo', 'kling', 'sora', 'higgsfield', 'runway'];
  if (!valid.includes(model as VideoModel)) {
    throw new Error(`INVALID_MODEL: "${String(model)}" is not supported. Use one of: ${valid.join(', ')}.`);
  }
}

function assertValidFormat(format: unknown): asserts format is ProductionFormat {
  const valid: ProductionFormat[] = ['cinematic', 'reels', 'commercial', 'product-video', 'music-video'];
  if (!valid.includes(format as ProductionFormat)) {
    throw new Error(`INVALID_FORMAT: "${String(format)}" is not recognised. Use one of: ${valid.join(', ')}.`);
  }
}

function assertSceneLength(scene: string): void {
  if (scene.length > MAX_SCENE_LENGTH) {
    throw new Error(`SCENE_TOO_LONG: Scene is ${scene.length} characters; maximum is ${MAX_SCENE_LENGTH}.`);
  }
}

function assertDurationInRange(model: VideoModel, duration: number): void {
  const { minDuration, maxDuration } = MODEL_LIMITS[model];
  if (duration < minDuration || duration > maxDuration) {
    throw new Error(
      `DURATION_OUT_OF_RANGE: ${model} supports ${minDuration}–${maxDuration}s; got ${duration}s.`,
    );
  }
}

// ─── Prompt Builders ─────────────────────────────────────────────────────────

function buildCameraClause(camera: Required<CameraConfig>): string {
  return `${camera.movement} movement, ${camera.lens} lens, ${camera.angle}`;
}

function buildStyleClause(style: StyleConfig): string {
  const parts: string[] = [];
  if (style.colorGrade)  parts.push(style.colorGrade);
  if (style.filmStock)   parts.push(`${style.filmStock} film`);
  if (style.mood)        parts.push(style.mood);
  if (style.aspectRatio) parts.push(`${style.aspectRatio} aspect ratio`);
  return parts.join(', ');
}

function buildCharacterClause(character: CharacterConfig): string {
  return `Character: ${character.description}`;
}

function assemblePrompt(config: ShotConfig, camera: Required<CameraConfig>): string {
  const parts: string[] = [FORMAT_PREFIXES[config.format]];
  parts.push(buildCameraClause(camera));
  if (config.scene)               parts.push(config.scene);
  if (config.lighting)            parts.push(`Lighting: ${config.lighting}`);
  if (config.character)           parts.push(buildCharacterClause(config.character));
  if (config.style)               parts.push(buildStyleClause(config.style));
  return parts.filter(Boolean).join('. ');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Constructs a model-optimised prompt for a single video shot. */
function buildShot(config: ShotConfig): BuiltShot {
  assertValidModel(config.model);
  assertValidFormat(config.format);
  assertSceneLength(config.scene);

  const duration = config.duration ?? 5;
  assertDurationInRange(config.model, duration);

  const camera: Required<CameraConfig> = {
    movement: config.camera?.movement ?? 'static',
    lens:     config.camera?.lens     ?? '50mm',
    angle:    config.camera?.angle    ?? 'eye-level',
  };

  const prompt = assemblePrompt(config, camera);
  const negativePrompt = MODEL_CAPABILITIES[config.model].supportsNegativePrompt
    ? (config.negativePrompt ?? '')
    : '';

  return {
    prompt,
    negativePrompt,
    model:    config.model,
    duration,
    metadata: {
      format:          config.format,
      camera,
      estimatedTokens: Math.ceil(prompt.split(' ').length * 1.3),
    },
  };
}

/** Constructs a sequenced set of shots, validating total duration consistency. */
function buildSequence(config: SequenceConfig): BuiltSequence {
  assertValidModel(config.model);
  assertValidFormat(config.format);

  const shots = config.shots.map((s) =>
    buildShot({
      model:     config.model,
      format:    config.format,
      scene:     s.scene,
      camera:    s.camera,
      lighting:  s.lighting,
      duration:  s.duration,
      character: config.character,
      style:     s.style,
    }),
  );

  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0);

  return { shots, totalDuration, model: config.model };
}

/** Returns a stripped, token-efficient version of a prompt for constrained models. */
function optimisePrompt(prompt: string, maxTokens: number): string {
  const words = prompt.split(/\s+/);
  if (words.length <= maxTokens) return prompt;
  return words.slice(0, maxTokens).join(' ');
}

/** Returns a comparison matrix for the given models, or all models if none specified. */
function compareModels(models?: VideoModel[]): ModelComparison[] {
  const targets = models ?? (Object.keys(MODEL_CAPABILITIES) as VideoModel[]);
  targets.forEach(assertValidModel);
  return targets.map((m) => ({ model: m, ...MODEL_CAPABILITIES[m] }));
}

// ─── Default Export ───────────────────────────────────────────────────────────

const director = { buildShot, buildSequence, optimisePrompt, compareModels };

export default director;
