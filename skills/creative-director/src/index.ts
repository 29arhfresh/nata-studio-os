/**
 * Creative Director — primary entry point.
 * Builds creative briefs, moodboards, art direction, and quality scores for all Nata Studio OS output.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type Deliverable = 'hero-image' | 'social-reels' | 'copy' | 'video' | 'moodboard';

export type MoodboardFormat = 'digital' | 'print';

export type CompositionRule =
  | 'rule-of-thirds'
  | 'golden-ratio'
  | 'symmetry'
  | 'negative-space'
  | 'leading-lines'
  | 'layered-depth';

/** Integer score 1–10. */
export type Score = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface AudienceConfig {
  ageRange: string;
  geography: string;
  interests: string[];
  income: 'low' | 'mid' | 'high' | 'ultra-high';
}

export interface CreativeConstraints {
  mandatoryColors: string[];
  forbiddenElements: string[];
}

export interface ColorPalette {
  primary: string;
  accent: string;
  neutral: string;
  rationale: string;
}

export interface TypographyGuide {
  primary: string;
  secondary: string;
  tertiary?: string;
}

export interface CreativeBriefInput {
  brand: string;
  objective: string;
  tone: string[];
  references?: string[];
  deliverables: Deliverable[];
  audience?: AudienceConfig;
  constraints?: CreativeConstraints;
}

export interface CreativeBrief {
  brand: string;
  objective: string;
  tone: string[];
  references: string[];
  deliverables: Deliverable[];
  audience: AudienceConfig | undefined;
  constraints: CreativeConstraints | undefined;
  colorStrategy: ColorPalette;
  typographyGuidance: TypographyGuide;
  compositionPrinciple: CompositionRule;
  storytellingAngle: string;
}

export interface MoodboardInput {
  concept: string;
  palette?: ColorPalette;
  typography?: TypographyGuide;
  mood: string[];
  format?: MoodboardFormat;
}

export interface Moodboard {
  concept: string;
  palette: ColorPalette;
  typography: TypographyGuide;
  mood: string[];
  format: MoodboardFormat;
  visualDirectionStatement: string;
  referenceCategories: string[];
}

export interface ArtDirectionInput {
  brief: CreativeBrief;
  deliverableType: Deliverable;
  compositionRule?: CompositionRule;
  lightingStyle?: string;
}

export interface ArtDirection {
  deliverableType: Deliverable;
  compositionRule: CompositionRule;
  lightingStyle: string;
  colorApplication: string;
  typographyApplication: string;
  moodStatement: string;
  technicalSpec: string;
}

export interface CreativeScoringInput {
  deliverable: Deliverable;
  brandAlignment: Score;
  compositionQuality: Score;
  colorConsistency: Score;
  storytellingClarity: Score;
  technicalExecution: Score;
}

export interface CreativeScore {
  deliverable: Deliverable;
  dimensions: Record<string, Score>;
  total: number;
  grade: 'Exceptional' | 'Strong' | 'Acceptable' | 'Needs Revision' | 'Reject';
  recommendation: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_OBJECTIVE_LENGTH = 300;
const MAX_CONCEPT_LENGTH = 200;
const MAX_TONE_LENGTH = 40;
const MIN_MOOD_COUNT = 2;
const MAX_MOOD_COUNT = 8;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const VALID_DELIVERABLES: Deliverable[] = [
  'hero-image',
  'social-reels',
  'copy',
  'video',
  'moodboard',
];

const VALID_COMPOSITION_RULES: CompositionRule[] = [
  'rule-of-thirds',
  'golden-ratio',
  'symmetry',
  'negative-space',
  'leading-lines',
  'layered-depth',
];

const SCORE_WEIGHTS: Record<string, number> = {
  brandAlignment:      0.30,
  compositionQuality:  0.20,
  colorConsistency:    0.20,
  storytellingClarity: 0.15,
  technicalExecution:  0.15,
};

const COMPOSITION_DEFAULTS: Record<Deliverable, CompositionRule> = {
  'hero-image':    'negative-space',
  'social-reels':  'rule-of-thirds',
  'copy':          'leading-lines',
  'video':         'rule-of-thirds',
  'moodboard':     'golden-ratio',
};

const TONE_TO_PALETTE: Record<string, Partial<ColorPalette>> = {
  'minimal':        { primary: '#1A1A1A', neutral: '#F5F0EB', accent: '#C9A96E' },
  'bold':           { primary: '#FF2D00', neutral: '#FFFFFF', accent: '#1A1A1A' },
  'earthy':         { primary: '#5C4A32', neutral: '#F0E8D5', accent: '#8B6F47' },
  'futuristic':     { primary: '#0A0A0F', neutral: '#E0E5F0', accent: '#00CFFF' },
  'romantic':       { primary: '#2B1A1A', neutral: '#FDF5F0', accent: '#C97B7B' },
  'clean':          { primary: '#FFFFFF', neutral: '#F2F2F2', accent: '#0066CC' },
  'sophisticated':  { primary: '#1A1A1A', neutral: '#F5F0EB', accent: '#C9A96E' },
};

// ─── Validation ──────────────────────────────────────────────────────────────

function assertObjectiveLength(objective: string): void {
  if (objective.length > MAX_OBJECTIVE_LENGTH) {
    throw new Error(
      `OBJECTIVE_TOO_LONG: Objective is ${objective.length} chars; maximum is ${MAX_OBJECTIVE_LENGTH}.`,
    );
  }
}

function assertValidTones(tone: string[]): void {
  for (const t of tone) {
    if (t.length > MAX_TONE_LENGTH || /\d/.test(t)) {
      throw new Error(
        `INVALID_TONE: "${t}" must be lowercase, max ${MAX_TONE_LENGTH} chars, no numbers.`,
      );
    }
  }
}

function assertValidDeliverables(deliverables: Deliverable[]): void {
  if (deliverables.length === 0) {
    throw new Error('MISSING_DELIVERABLE: At least one deliverable is required.');
  }
  for (const d of deliverables) {
    if (!VALID_DELIVERABLES.includes(d)) {
      throw new Error(
        `INVALID_DELIVERABLE: "${d}" is not recognised. Use one of: ${VALID_DELIVERABLES.join(', ')}.`,
      );
    }
  }
}

function assertValidScore(value: number, field: string): asserts value is Score {
  if (value < 1 || value > 10 || !Number.isInteger(value)) {
    throw new Error(`INVALID_SCORE: "${field}" must be an integer 1–10; got ${value}.`);
  }
}

function assertValidMoodCount(mood: string[]): void {
  if (mood.length < MIN_MOOD_COUNT || mood.length > MAX_MOOD_COUNT) {
    throw new Error(
      `MOOD_COUNT_OUT_OF_RANGE: Provide ${MIN_MOOD_COUNT}–${MAX_MOOD_COUNT} mood keywords; got ${mood.length}.`,
    );
  }
}

function assertValidCompositionRule(rule: string): asserts rule is CompositionRule {
  if (!VALID_COMPOSITION_RULES.includes(rule as CompositionRule)) {
    throw new Error(
      `INVALID_COMPOSITION_RULE: "${rule}" is not supported. Use one of: ${VALID_COMPOSITION_RULES.join(', ')}.`,
    );
  }
}

function assertValidHexColors(colors: string[]): void {
  for (const c of colors) {
    if (!HEX_COLOR_PATTERN.test(c)) {
      throw new Error(`MANDATORY_COLOR_INVALID: "${c}" is not a valid #RRGGBB hex color.`);
    }
  }
}

// ─── Strategy Builders ───────────────────────────────────────────────────────

function deriveColorStrategy(
  tone: string[],
  constraints?: CreativeConstraints,
): ColorPalette {
  const match = tone.find((t) => TONE_TO_PALETTE[t]);
  const base = match ? TONE_TO_PALETTE[match] : {};

  const primary  = constraints?.mandatoryColors[0] ?? base.primary  ?? '#1A1A1A';
  const accent   = constraints?.mandatoryColors[1] ?? base.accent   ?? '#C9A96E';
  const neutral  = base.neutral ?? '#F5F0EB';
  const rationale = `Palette derived from tone "${tone[0]}". Primary anchors brand authority; accent drives visual energy; neutral provides breathing room.`;

  return { primary, accent, neutral, rationale };
}

function deriveTypography(tone: string[]): TypographyGuide {
  if (tone.some((t) => ['sophisticated', 'luxury', 'editorial'].includes(t))) {
    return { primary: 'Didot', secondary: 'Helvetica Neue Light', tertiary: 'Garamond Italic' };
  }
  if (tone.some((t) => ['futuristic', 'tech', 'clean'].includes(t))) {
    return { primary: 'Neue Haas Grotesk', secondary: 'IBM Plex Mono' };
  }
  if (tone.some((t) => ['earthy', 'organic', 'artisan'].includes(t))) {
    return { primary: 'Freight Text', secondary: 'Aktiv Grotesk' };
  }
  return { primary: 'GT America', secondary: 'Canela Text' };
}

function deriveStorytellingAngle(objective: string, tone: string[]): string {
  const emotionalAnchor = tone[0] ?? 'compelling';
  const verbCount = (objective.match(/\b(launch|introduce|celebrate|inspire|redefine)\b/gi) ?? []).length;
  const angle = verbCount > 0
    ? `Narrative arc: transformation — before/after the brand encounter.`
    : `Narrative arc: aspiration — the world the audience wants to belong to.`;
  return `${angle} Emotional anchor: ${emotionalAnchor}. Lead with feeling, resolve with product truth.`;
}

function gradeScore(total: number): CreativeScore['grade'] {
  if (total >= 90) return 'Exceptional';
  if (total >= 75) return 'Strong';
  if (total >= 60) return 'Acceptable';
  if (total >= 45) return 'Needs Revision';
  return 'Reject';
}

function buildRecommendation(grade: CreativeScore['grade'], dimensions: Record<string, Score>): string {
  if (grade === 'Exceptional' || grade === 'Strong') {
    return 'Approve for production. No mandatory revisions.';
  }
  const weakest = Object.entries(dimensions).sort(([, a], [, b]) => a - b)[0];
  return `Revise before production. Priority: improve ${weakest[0]} (current score: ${weakest[1]}/10).`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Builds a structured creative brief from strategic inputs. */
export function buildCreativeBrief(input: CreativeBriefInput): CreativeBrief {
  assertObjectiveLength(input.objective);
  assertValidTones(input.tone);
  assertValidDeliverables(input.deliverables);

  if (input.constraints?.mandatoryColors) {
    assertValidHexColors(input.constraints.mandatoryColors);
  }

  const colorStrategy = deriveColorStrategy(input.tone, input.constraints);
  const typographyGuidance = deriveTypography(input.tone);
  const compositionPrinciple = COMPOSITION_DEFAULTS[input.deliverables[0]];
  const storytellingAngle = deriveStorytellingAngle(input.objective, input.tone);

  return {
    brand: input.brand,
    objective: input.objective,
    tone: input.tone,
    references: input.references ?? [],
    deliverables: input.deliverables,
    audience: input.audience,
    constraints: input.constraints,
    colorStrategy,
    typographyGuidance,
    compositionPrinciple,
    storytellingAngle,
  };
}

/** Builds a moodboard specification from concept and visual inputs. */
export function buildMoodboard(input: MoodboardInput): Moodboard {
  if (input.concept.length > MAX_CONCEPT_LENGTH) {
    throw new Error(
      `OBJECTIVE_TOO_LONG: Concept is ${input.concept.length} chars; maximum is ${MAX_CONCEPT_LENGTH}.`,
    );
  }
  assertValidMoodCount(input.mood);

  const palette = input.palette ?? {
    primary: '#1A1A1A',
    accent: '#C9A96E',
    neutral: '#F5F0EB',
    rationale: 'Default editorial palette.',
  };
  const typography = input.typography ?? { primary: 'Didot', secondary: 'Helvetica Neue Light' };
  const format = input.format ?? 'digital';

  const visualDirectionStatement = `${input.concept}. Mood: ${input.mood.join(', ')}. Color system anchored in ${palette.primary} with ${palette.accent} accent.`;

  const referenceCategories = ['Color & Light', 'Texture & Material', 'Composition', 'Typography', 'Talent & Casting'];

  return {
    concept: input.concept,
    palette,
    typography,
    mood: input.mood,
    format,
    visualDirectionStatement,
    referenceCategories,
  };
}

/** Builds art direction for a specific deliverable within a creative brief. */
export function buildArtDirection(input: ArtDirectionInput): ArtDirection {
  const rule = input.compositionRule ?? input.brief.compositionPrinciple;
  assertValidCompositionRule(rule);

  const lightingStyle = input.lightingStyle || 'Soft directional light from camera left, 5500K, diffused.';
  const { colorStrategy, typographyGuidance } = input.brief;

  const colorApplication = `Primary ${colorStrategy.primary} dominates backgrounds and typography. Accent ${colorStrategy.accent} reserved for focal points and calls to action. Neutral ${colorStrategy.neutral} provides visual rest.`;
  const typographyApplication = `${typographyGuidance.primary} for headlines and primary hierarchy. ${typographyGuidance.secondary} for body and secondary hierarchy.${typographyGuidance.tertiary ? ` ${typographyGuidance.tertiary} for editorial accents only.` : ''}`;
  const moodStatement = `Tone: ${input.brief.tone.join(', ')}. ${input.brief.storytellingAngle}`;
  const technicalSpec = `Deliverable: ${input.deliverableType}. Composition: ${rule}. Lighting: ${lightingStyle}`;

  return {
    deliverableType: input.deliverableType,
    compositionRule: rule,
    lightingStyle,
    colorApplication,
    typographyApplication,
    moodStatement,
    technicalSpec,
  };
}

/** Scores a creative deliverable across five quality dimensions and returns a weighted total. */
export function scoreCreative(input: CreativeScoringInput): CreativeScore {
  assertValidScore(input.brandAlignment, 'brandAlignment');
  assertValidScore(input.compositionQuality, 'compositionQuality');
  assertValidScore(input.colorConsistency, 'colorConsistency');
  assertValidScore(input.storytellingClarity, 'storytellingClarity');
  assertValidScore(input.technicalExecution, 'technicalExecution');

  const dimensions: Record<string, Score> = {
    brandAlignment:      input.brandAlignment,
    compositionQuality:  input.compositionQuality,
    colorConsistency:    input.colorConsistency,
    storytellingClarity: input.storytellingClarity,
    technicalExecution:  input.technicalExecution,
  };

  const total = Math.round(
    Object.entries(dimensions).reduce(
      (sum, [key, val]) => sum + val * (SCORE_WEIGHTS[key] ?? 0) * 10,
      0,
    ),
  );

  const grade = gradeScore(total);

  return {
    deliverable: input.deliverable,
    dimensions,
    total,
    grade,
    recommendation: buildRecommendation(grade, dimensions),
  };
}

// ─── Default Export ───────────────────────────────────────────────────────────

const director = { buildCreativeBrief, buildMoodboard, buildArtDirection, scoreCreative };

export default director;
